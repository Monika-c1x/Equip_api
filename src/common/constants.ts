// common/constants.ts
export const JWT_SECRET = process.env.JWT_SECRET || 'equip-assessment-secret-key';
export const JWT_EXPIRES_IN = '7d';

export const ROLE = {
  RECRUITER: 'recruiter',
  CANDIDATE: 'candidate',
  ADMIN: 'admin', // Kept for platform administration
} as const;

export const INVITE_STATUS = {
  SENT: 'sent',
  OPENED: 'opened',
  ATTEMPTED: 'attempted',
  COMPLETED: 'completed',
} as const;

export const ATTEMPT_STATUS = {
  STARTED: 'started',
  COMPLETED: 'completed',
} as const;

export const CANDIDATE_STATUS = {
  APPLIED: 'applied',
  SHORTLISTED: 'shortlisted',
  HIRED: 'hired',
  REJECTED: 'rejected',
} as const;

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Resource not found',
  VALIDATION_FAILED: 'Validation failed',
  INTERNAL_ERROR: 'Internal server error',
  EMAIL_NOT_VERIFIED: 'Email address not verified',
} as const;

export const SUCCESS_MESSAGES = {
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  RETRIEVED: 'Resource retrieved successfully',
  INVITE_SENT: 'Assessment invitation sent successfully',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const FILE_UPLOAD = {
  MAX_SIZE: 50 * 1024 * 1024, // Increased to 50MB for video recordings & resumes
  ALLOWED_TYPES: ['application/pdf', 'video/webm', 'video/mp4'],
} as const;

export const CACHE_KEYS = {
  ASSESSMENTS: 'assessments',
  QUESTIONS: 'questions',
  USERS: 'users',
  TEMPLATES: 'templates',
} as const;