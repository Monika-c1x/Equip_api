import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Assessment } from '../entities/assessment.entity';

@ObjectType()
export class PaginatedAssessmentsResponse {
  @Field(() => [Assessment])
  items!: Assessment[];

  @Field(() => Int)
  totalCount!: number;
}