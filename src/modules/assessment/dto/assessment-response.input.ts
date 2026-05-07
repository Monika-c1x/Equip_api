import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsArray } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class AssessmentResponseInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  qid!: string; // Question ID

  @Field(() => GraphQLJSON)
  @IsNotEmpty()
  selected_option!: string | string[]; // Single option or multiple options
}
