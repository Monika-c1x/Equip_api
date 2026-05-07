import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsInt, Min } from 'class-validator';

@InputType()
export class AssessmentViolationInput {
  @Field()
  @IsString()
  violationRule!: string; // Name of the violation rule

  @Field(() => Int)
  @IsInt()
  @Min(0)
  violationPoints!: number; // Points deducted for this violation
}
