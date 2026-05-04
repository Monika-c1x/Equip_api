import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';

@ArgsType()
export class GetAssessmentsArgs {
  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;
}