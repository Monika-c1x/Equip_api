import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Candidate } from '../../common/entities';
import { AuthService } from './services/auth.service';
import { OtpService } from './services/otp.service';
import { AuthResolver } from './auth.resolver';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RedisModule } from '../../common/redis/redis.module';
import { EmailService } from '../../common/email/email.service';
import { InviteModule } from '../invite/invite.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Candidate]),
    JwtModule.register({
      secret: 'd43e0d585a037e14598b1b3bd57412ef ',
      signOptions: {
        expiresIn: '7d',
      },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    RedisModule,
    InviteModule,
  ],
  providers: [
    AuthService,
    OtpService,
    EmailService,
    JwtStrategy,
    JwtAuthGuard,
    AuthResolver,
  ],
  exports: [AuthService, OtpService, JwtAuthGuard, JwtStrategy],
})
export class AuthModule {}
