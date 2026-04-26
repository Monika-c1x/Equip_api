import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('assessments')
@ObjectType()
export class Assessment {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  @Field()
  title!: string;

  @Column({ type: 'varchar', length: 100 })
  @Field()
  role!: string;

  @Column({ name: 'experience_level', type: 'varchar', length: 50 })
  @Field()
  experienceLevel?: string;

  @Column({ name: 'created_by', type: 'char', length: 36 })
  @Field(() => ID)
  createdBy?: string;

  @Column({ type: 'int' })
  @Field(() => Int)
  duration!: number;

  @Column({ name: 'start_time', type: 'timestamp', nullable: true })
  @Field(() => Date, { nullable: true })
  startTime?: Date;

  @Column({ name: 'end_time', type: 'timestamp', nullable: true })
  @Field(() => Date, { nullable: true })
  endTime?: Date;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  @Field()
  isActive?: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  @Field(() => Date)
  createdAt?: Date;
}
