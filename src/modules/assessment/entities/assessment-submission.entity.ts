import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Assessment } from './assessment.entity';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
@Entity('test_attempts')
export class AssessmentSubmission {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id!: string;

  @Column({ name: 'assessment_id', type: 'char', length: 36 })
  @Field(() => ID)
  assessment_id!: string;

  @Column({ name: 'candidate_id', type: 'char', length: 36 })
  @Field(() => ID)
  candidate_id!: string;

  @Column({ type: 'float' })
  @Field(() => Int)
  score!: number; // totalScore

  @Column({ type: 'int', default: 0 })
  @Field(() => Int)
  correct_answers!: number;

  @Column({ name: 'start_time', type: 'timestamp', nullable: true })
  @Field(() => Date, { nullable: true })
  startTime?: Date;

  @Column({ name: 'end_time', type: 'timestamp', nullable: true })
  @Field(() => Date, { nullable: true })
  endTime?: Date;

  // @Column({ type: 'int', default: 0 })
  // @Field(() => Int)
  // total_questions!: number;

  // @Column({ type: 'int', default: 0 })
  // @Field(() => Int)
  // violation_points!: number;

  // @Column({ type: 'json', nullable: true })
  // @Field(() => GraphQLJSON, { nullable: true })
  // violations?: any;

  // @Column({ type: 'json', nullable: true })
  // @Field(() => GraphQLJSON, { nullable: true })
  // responses?: any;

  // @Column({ type: 'json', nullable: true })
  // @Field(() => GraphQLJSON, { nullable: true })
  // detailed_results?: any;

  @Column({ type: 'varchar', length: 50, default: 'COMPLETED' })
  @Field()
  status!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  @Field(() => Date)
  created_at!: Date;

  @ManyToOne(() => Assessment)
  @JoinColumn({ name: 'assessment_id' })
  assessment!: Assessment;
}
