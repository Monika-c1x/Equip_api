import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invite, InviteStatus } from './../../common/entities';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InviteService {
  private readonly logger = new Logger(InviteService.name);

  constructor(
    @InjectRepository(Invite)
    private readonly inviteRepository: Repository<Invite>,
  ) {}

  /**
   * Generate a unique invite token
   */
  private generateInviteToken(): string {
    return uuidv4();
  }

  /**
   * Create an invite for a candidate
   */
  async createInvite(
    email: string,
    recruiterId: string,
    expiryMinutes: number = 24 * 60, // 24 hours by default
    metadata?: any,
  ): Promise<Invite> {
    try {
      const inviteToken = this.generateInviteToken();
      const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

      const invite = this.inviteRepository.create({
        inviteToken,
        email,
        status: InviteStatus.PENDING,
        expiresAt,
        recruiterId,
      });

      const savedInvite = await this.inviteRepository.save(invite);
      this.logger.log(`Invite created for ${email} with token ${inviteToken}`);

      return savedInvite;
    } catch (error) {
      this.logger.error(`Failed to create invite for ${email}:`, error);
      throw error;
    }
  }

  /**
   * Validate invite token
   */
  async validateInviteToken(inviteToken: string): Promise<Invite> {
    try {
      const invite = await this.inviteRepository.findOne({
        where: { inviteToken },
      });

      if (!invite) {
        throw new NotFoundException('Invite token not found');
      }

      // Check if expire
      if (new Date() > invite.expiresAt) {
        // Mark as expired
        await this.inviteRepository.update(invite.id, {
          status: InviteStatus.EXPIRED,
        });
        throw new BadRequestException('Invite token has expired');
      }

      // Check if already used
      if (invite.status === InviteStatus.USED) {
        throw new BadRequestException('Invite link has already been used');
      }

      // Check if expired in status
      if (invite.status === InviteStatus.EXPIRED) {
        throw new BadRequestException('Invite token has expired');
      }

      return invite;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to validate invite token ${inviteToken}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Mark invite as used
   */
  async markInviteAsUsed(inviteToken: string): Promise<Invite> {
    try {
      const invite = await this.validateInviteToken(inviteToken);

      const updatedInvite = await this.inviteRepository.save({
        ...invite,
        status: InviteStatus.USED,
        updatedAt: new Date(),
      });

      this.logger.log(`Invite marked as used: ${inviteToken}`);
      return updatedInvite;
    } catch (error) {
      this.logger.error(`Failed to mark invite as used ${inviteToken}:`, error);
      throw error;
    }
  }

  /**
   * Get invite by token
   */
  async getInviteByToken(inviteToken: string): Promise<Invite> {
    try {
      const invite = await this.inviteRepository.findOne({
        where: { inviteToken },
      });

      if (!invite) {
        throw new NotFoundException('Invite not found');
      }

      return invite;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to get invite by token ${inviteToken}:`, error);
      throw error;
    }
  }

  /**
   * Get invites by recruiter
   */
  async getInvitesByRecruiter(recruiterId: string): Promise<Invite[]> {
    try {
      return await this.inviteRepository.find({
        where: { recruiterId },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(
        `Failed to get invites for recruiter ${recruiterId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get invite by email
   */
  async getInviteByEmail(email: string): Promise<Invite | null> {
    try {
      return await this.inviteRepository.findOne({
        where: { email, status: InviteStatus.PENDING },
      });
    } catch (error) {
      this.logger.error(`Failed to get invite by email ${email}:`, error);
      throw error;
    }
  }

  /**
   * Cleanup expired invites (can be called by a cron job)
   */
  async cleanupExpiredInvites(): Promise<number> {
    try {
      const result = await this.inviteRepository.update(
        {
          status: InviteStatus.PENDING,
          expiresAt: new Date(),
        },
        { status: InviteStatus.EXPIRED },
      );

      this.logger.log(`Cleaned up ${result.affected} expired invites`);
      return result.affected || 0;
    } catch (error) {
      this.logger.error('Failed to cleanup expired invites:', error);
      throw error;
    }
  }
}
