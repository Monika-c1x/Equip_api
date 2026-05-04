import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Candidate } from '../../../common/entities';
import { OtpService } from './otp.service';
import { InviteService } from '../../invite/invite.service';
import { EmailService } from '../../../common/email/email.service';
import { Timestamp } from 'typeorm/browser';

export interface SendOtpResponse {
  sessionId: string;
  message: string;
  expiresIn: number;
}

export interface SendInviteResponse{
  inviteToken : string;
  inviteLink : string;
  expiresAt :Date;
  message: string;

}

export interface VerifyOtpResponse {
  token: string;
  candidate: {
    id: string;
    email: string;
    firstName: string;
  };
  message: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly inviteService: InviteService,
    private readonly emailService: EmailService,
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
  ) {}

  /**
   * Send OTP to candidate email
   */
  async sendOtp(email: string, inviteToken: string): Promise<SendOtpResponse> {
    try {
      // Validate invite token
      const invite = await this.inviteService.validateInviteToken(inviteToken);

      // Verify email matches if email was provided in invite
      if (invite.email && invite.email !== email) {
        throw new BadRequestException('Email does not match the invite');
      }

      // Check if candidate already exists
      const existingCandidate = await this.candidateRepository.findOne({
        where: { email },
      });

      if (existingCandidate && existingCandidate.inviteTokenUsed) {
        throw new BadRequestException('Email already registered');
      }

      // Generate OTP
      const otp = this.otpService.generateOtp();

      // Store OTP in Redis
      const sessionId = await this.otpService.storeOtp(email, otp, inviteToken);

      // Send OTP via email
      const emailTemplate = this.emailService.generateOtpEmailTemplate(
        email,
        otp,
      );
      await this.emailService.sendEmail({
        to: email,
        subject: 'Your Equip Exam Platform OTP',
        html: emailTemplate,
      });

      this.logger.log(`OTP sent successfully to ${email}`);

      return {
        sessionId,
        message: 'OTP sent successfully to your email',
        expiresIn: 5 * 60, // 5 minutes in seconds
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to send OTP for email ${email}:`, error);
      throw new InternalServerErrorException('Failed to send OTP');
    }
  }

  async sendInvite(email: string, inviteToken: string, expiresAt:Date, emailTemplate: string, emailSubject: string): Promise<SendInviteResponse>{
    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite/${inviteToken}`;
    await this.emailService.sendEmail({
      to: email,
      subject: emailSubject,
      html: emailTemplate,
    })
    return {
      inviteToken,
      inviteLink,
      expiresAt,
      message: 'Invite Link sent successfully to your email'
    }
  }

  /**
   * Verify OTP and create candidate account with JWT token
   */
  async verifyOtp(
    sessionId: string,
    otp: string,
    firstName?: string,
  ): Promise<VerifyOtpResponse> {
    try {
      // Verify OTP
      await this.otpService.verifyOtp(sessionId, otp);

      // Get OTP data
      const otpData = await this.otpService.getOtpData(sessionId);
      if (!otpData) {
        throw new BadRequestException('OTP session expired');
      }

      // Validate invite again
      const invite = await this.inviteService.validateInviteToken(
        otpData.inviteToken,
      );

      // Check or create candidate
      let candidate = await this.candidateRepository.findOne({
        where: { email: otpData.email },
      });

      if (!candidate) {
        // Create new candidate
        const passwordHash = await bcrypt.hash(sessionId + Date.now(), 10); // Dummy hash

        candidate = this.candidateRepository.create({
          email: otpData.email,
          name: firstName || '',
          passwordHash,
          inviteTokenUsed: otpData.inviteToken,
          emailVerified: true,
        });

        candidate = await this.candidateRepository.save(candidate);
        this.logger.log(`New candidate created: ${candidate.email}`);
      } else {
        // Update existing candidate with invite token
        candidate.inviteTokenUsed = otpData.inviteToken;
        candidate.emailVerified = true;
        if (firstName) candidate.name = firstName;

        candidate = await this.candidateRepository.save(candidate);
        this.logger.log(`Candidate updated: ${candidate.email}`);
      }

      // Mark invite as used
      await this.inviteService.markInviteAsUsed(otpData.inviteToken);

      // Mark OTP as verified
      await this.otpService.markOtpAsVerified(sessionId);

      // Generate JWT token
      const token = this.jwtService.sign({
        sub: candidate.id,
        email: candidate.email,
        inviteTokenUsed: candidate.inviteTokenUsed,
      });

      // Send welcome email
      const welcomeTemplate = this.emailService.generateWelcomeEmailTemplate(
        candidate.email,
        candidate.name || 'Candidate',
      );

      await this.emailService
        .sendEmail({
          to: candidate.email,
          subject: 'Welcome to Equip Exam Platform',
          html: welcomeTemplate,
        })
        .catch((err) => {
          this.logger.warn(
            `Failed to send welcome email to ${candidate.email}:`,
            err,
          );
          // Don't throw, as the account was already created
        });

      // Clean up OTP from Redis after successful verification
      await this.otpService.deleteOtp(sessionId);

      this.logger.log(
        `OTP verified and JWT token issued for ${candidate.email}`,
      );

      return {
        token,
        candidate: {
          id: candidate.id,
          email: candidate.email,
          firstName: candidate.name,
        },
        message: 'OTP verified successfully. Welcome to Equip!',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(
        `Failed to verify OTP for session ${sessionId}:`,
        error,
      );
      throw new InternalServerErrorException('Failed to verify OTP');
    }
  }

  /**
   * Generate JWT token for candidate (used for re-authentication)
   */
  async generateToken(candidateId: string): Promise<string> {
    try {
      const candidate = await this.candidateRepository.findOne({
        where: { id: candidateId },
      });

      if (!candidate) {
        throw new BadRequestException('Candidate not found');
      }

      return this.jwtService.sign({
        sub: candidate.id,
        email: candidate.email,
        inviteTokenUsed: candidate.inviteTokenUsed,
      });
    } catch (error) {
      this.logger.error(
        `Failed to generate token for candidate ${candidateId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Validate JWT token
   */
  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }
  }
}
