import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { CreateAssessmentInput } from './dto/create-assessment.input';
import { UpdateAssessmentInput } from './dto/update-assessment.input';
import { Assessment } from './entities/assessment.entity';
import { AssessmentQuestion } from './entities/assessment-question.entity';
import { AssessmentSubmission } from './entities/assessment-submission.entity';
import { StudentAssessmentResponse } from './dto/student-assessment.response';
import { GetAssessmentsArgs } from './dto/get-assessments.args';
import { PaginatedAssessmentsResponse } from './dto/paginated-assessments.response';
import { SubmitAssessmentInput } from './dto/submit-assessment.input';
import { SubmissionResultResponse } from './dto/submission-result.response';
import { AssessmentScoringService } from './services/assessment-scoring.service';
import { AssessmentResponses } from './entities/assessment-responses';

@Injectable()
export class AssessmentService {
  constructor(
    @InjectRepository(Assessment)
    private assessmentRepository: Repository<Assessment>,

    @InjectRepository(AssessmentQuestion)
    private assessmentQuestionRepo: Repository<AssessmentQuestion>,

    @InjectRepository(AssessmentSubmission)
    private submissionRepository: Repository<AssessmentSubmission>,

    @InjectRepository(AssessmentResponses)
    private responseRepository: Repository<AssessmentResponses>,

    private scoringService: AssessmentScoringService,
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
      // startTime: createAssessmentInput.startTime,
      // endTime: createAssessmentInput.endTime,
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

  async submitAssessment(input: SubmitAssessmentInput): Promise<any> {

    const assessment = await this.assessmentRepository.findOne({
      where: { id: input.assessmentId },
    });

    if (!assessment) {
      throw new NotFoundException(
        `Assessment with ID ${input.assessmentId} not found`,
      );
    }
    if (!input.responses || input.responses.length === 0) {
      throw new BadRequestException('At least one response is required');
    }

    const assessmentQuestions = await this.assessmentQuestionRepo.find({
      where: { assessment_id: input.assessmentId },
      relations: ['question'],
    });
    console.log(assessmentQuestions);

    if (assessmentQuestions.length === 0) {
      throw new BadRequestException(`Assessment has no questions assigned`);
    }
    const questionsMap = new Map();
    assessmentQuestions.forEach((aq) => {
      questionsMap.set(aq.question_id, aq.question);
    });

    input.responses.forEach((response) => {
      if (!questionsMap.has(response.qid)) {
        throw new BadRequestException(
          `Question ${response.qid} not found in this assessment`,
        );
      }
    });

    const scoringResult = this.scoringService.validateAndScoreResponses(
      input.responses,
      questionsMap,
    );

    const violationResult = this.scoringService.calculateViolationPenalties(
      input.violations,
    );

    const finalScore = this.scoringService.calculateFinalScore(
      scoringResult.totalScore,
      violationResult.totalViolationPoints,
    );

    const totalPossibleScore = assessmentQuestions.reduce((sum, aq) => {
      return sum + (aq.question.positiveScore || 1);
    }, 0);

    const status = this.scoringService.determineStatus(
      finalScore,
      totalPossibleScore,
    );

    const submission = this.submissionRepository.create({
      assessment_id: input.assessmentId,
      candidate_id: input.candidateId,
      score: finalScore,
      correct_answers: scoringResult.correctAnswers,
      status,
    });

    const savedSubmission = await this.submissionRepository.save(submission);

    const responsesToSave = scoringResult.detailedResults.map((result) => {
      return this.responseRepository.create({
        attempt:{id:savedSubmission.id},
        question: {id:result.qid},
        selected_answer: result.selectedAnswer,
        is_correct: result.isCorrect,
        score: result.pointsEarned,
      });
    });

    await this.responseRepository.save(responsesToSave);

    return {
      submissionId: savedSubmission.id,
      assessmentId: savedSubmission.assessment_id,
      candidateId: savedSubmission.candidate_id,
      totalScore: savedSubmission.score,
      correctAnswers: savedSubmission.correct_answers,
      submittedAt: savedSubmission.created_at,
      status: savedSubmission.status,
    };
  }

  async getSubmissionResults(submissionId: string): Promise<any> {
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
    });
    console.log(submission)
    const assessment= await this.responseRepository.find({where:{attempt:{id:submissionId}},relations:['question','attempt']})
    console.log(assessment[0].attempt.id)
    const assessmentId = submission?.assessment_id;

    const mappings = await this.assessmentQuestionRepo.find({
      where: { assessment_id: assessmentId },
      relations: ['question'],
    });
    // const scoringResult = this.scoringService.validateAndScoreResponses();
    const safeQuestions = mappings.map((mapping) => {
      const q = mapping.question;
      const selected = assessment.map((selected)=>{
      return {
        id: q.id,
        question: q.question,
        options: q.options,
        positiveScore: q.positiveScore,
        negativeScore: q.negativeScore,
        correctAnswer: q.correctAnswer,
        selected: selected.selected_answer,

      };
    })
    });

    console.log('This is', safeQuestions);

    // console.log(mappings);

    if (!submission) {
      throw new NotFoundException(
        `Submission with ID ${submissionId} not found`,
      );
    }

    return {
      submissionId: submission.id,
      assessmentId: submission.assessment_id,
      candidateId: submission.candidate_id,
      totalScore: submission.score,
      correctAnswers: submission.correct_answers,
      // totalQuestions: submission.total_questions,
      // violationPoints: submission.violation_points,
      // violationDetails: submission.violations,
      // detailedResults: submission.detailed_results,
      submittedAt: submission.created_at,
      status: submission.status,
    };
  }
}
