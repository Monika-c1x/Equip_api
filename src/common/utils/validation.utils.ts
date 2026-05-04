import { BadRequestException } from '@nestjs/common';

/**
 * Validation utility functions
 */
export class ValidationUtils {
  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate email or throw exception
   */
  static validateEmailOrThrow(email: string): void {
    if (!email || !this.validateEmail(email)) {
      throw new BadRequestException('Valid email address is required');
    }
  }

  /**
   * Validate OTP format (must be exactly 6 digits)
   */
  static validateOtp(otp: string): boolean {
    return /^\d{6}$/.test(otp);
  }

  /**
   * Validate OTP or throw exception
   */
  static validateOtpOrThrow(otp: string): void {
    if (!this.validateOtp(otp)) {
      throw new BadRequestException('OTP must be exactly 6 digits');
    }
  }

  /**
   * Validate UUID format
   */
  static validateUuid(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Validate UUID or throw exception
   */
  static validateUuidOrThrow(uuid: string, fieldName: string = 'ID'): void {
    if (!uuid || !this.validateUuid(uuid)) {
      throw new BadRequestException(`Valid ${fieldName} is required`);
    }
  }

  /**
   * Validate string length
   */
  static validateLength(
    value: string,
    minLength: number = 1,
    maxLength: number = 255,
  ): boolean {
    if (!value) return minLength === 0;
    return value.length >= minLength && value.length <= maxLength;
  }

  /**
   * Validate length or throw exception
   */
  static validateLengthOrThrow(
    value: string,
    fieldName: string,
    minLength: number = 1,
    maxLength: number = 255,
  ): void {
    if (!this.validateLength(value, minLength, maxLength)) {
      throw new BadRequestException(
        `${fieldName} must be between ${minLength} and ${maxLength} characters`,
      );
    }
  }

  /**
   * Sanitize email (lowercase and trim)
   */
  static sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  /**
   * Sanitize string input
   */
  static sanitizeString(value: string): string {
    if (!value) return '';
    return value.trim().replace(/\s+/g, ' ');
  }

  /**
   * Check if string is empty or whitespace
   */
  static isEmpty(value: string | null | undefined): boolean {
    return !value || value.trim().length === 0;
  }

  /**
   * Check if object is empty
   */
  static isEmptyObject(obj: any): boolean {
    return obj === null || obj === undefined || Object.keys(obj).length === 0;
  }

  /**
   * Normalize phone number (remove special characters)
   */
  static normalizePhoneNumber(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  /**
   * Validate phone number (basic, 10-15 digits)
   */
  static validatePhoneNumber(phone: string): boolean {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 15;
  }
}
