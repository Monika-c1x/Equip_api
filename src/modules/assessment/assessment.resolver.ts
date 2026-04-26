import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { AssessmentService } from './assessment.service';
import { Assessment } from './entities/assessment.entity';
import { CreateAssessmentInput } from './dto/create-assessment.input';
import { UpdateAssessmentInput } from './dto/update-assessment.input';
import { UseGuards } from '@nestjs/common';

@Resolver(() => Assessment)
export class AssessmentResolver {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Mutation(() => Assessment)
  createAssessment(
    @Args('createAssessmentInput') createAssessmentInput: CreateAssessmentInput,
  ) {
    // This ID now perfectly matches the user we just inserted into MySQL
    const mockAdminId = '123e4567-e89b-12d3-a456-426614174000';
    return this.assessmentService.create(createAssessmentInput, mockAdminId);
  }

  // @Mutation(() => Assessment)
  //   @UseGuards(JwtAuthGuard)
  //   createAssessment(
  //     @Args('createAssessmentInput') createAssessmentInput: CreateAssessmentInput,
  //     @CurrentUserId() userId: string,
  //   ) {
  //     return this.assessmentService.create(createAssessmentInput, userId);
  //   }

  @Query(() => [Assessment], { name: 'getAssessments' }) 
  findAll() {
    return this.assessmentService.findAll();
  }

  @Query(() => Assessment, { name: 'getAssessment' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.assessmentService.findOne(id);
  }

  @Mutation(() => Assessment)
  updateAssessment(
    @Args('updateAssessmentInput') updateAssessmentInput: UpdateAssessmentInput,
  ) {
    return this.assessmentService.update(updateAssessmentInput.id, updateAssessmentInput);
  }

  @Mutation(() => String)
  removeAssessment(@Args('id', { type: () => ID }) id: string) {
    return this.assessmentService.remove(id);
  }
}
