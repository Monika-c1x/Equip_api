import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsString,
  IsInt,
  Min,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class CreateAssessmentInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  role!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  experienceLevel?: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  duration!: number;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startTime?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endTime?: Date;
}
