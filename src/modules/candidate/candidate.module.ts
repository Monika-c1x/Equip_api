import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate } from '../../common/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Candidate])],
  exports: [TypeOrmModule],
})
export class CandidateModule {}
