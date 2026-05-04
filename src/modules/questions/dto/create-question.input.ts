import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsBoolean,
  IsObject,
  IsOptional,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CreateQuestionInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  role!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  question!: string;

  @Field(() => GraphQLJSON)
  @IsNotEmpty()
  options!: any;

  @Field(() => GraphQLJSON)
  @IsNotEmpty()
  correctAnswer!: any; 

  @Field(() => Int)
  @IsInt()
  positiveScore!: number;

  @Field(() => Int)
  @IsInt()
  negativeScore!: number;

  @Field()
  @IsBoolean()
  status!: boolean;

  @Field({ nullable: true }) 
  @IsString()
  @IsOptional()
  assessmentId?: string;
}
