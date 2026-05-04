import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssessmentService } from './assessment.service';
import { AssessmentResolver } from './assessment.resolver';
import { Assessment } from './entities/assessment.entity';
import { AssessmentQuestion } from './entities/assessment-question.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Assessment, AssessmentQuestion])],
  providers: [AssessmentResolver, AssessmentService],
  exports: [AssessmentService],
})
export class AssessmentModule {}