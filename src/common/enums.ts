// common/enums.ts
import { registerEnumType } from '@nestjs/graphql';

export enum RoleEnum {
  RECRUITER = 'recruiter',
  CANDIDATE = 'candidate',
  ADMIN = 'admin',
}

export enum InviteStatusEnum {
  SENT = 'sent',
  OPENED = 'opened',
  ATTEMPTED = 'attempted',
  COMPLETED = 'completed',
}

export enum AttemptStatusEnum {
  STARTED = 'started',
  COMPLETED = 'completed',
}

export enum CandidateStatusEnum {
  APPLIED = 'applied',
  SHORTLISTED = 'shortlisted',
  HIRED = 'hired',
  REJECTED = 'rejected',
}

// Register all enums with GraphQL
export function registerEnums() {
  registerEnumType(RoleEnum, {
    name: 'RoleEnum',
    description: 'User roles in the Equip platform',
  });

  registerEnumType(InviteStatusEnum, {
    name: 'InviteStatusEnum',
    description: 'Status of an assessment invitation',
  });

  registerEnumType(AttemptStatusEnum, {
    name: 'AttemptStatusEnum',
    description: 'Status of a candidate test session',
  });

  registerEnumType(CandidateStatusEnum, {
    name: 'CandidateStatusEnum',
    description: 'Recruitment status of the candidate',
  });
}