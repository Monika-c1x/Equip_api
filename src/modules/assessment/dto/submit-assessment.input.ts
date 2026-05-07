import { InputType, Field, ID } from '@nestjs/graphql';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import {Type} from 'class-transformer'
import { AssessmentResponseInput } from './assessment-response.input';
import { AssessmentViolationInput } from './assessment-violation.input';

@InputType()
export class SubmitAssessmentInput {
  @Field(() => ID)
  // @IsUUID()
  @IsNotEmpty()
  assessmentId!: string; // ID of the assessment being submitted

  @Field(() => ID)
  // @IsUUID()
  @IsNotEmpty()
  candidateId!: string; // ID of the candidate submitting

  @Field(() => [AssessmentResponseInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssessmentResponseInput)
  responses!: AssessmentResponseInput[];

  @Field(() => [AssessmentViolationInput], { nullable: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssessmentViolationInput)
  violations?: AssessmentViolationInput[]; // Optional violations from frontend
}
