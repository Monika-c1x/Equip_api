import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AppResolver } from './app.resolver';
import { CommonModule } from './common/common.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CandidateModule } from './modules/candidate/candidate.module';
import { InviteModule } from './modules/invite/invite.module';
import { RedisModule } from './common/redis/redis.module';
import { Invite, Candidate } from './common/entities';
import { AssessmentModule } from './modules/assessment/assessment.module';

@Module({
  imports: [
    CommonModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'NewPass123',
      database: process.env.DB_NAME || 'equip_platform',
      entities: [Invite, Candidate],
      autoLoadEntities: true,
      synchronize: false,
      logging: process.env.NODE_ENV !== 'production',
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      context: ({ req, res }) => ({
        req,
        res,
      }),
    }),

    RedisModule,
    AuthModule,
    CandidateModule,
    InviteModule,
    UsersModule,
    AssessmentModule
  ],
  providers: [AppResolver],
})
export class AppModule {}
