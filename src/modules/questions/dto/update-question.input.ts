import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { CreateQuestionInput } from './create-question.input';
import { IsUUID, IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateQuestionInput extends PartialType(CreateQuestionInput) {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  id!: string;
}