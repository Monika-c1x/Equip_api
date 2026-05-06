import { Resolver, Mutation, Args, Query, ID } from '@nestjs/graphql';
import { QuestionService } from './question.service';
import { Question } from './entities/question.entity';
import { CreateQuestionInput } from './dto/create-question.input';
import { UpdateQuestionInput } from './dto/update-question.input';

@Resolver(() => Question)
export class QuestionResolver {
  constructor(private readonly questionService: QuestionService) {}

  @Mutation(() => Question)
  createQuestion(
    @Args('createQuestionInput') createQuestionInput: CreateQuestionInput,
  ) {
    return this.questionService.create(createQuestionInput);
  }

  @Query(() => [Question], { name: 'getAdminQuestionsByAssessmentId' })
  async getAdminQuestionsByAssessmentId(
    @Args('assessmentId', { type: () => ID }) assessmentId: string,
  ) {
    return this.questionService.getQuestionsByAssessmentId(assessmentId);
  }

  @Mutation(() => Question)
  updateQuestion(
    @Args('updateQuestionInput') updateQuestionInput: UpdateQuestionInput,
  ) {
    return this.questionService.update(updateQuestionInput.id, updateQuestionInput);
  }

  @Mutation(() => String)
  removeQuestion(@Args('id', { type: () => ID }) id: string) {
    return this.questionService.remove(id);
  }
}