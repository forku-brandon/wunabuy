import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { AuthenticatedRequest } from '../../shared/middleware/auth.middleware';
import { ValidationError } from '../../shared/errors/app-error';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.verifyOtp(req.body);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.refreshToken(req.body.refresh_token);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.requestPasswordReset(req.body);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  async resetPasswordConfirm(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.confirmPasswordReset(req.body);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  async socialLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.socialLogin(req.body);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.getUserProfile(req.user!.id);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  },
};
