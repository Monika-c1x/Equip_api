import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { CreateAssessmentInput } from './create-assessment.input';
import { IsUUID, IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateAssessmentInput extends PartialType(CreateAssessmentInput) {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  id!: string;
}