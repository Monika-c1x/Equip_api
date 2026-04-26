import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AppResolver } from './app.resolver';
import { CommonModule } from './common/common.module';
import { AssessmentModule } from './modules/assessment/assessment.module';
import { QuestionModule } from './modules/questions/question.module';

@Module({
  imports: [
    CommonModule,
    ConfigModule.forRoot(),
    QuestionModule,
    AssessmentModule,

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'NewPass123',
      database: 'equip_platform',
      autoLoadEntities: true,
      synchronize: false,
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
    }),
  ],
  providers: [AppResolver],
})
export class AppModule {}
