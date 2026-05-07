import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssessmentService } from './assessment.service';
import { AssessmentResolver } from './assessment.resolver';
import { Assessment } from './entities/assessment.entity';
import { AssessmentQuestion } from './entities/assessment-question.entity';
import { AssessmentSubmission } from './entities/assessment-submission.entity';
import { AssessmentScoringService } from './services/assessment-scoring.service';
import { Question } from '../questions/entities/question.entity';
import { AssessmentResponses } from './entities/assessment-responses';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Assessment,
      AssessmentQuestion,
      AssessmentSubmission,
      Question,
      AssessmentResponses
    ]),
  ],
  providers: [AssessmentResolver, AssessmentService, AssessmentScoringService],
  exports: [AssessmentService],
})
export class AssessmentModule {}
