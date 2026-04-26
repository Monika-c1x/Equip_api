import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import GraphQLJSON from 'graphql-type-json';

@Entity('mcq_questions')
@ObjectType()
export class Question {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  @Field()
  role!: string;

  @Column({ type: 'text' })
  @Field()
  question!: string;

  @Column({ type: 'json' })
  @Field(() => GraphQLJSON)
  options!: any;

  @Column({ name: 'correct_answer', type: 'json' })
  @Field(() => GraphQLJSON)
  correctAnswer!: any;

  @Column({ name: 'positive_score', type: 'int', default: 1 })
  @Field(() => Int)
  positiveScore!: number;

  @Column({ name: 'negative_score', type: 'int', default: 0 })
  @Field(() => Int)
  negativeScore!: number;

  @Column({ type: 'tinyint', default: 1 })
  @Field()
  status!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  @Field(() => Date)
  createdAt!: Date;
}