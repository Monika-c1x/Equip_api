import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum CandidateStatus {
  ONBOARDED = 'ONBOARDED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

@Entity('candidates')
@Index(['email'])
@Index(['inviteTokenUsed'])
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: false,
  })
  email!: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  name!: string ;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  passwordHash!: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  inviteTokenUsed!: string;

  @Column({
    type: 'enum',
    enum: CandidateStatus,
    default: CandidateStatus.ONBOARDED,
  })
  status!: CandidateStatus;

  @Column({
    type: 'boolean',
    default: false,
  })
  emailVerified!: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  lastLogin!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({
    type: 'text',
    nullable: true,
  })
  metadata!: string;
}
