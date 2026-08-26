/**
 * Represents the roles available for users in the platform.
 */
export enum UserRole {
  BUYER = 'buyer',
  SELLER = 'seller',
  TRANSPORTER = 'transporter',
  STAFF = 'staff',
}

/**
 * Status of the user's account.
 */
export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DEACTIVATED = 'deactivated',
}

/**
 * Represents a user's address.
 */
export interface Address {
  /** Unique UUID for the address */
  id: string;
  /** Label for the address, e.g., 'Home', 'Office' */
  label: string;
  /** Latitude coordinate */
  latitude: number;
  /** Longitude coordinate */
  longitude: number;
  /** Formatted address text */
  address_text: string;
  /** City where the address is located */
  city: string;
  /** Indicates if this is the default address */
  is_default: boolean;
}

/**
 * Represents a system user.
 */
export interface User {
  /** Unique UUID for the user */
  id: string;
  /** User's phone number */
  phone: string;
  /** User's email address, if provided */
  email: string | null;
  /** User's full name */
  full_name: string;
  /** Current active role for the user */
  role: UserRole;
  /** Account status */
  status: UserStatus;
  /** URL to the user's avatar image */
  avatar_url: string | null;
  /** Whether the user has verified their phone number */
  is_phone_verified: boolean;
  /** User's default address for deliveries */
  default_address: Address | null;
  /** List of roles the user can switch between */
  available_roles: UserRole[];
  /** ISO 8601 date string representing creation time */
  created_at: string;
  /** ISO 8601 date string representing the last update time */
  updated_at: string;
}

/**
 * State object representing authentication context.
 */
export interface AuthState {
  /** The currently authenticated user */
  user: User | null;
  /** Access token for API requests */
  accessToken: string | null;
  /** Refresh token for renewing session */
  refreshToken: string | null;
  /** The currently active role of the user */
  activeRole: UserRole;
  /** Indicates whether the user is authenticated */
  isAuthenticated: boolean;
  /** Indicates if authentication is currently processing */
  isLoading: boolean;
}

/**
 * Payload sent to request or verify an OTP.
 */
export interface OTPPayload {
  /** Phone number to send/verify the OTP */
  phone: string;
  /** The One-Time Password string */
  otp: string;
  /** Purpose of the OTP */
  purpose: 'registration' | 'login' | 'password_reset';
}

/**
 * Payload for registering a new user.
 */
export interface RegisterPayload {
  /** User's phone number */
  phone: string;
  /** User's full name */
  full_name: string;
  /** Desired role upon registration */
  role: 'buyer' | 'seller';
}

/**
 * Payload for logging in.
 */
export interface LoginPayload {
  /** User's phone number */
  phone: string;
}

/**
 * Response structure for successful authentication.
 */
export interface AuthResponse {
  /** JWT access token */
  access_token: string;
  /** Type of the token, usually 'Bearer' */
  token_type: string;
  /** Authenticated user details */
  user: User;
}

/**
 * Response when requesting an OTP.
 */
export interface OTPResponse {
  /** The target user's UUID */
  user_id: string;
  /** Target phone number */
  phone: string;
  /** Whether the OTP was successfully sent */
  otp_sent: boolean;
}
