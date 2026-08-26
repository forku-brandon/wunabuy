/**
 * Validate an email address format.
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate a product price (must be positive number).
 */
export function validatePrice(price: number): boolean {
  if (typeof price !== 'number' || isNaN(price)) return false;
  return price > 0;
}

/**
 * Validate product quantity (must be non-negative integer).
 */
export function validateQuantity(quantity: number): boolean {
  if (typeof quantity !== 'number' || isNaN(quantity)) return false;
  return Number.isInteger(quantity) && quantity >= 0;
}

/**
 * Validate OTP code (must be exactly 6 digits).
 */
export function validateOTP(otp: string): boolean {
  if (!otp || typeof otp !== 'string') return false;
  return /^\d{6}$/.test(otp);
}
