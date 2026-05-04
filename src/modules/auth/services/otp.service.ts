import {
  Injectable,
  Inject,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import Redis from 'ioredis';
import * as bcrypt from 'bcrypt';

export interface OTPData {
  email: string;
  inviteToken: string;
  otpHash: string;
  attempts: number;
  createdAt: number;
}

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly OTP_TTL = 5 * 60; // 5 minutes in seconds
  private readonly MAX_ATTEMPTS = 3;

  constructor(@Inject('REDIS') private readonly redis: Redis) {}

  /**
   * Generate a 6-digit OTP
   */
  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Store OTP in Redis with TTL
   */
  async storeOtp(
    email: string,
    otp: string,
    inviteToken: string,
  ): Promise<string> {
    try {
      const otpHash = await bcrypt.hash(otp, 10);
      const sessionId = `otp:${email}:${Date.now()}`;

      const otpData: OTPData = {
        email,
        inviteToken,
        otpHash,
        attempts: 0,
        createdAt: Date.now(),
      };

      await this.redis.setex(sessionId, this.OTP_TTL, JSON.stringify(otpData));

      // Also create a reverse mapping for quick lookup
      await this.redis.setex(`otp:email:${email}`, this.OTP_TTL, sessionId);

      this.logger.log(
        `OTP stored successfully for email ${email}, sessionId: ${sessionId}`,
      );
      return sessionId;
    } catch (error) {
      this.logger.error(`Failed to store OTP for email ${email}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve OTP data from Redis
   */
  async getOtpData(sessionId: string): Promise<OTPData | null> {
    try {
      const data = await this.redis.get(sessionId);

      if (!data) {
        this.logger.warn(`OTP not found for sessionId ${sessionId}`);
        return null;
      }

      return JSON.parse(data) as OTPData;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve OTP data for sessionId ${sessionId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Verify OTP against the hash stored in Redis
   */
  async verifyOtp(sessionId: string, otp: string): Promise<boolean> {
    try {
      const otpData = await this.getOtpData(sessionId);

      if (!otpData) {
        throw new BadRequestException('OTP expired or not found');
      }

      // Check attempt limit
      if (otpData.attempts >= this.MAX_ATTEMPTS) {
        await this.redis.del(sessionId);
        throw new BadRequestException('Maximum OTP attempts exceeded');
      }

      // Check if OTP is already used (marked as verified)
      const isVerified = await this.isOtpVerified(sessionId);
      if (isVerified) {
        throw new BadRequestException('OTP already used');
      }

      // Verify OTP
      const isValid = await bcrypt.compare(otp, otpData.otpHash);

      if (!isValid) {
        // Increment attempts
        otpData.attempts += 1;
        await this.redis.setex(
          sessionId,
          this.OTP_TTL,
          JSON.stringify(otpData),
        );
        throw new BadRequestException(
          `Invalid OTP. Attempts remaining: ${this.MAX_ATTEMPTS - otpData.attempts}`,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(
        `Failed to verify OTP for sessionId ${sessionId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Mark OTP as verified (used)
   */
  async markOtpAsVerified(sessionId: string): Promise<void> {
    try {
      const otpData = await this.getOtpData(sessionId);

      if (!otpData) {
        throw new BadRequestException('OTP not found');
      }

      // Store verified flag with shorter TTL
      await this.redis.setex(
        `${sessionId}:verified`,
        60, // 1 minute to allow validation checks
        'true',
      );

      this.logger.log(`OTP marked as verified for sessionId ${sessionId}`);
    } catch (error) {
      this.logger.error(
        `Failed to mark OTP as verified for sessionId ${sessionId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Check if OTP is already verified
   */
  async isOtpVerified(sessionId: string): Promise<boolean> {
    try {
      const verified = await this.redis.get(`${sessionId}:verified`);
      return verified !== null;
    } catch (error) {
      this.logger.error(
        `Failed to check OTP verification status for sessionId ${sessionId}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Get OTP info by email
   */
  async getOtpByEmail(email: string): Promise<OTPData | null> {
    try {
      const sessionId = await this.redis.get(`otp:email:${email}`);

      if (!sessionId) {
        return null;
      }

      return this.getOtpData(sessionId);
    } catch (error) {
      this.logger.error(`Failed to get OTP by email ${email}:`, error);
      throw error;
    }
  }

  /**
   * Delete OTP from Redis
   */
  async deleteOtp(sessionId: string): Promise<void> {
    try {
      const otpData = await this.getOtpData(sessionId);

      if (otpData) {
        await this.redis.del(`otp:email:${otpData.email}`);
      }

      await this.redis.del(sessionId);
      await this.redis.del(`${sessionId}:verified`);

      this.logger.log(`OTP deleted for sessionId ${sessionId}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete OTP for sessionId ${sessionId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get remaining OTP validity time in seconds
   */
  async getOtpTtl(sessionId: string): Promise<number> {
    try {
      const ttl = await this.redis.ttl(sessionId);
      return Math.max(0, ttl);
    } catch (error) {
      this.logger.error(
        `Failed to get OTP TTL for sessionId ${sessionId}:`,
        error,
      );
      return 0;
    }
  }
}
