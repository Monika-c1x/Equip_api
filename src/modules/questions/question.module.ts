import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionService } from './question.service';
import { QuestionResolver } from './question.resolver';
import { Question } from './entities/question.entity';
import { AssessmentQuestion } from '../assessment/entities/assessment-question.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Question, AssessmentQuestion])],
  providers: [QuestionResolver, QuestionService],
  exports: [QuestionService],
})
export class QuestionModule {}