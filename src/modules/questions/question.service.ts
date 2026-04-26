import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { CreateQuestionInput } from './dto/create-question.input';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
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

    return await this.questionRepository.save(newQuestion);
  }
}