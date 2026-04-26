import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAssessmentInput } from './dto/create-assessment.input';
import { UpdateAssessmentInput } from './dto/update-assessment.input';
import { Assessment } from './entities/assessment.entity';

@Injectable()
export class AssessmentService {
  async findAll(): Promise<Assessment[]> {
    return await this.assessmentRepository.find();
  }
  constructor(
    @InjectRepository(Assessment)
    private assessmentRepository: Repository<Assessment>,
  ) {}

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
}
