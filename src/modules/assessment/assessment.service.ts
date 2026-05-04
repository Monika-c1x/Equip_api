import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { CreateAssessmentInput } from './dto/create-assessment.input';
import { UpdateAssessmentInput } from './dto/update-assessment.input';
import { Assessment } from './entities/assessment.entity';
import { AssessmentQuestion } from './entities/assessment-question.entity';
import { StudentAssessmentResponse } from './dto/student-assessment.response';
import { GetAssessmentsArgs } from './dto/get-assessments.args';
import { PaginatedAssessmentsResponse } from './dto/paginated-assessments.response';
@Injectable()
export class AssessmentService {
  constructor(
    @InjectRepository(Assessment)
    private assessmentRepository: Repository<Assessment>,

    @InjectRepository(AssessmentQuestion)
    private assessmentQuestionRepo: Repository<AssessmentQuestion>,
  ) {}

  async findAll(
    args: GetAssessmentsArgs,
  ): Promise<PaginatedAssessmentsResponse> {
    const { limit = 10, offset = 0, search } = args;

    const whereCondition = search ? { title: ILike(`%${search}%`) } : {};

    const [items, totalCount] = await this.assessmentRepository.findAndCount({
      where: whereCondition,
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
    });

    return { items, totalCount };
  }

  async create(
    createAssessmentInput: CreateAssessmentInput,
    adminId: string,
  ): Promise<Assessment> {
    const newAssessment = this.assessmentRepository.create({
      title: createAssessmentInput.title,
      role: createAssessmentInput.role,
      experienceLevel: createAssessmentInput.experienceLevel,
      duration: createAssessmentInput.duration,
      startTime: createAssessmentInput.startTime,
      endTime: createAssessmentInput.endTime,
      createdBy: adminId,
      isActive: true,
    });

    return await this.assessmentRepository.save(newAssessment);
  }

  async findOne(id: string): Promise<Assessment> {
    const assessment = await this.assessmentRepository.findOne({
      where: { id },
    });

    if (!assessment) {
      throw new NotFoundException(`Assessment with ID ${id} not found`);
    }

    return assessment;
  }

  async update(
    id: string,
    updateAssessmentInput: UpdateAssessmentInput,
  ): Promise<Assessment> {
    const assessment = await this.assessmentRepository.preload({
      ...updateAssessmentInput,
      id: id,
    });

    if (!assessment) {
      throw new NotFoundException(`Assessment with ID ${id} not found`);
    }

    return await this.assessmentRepository.save(assessment);
  }

  async remove(id: string): Promise<String> {
    const assessment = await this.findOne(id);
    await this.assessmentRepository.remove(assessment);
    return 'Assessment deleted successfully';
  }

  async getStudentAssessmentDetails(
    assessmentId: string,
  ): Promise<StudentAssessmentResponse> {
    const assessment = await this.assessmentRepository.findOne({
      where: { id: assessmentId },
    });

    if (!assessment) {
      throw new NotFoundException(`Assessment not found`);
    }

    const mappings = await this.assessmentQuestionRepo.find({
      where: { assessment_id: assessmentId },
      relations: ['question'],
    });

    const safeQuestions = mappings.map((mapping) => {
      const q = mapping.question;
      return {
        id: q.id,
        question: q.question,
        options: q.options,
        positiveScore: q.positiveScore,
        negativeScore: q.negativeScore,
      };
    });

    return {
      id: assessment.id,
      title: assessment.title,
      role: assessment.role,
      duration: assessment.duration,
      questions: safeQuestions,
    };
  }
}
