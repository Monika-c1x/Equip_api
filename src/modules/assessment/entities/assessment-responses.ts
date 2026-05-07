import { Entity,Column,PrimaryGeneratedColumn, ManyToOne,JoinColumn } from "typeorm";
import {ObjectType,Field, ID} from '@nestjs/graphql';
import { Assessment } from "./assessment.entity";
import { Question } from "src/modules/questions/entities/question.entity";
import { AssessmentQuestion } from "./assessment-question.entity";
import { AssessmentSubmission } from "./assessment-submission.entity";


@ObjectType()
@Entity('responses')
export class AssessmentResponses {

  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id!: string;

  @ManyToOne(() => AssessmentSubmission)
  @JoinColumn({ name: 'attempt_id' })
  attempt!: AssessmentSubmission;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'question_id' })
  question!: Question;

  // ✅ Answer
  @Column({ type: 'int' })
  @Field()
  selected_answer!: number;

  // ✅ Correct or not
  @Column({ type: 'boolean' })
  @Field()
  is_correct!: boolean;

  // ✅ Score
  @Column({ type: 'float' })
  @Field()
  score!: number;
}