import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssessmentService } from './assessment.service';
import { AssessmentResolver } from './assessment.resolver';
import { Assessment } from './entities/assessment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Assessment])], 
  providers: [AssessmentResolver, AssessmentService],
  exports: [AssessmentService],
})
export class AssessmentModule {}