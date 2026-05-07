import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class SubmissionResultResponse {
  @Field(() => ID)
  submissionId!: string;

  @Field(() => ID)
  assessmentId!: string;

  @Field(() => ID)
  candidateId!: string;

  @Field(() => Int)
  totalScore!: number;

  @Field(() => Int)
  correctAnswers!: number;

  @Field(() => Int)
  totalQuestions!: number;

  @Field(() => Int, { nullable: true })
  violationPoints?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  violationDetails?: any; // Details of violations with points

  @Field(() => GraphQLJSON, { nullable: true })
  detailedResults?: any; // Per-question results

  @Field(() => Date)
  submittedAt!: Date;

  @Field()
  status!: string; // 'COMPLETED', 'PASSED', 'FAILED'
}
