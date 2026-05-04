import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Assessment } from './assessment.entity';
import { Question } from '../../questions/entities/question.entity';

@ObjectType()
@Entity('assessment_questions')
export class AssessmentQuestion {
  @PrimaryGeneratedColumn('uuid') 
  @Field(() => ID)
  id!: string;

  @Column({ type: 'char', length: 36 })
  @Field()
  assessment_id!: string;

  @Column({ type: 'char', length: 36 })
  @Field()
  question_id!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  @Field(() => Date)
  createdAt!: Date;

  @ManyToOne(() => Assessment)
  @JoinColumn({ name: 'assessment_id' })
  assessment!: Assessment;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'question_id' })
  question!: Question;
}