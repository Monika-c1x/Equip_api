import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { CreateQuestionInput } from './dto/create-question.input';
import { AssessmentQuestion } from '../assessment/entities/assessment-question.entity';

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
}
