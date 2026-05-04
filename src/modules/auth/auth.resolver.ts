import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { Logger, BadRequestException, UseGuards } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { InviteService } from './../invite/invite.service';
import {
  SendOtpInput,
  SendOtpResponse,
  VerifyOtpInput,
  VerifyOtpResponse,
  GenerateInviteInput,
  GenerateInviteResponse,
  CandidateType,
} from './dto/auth.types';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from './../../common/decorators';

@Resolver()
export class AuthResolver {
  private readonly logger = new Logger(AuthResolver.name);

  constructor(
    private readonly authService: AuthService,
    private readonly inviteService: InviteService,
  ) {}

  /**
   * Generate an invite link for a candidate
   * Called by recruiter/admin
   */
  @Mutation(() => GenerateInviteResponse)
  // @UseGuards(JwtAuthGuard)
  async generateInvite(
    @Args('input') input: GenerateInviteInput,
    @CurrentUser() user: any,
  ): Promise<GenerateInviteResponse> {
    try {
      if (!input.email || !input.email.includes('@')) {
        throw new BadRequestException('Valid email is required');
      }
      // console.log(user);
      // if (!user?.candidateId) {
      //   throw new BadRequestException('Unauthorized');
      // }

      const invite = await this.inviteService.createInvite(
        input.email,
        'recruiter1',
        input.startDate,
        input.startTime,
        // user.candidateId,
        input.expiryMinutes || 24 * 60,
      );
      return await this.authService.sendInvite(input.email,invite.inviteToken,invite.expiresAt,input.emailTemplate, input.emailSubject)


      // return {
      //   inviteToken: invite.inviteToken,
      //   inviteLink,
      //   expiresAt: invite.expiresAt,
      //   message: 'Invite generated successfully',
      // };
    } catch (error) {
      this.logger.error('Failed to generate invite:', error);
      throw error;
    }
  }

  /**
   * Send OTP to candidate email
   */
  @Mutation(() => SendOtpResponse)
  async sendOtp(@Args('input') input: SendOtpInput): Promise<SendOtpResponse> {
    try {
      if (!input.email || !input.email.includes('@')) {
        throw new BadRequestException('Valid email is required');
      }

      if (!input.inviteToken) {
        throw new BadRequestException('Invite token is required');
      }

      return await this.authService.sendOtp(input.email, input.inviteToken);
    } catch (error) {
      this.logger.error('Failed to send OTP:', error);
      throw error;
    }
  }

  /**
   * Verify OTP and create account / login
   */
  @Mutation(() => VerifyOtpResponse)
  async verifyOtp(@Args('input') input: VerifyOtpInput): Promise<any> {
    try {
      if (!input.sessionId) {
        throw new BadRequestException('Session ID is required');
      }

      if (!input.otp || input.otp.length !== 6 || isNaN(Number(input.otp))) {
        throw new BadRequestException('Valid 6-digit OTP is required');
      }

      return await this.authService.verifyOtp(
        input.sessionId,
        input.otp,
        input.firstName,
      );
    } catch (error) {
      this.logger.error('Failed to verify OTP:', error);
      throw error;
    }
  }

  /**
   * Get current user profile (protected route)
   */
  @Query(() => CandidateType)
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: any): Promise<CandidateType> {
    try {
      if (!user || !user.candidateId) {
        throw new BadRequestException('Unauthorized');
      }

      return user;
    } catch (error) {
      this.logger.error('Failed to get current user:', error);
      throw error;
    }
  }
}
