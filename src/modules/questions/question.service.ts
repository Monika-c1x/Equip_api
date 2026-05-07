import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { CreateQuestionInput } from './dto/create-question.input';
import { AssessmentQuestion } from '../assessment/entities/assessment-question.entity';
import { UpdateQuestionInput } from './dto/update-question.input';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,

    @InjectRepository(AssessmentQuestion)
    private assessmentQuestionRepo: Repository<AssessmentQuestion>,
  ) {}

  async create(createQuestionInput: CreateQuestionInput): Promise<Question> {
    const newQuestion = this.questionRepository.create({
      role: createQuestionInput.role,
      question: createQuestionInput.question,
      options: createQuestionInput.options,
      correctAnswer: createQuestionInput.correctAnswer,
      positiveScore: createQuestionInput.positiveScore,
      negativeScore: createQuestionInput.negativeScore,
      status: createQuestionInput.status,
    });

    // Save the question to the mcq_questions table
    const savedQuestion = await this.questionRepository.save(newQuestion);

    // If an assessmentId was provided, create a mapping in the assessment_questions table
    if (createQuestionInput.assessmentId) {
      const newMapping = this.assessmentQuestionRepo.create({
        assessment_id: createQuestionInput.assessmentId,
        question_id: savedQuestion.id,
      });

      await this.assessmentQuestionRepo.save(newMapping);
    }

    return savedQuestion;
  }

  async getQuestionsByAssessmentId(assessmentId: string): Promise<Question[]> {
    
    const mappings = await this.assessmentQuestionRepo.find({
      where: { assessment_id: assessmentId },
      relations: ['question'], 
      
      order: { createdAt: 'ASC' }, 
    });

    return mappings.map((mapping) => mapping.question);
  }

  async update(id: string, updateQuestionInput: UpdateQuestionInput): Promise<Question> {
    const { id: _, ...updateData } = updateQuestionInput;
    const question = await this.questionRepository.preload({
      id: id,
      ...updateData,
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    return await this.questionRepository.save(question);
  }

  async remove(id: string): Promise<string> {
    const question = await this.questionRepository.findOne({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    await this.assessmentQuestionRepo.delete({ question_id: id });
    await this.questionRepository.remove(question);

    return 'Question and its assessment links deleted successfully';
  }
}
