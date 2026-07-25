import { supabase } from '../../config/database';
import { redis } from '../../config/redis';
import { logger } from '../../config/logger';
import { env } from '../../config/env';
import { AuthError, ValidationError, NotFoundError } from '../../shared/errors/app-error';
import { generateOtp } from '../../shared/utils/crypto';
import { notificationService } from '../notification/notification.service';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { authSchema, otpSchema, loginSchema } from './auth.schema';

export const authService = {
  async register(data: any) {
    const validated = authSchema.parse(data);
    
    // Check if phone already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('phone', validated.phone)
      .single();
    
    if (existing) {
      throw new ValidationError('Phone number already registered');
    }

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        phone: validated.phone,
        email: validated.email,
        full_name: validated.full_name,
        role: validated.role,
        password_hash: validated.password ? await bcrypt.hash(validated.password, 12) : null,
      })
      .select()
      .single();

    if (error) throw new ValidationError(error.message);

    // Generate and store OTP
    const otp = generateOtp();
    await redis.set(`otp:${validated.phone}`, otp, 'EX', parseInt(env.OTP_TTL));
    
    // Send OTP via SMS
    await notificationService.sendSms(validated.phone, `Your Wunabuy verification code is: ${otp}`);

    logger.info({ userId: user.id, phone: validated.phone }, 'User registered, OTP sent');

    return {
      user_id: user.id,
      phone: validated.phone,
      otp_sent: true,
      otp_expires_in: parseInt(env.OTP_TTL),
    };
  },

  async verifyOtp(data: any) {
    const validated = otpSchema.parse(data);
    
    const storedOtp = await redis.get(`otp:${validated.phone}`);
    if (!storedOtp) {
      throw new AuthError('INVALID_CREDENTIALS', 'OTP expired or not found', 400);
    }

    // Track attempts
    const attemptsKey = `otp_attempts:${validated.phone}`;
    const attempts = await redis.incr(attemptsKey);
    await redis.expire(attemptsKey, parseInt(env.OTP_TTL));
    
    if (attempts > parseInt(env.OTP_MAX_ATTEMPTS)) {
      await redis.del(`otp:${validated.phone}`);
      throw new AuthError('INVALID_CREDENTIALS', 'Too many OTP attempts', 429);
    }

    if (storedOtp !== validated.otp) {
      throw new AuthError('INVALID_CREDENTIALS', 'Invalid OTP', 400);
    }

    // OTP valid - clean up
    await redis.del(`otp:${validated.phone}`);
    await redis.del(attemptsKey);

    // Get user
    const { data: user } = await supabase
      .from('users')
      .select()
      .eq('phone', validated.phone)
      .single();

    if (!user) throw new NotFoundError('User not found');

    // Mark phone verified
    await supabase
      .from('users')
      .update({ is_phone_verified: true, last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    // Create wallet for sellers
    if (user.role === 'seller') {
      await supabase.from('wallets').insert({ user_id: user.id });
    }

    // Generate tokens
    const accessToken = this.signAccessToken(user);
    const refreshToken = this.signRefreshToken(user);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 3600,
      user: {
        id: user.id,
        phone: user.phone,
        full_name: user.full_name,
        role: user.role,
        is_phone_verified: true,
      },
    };
  },

  async login(data: any) {
    const validated = loginSchema.parse(data);
    
    const { data: user } = await supabase
      .from('users')
      .select()
      .or(`phone.eq.${validated.phone || validated.email},email.eq.${validated.phone || validated.email}`)
      .single();

    if (!user) throw new AuthError('INVALID_CREDENTIALS', 'Invalid credentials', 401);
    if (user.status === 'suspended') throw new AuthError('FORBIDDEN', 'Account suspended', 403);

    if (user.password_hash) {
      const valid = await bcrypt.compare(validated.password, user.password_hash);
      if (!valid) throw new AuthError('INVALID_CREDENTIALS', 'Invalid credentials', 401);
    }

    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    const accessToken = this.signAccessToken(user);
    const refreshToken = this.signRefreshToken(user);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 3600,
      user: {
        id: user.id,
        phone: user.phone,
        full_name: user.full_name,
        role: user.role,
        is_phone_verified: user.is_phone_verified,
      },
    };
  },

  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as any;
      
      // Check if token is blacklisted
      const blacklisted = await redis.get(`blacklist:${refreshToken}`);
      if (blacklisted) throw new AuthError('TOKEN_INVALID', 'Token revoked', 401);

      const { data: user } = await supabase
        .from('users')
        .select()
        .eq('id', decoded.sub)
        .single();

      if (!user) throw new AuthError('TOKEN_INVALID', 'User not found', 401);

      // Rotate: blacklist old, issue new
      await redis.set(`blacklist:${refreshToken}`, '1', 'EX', 30 * 24 * 3600);
      
      const newAccessToken = this.signAccessToken(user);
      const newRefreshToken = this.signRefreshToken(user);

      return { access_token: newAccessToken, refresh_token: newRefreshToken, expires_in: 3600 };
    } catch (err) {
      if (err instanceof jwt.JsonWebTokenError) {
        throw new AuthError('TOKEN_INVALID', 'Invalid refresh token', 401);
      }
      throw err;
    }
  },

  async requestPasswordReset(data: any) {
    const { phone } = data;
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .single();

    if (user) {
      const otp = generateOtp();
      await redis.set(`otp:reset:${phone}`, otp, 'EX', parseInt(env.OTP_TTL));
      await notificationService.sendSms(phone, `Your Wunabuy password reset code is: ${otp}`);
    }

    return { otp_sent: true };
  },

  async confirmPasswordReset(data: any) {
    const { phone, otp, new_password } = data;
    
    const storedOtp = await redis.get(`otp:reset:${phone}`);
    if (!storedOtp || storedOtp !== otp) {
      throw new AuthError('INVALID_CREDENTIALS', 'Invalid or expired OTP', 400);
    }

    const hash = await bcrypt.hash(new_password, 12);
    await supabase.from('users').update({ password_hash: hash }).eq('phone', phone);
    await redis.del(`otp:reset:${phone}`);

    return { password_reset: true };
  },

  async socialLogin(data: any) {
    // TODO: Implement Google/Facebook social login verification
    throw new ValidationError('Social login not yet implemented');
  },

  async getUserProfile(userId: string) {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, phone, email, full_name, role, avatar_url, is_phone_verified, is_email_verified, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) throw new NotFoundError('User not found');
    return user;
  },

  signAccessToken(user: any): string {
    return jwt.sign(
      { sub: user.id, role: user.role, is_staff: false, phone_verified: user.is_phone_verified },
      env.JWT_SECRET,
      { expiresIn: env.JWT_ACCESS_TTL_MOBILE }
    );
  },

  signRefreshToken(user: any): string {
    return jwt.sign(
      { sub: user.id },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_TTL }
    );
  },
};
