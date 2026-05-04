import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class StudentQuestionResponse {
  @Field(() => ID)
  id!: string;

  @Field()
  question!: string;

  @Field(() => GraphQLJSON)
  options!: any;

  @Field(() => Int)
  positiveScore!: number;

  @Field(() => Int)
  negativeScore!: number;
}

@ObjectType()
export class StudentAssessmentResponse {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field()
  role!: string;

  @Field(() => Int)
  duration!: number;

  @Field(() => [StudentQuestionResponse])
  questions!: StudentQuestionResponse[];
}