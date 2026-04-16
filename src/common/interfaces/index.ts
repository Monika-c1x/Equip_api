// common/interfaces/index.ts

export interface User {
  id: string;
  name: string;
  role: string;
  email: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface Assessment {
  id: string;
  title: string;
  role: string;
  experienceLevel: string;
  createdBy: string; // Recruiter ID
  duration: number; // in minutes
  startTime?: Date;
  endTime?: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface McqQuestion {
  id: string;
  role: string;
  experienceLevel: string;
  question: string;
  options: Record<string, any>; // maps to JSONB
  correctAnswer: string;
  questionScore: number;
  createdAt: Date;
}

export interface AssessmentQuestion {
  id: string;
  assessmentId: string;
  questionId: string;
  marks: number;
  createdAt: Date;
}

export interface EmailTemplate {
  id: string;
  assessmentId?: string;
  name: string;
  subject: string;
  body: string;
  createdBy: string;
  createdAt: Date;
}

export interface AssessmentInvite {
  id: string;
  assessmentId: string;
  candidateId: string; 
  name: string; 
  email: string;
  inviteToken: string;
  templateId?: string;
  status: string; // sent/opened/attempted/completed
  sentAt: Date;
  expiresAt: Date;
  emailVerified: boolean;
}

export interface TestAttempt {
  id: string;
  assessmentId: string;
  candidateId: string;
  email: string;
  emailVerified: boolean;
  startTime: Date;
  endTime?: Date;
  videoUrl?: string;
  score?: number;
  status: string; // started/completed
  candidateStatus: string; // applied/shortlisted/hired/rejected
  createdAt: Date;
}

export interface Response {
  id: string;
  attemptId: string;
  questionId: string;
  selectedAnswer: number; // Or string depending on your options JSON structure
  isCorrect: boolean;
  score: number;
}

export interface Candidate {
  id: string;
  candidateId: string; // Reference to Users table
  name: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  verificationCode?: string;
  verificationExpires?: Date;
  emailVerified: boolean;
  createdAt: Date;
}

// System/API Interfaces
export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}