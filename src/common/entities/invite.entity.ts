import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum InviteStatus {
  PENDING = 'PENDING',
  USED = 'USED',
  EXPIRED = 'EXPIRED',
}

@Entity('assessment_invites')
@Index(['inviteToken'])
@Index(['email'])
@Index(['status'])
export class Invite {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: false,
    name: 'invite_token'
  })
  inviteToken!: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  email!: string;

  @Column({
    type: 'enum',
    enum: InviteStatus,
    default: InviteStatus.PENDING,
  })
  status!: InviteStatus;

  @Column({
    type: 'timestamp',
    nullable: false,
  })
  expiresAt!: Date;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  recruiterId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({
    type: 'text',
    nullable: true,
  })
  metadata?: string;
}
