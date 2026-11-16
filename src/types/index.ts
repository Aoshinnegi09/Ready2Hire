import { Database, UserRole, ApplicationStatus, SkillLevel, QuestionType, TestAttemptStatus, ProctoringStatus, ProctoringSeverity, WorkMode, JobType, JobStatus } from './database';

export * from './database';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  role: UserRole;
  headline?: string | null;
  bio?: string | null;
  location?: string | null;
  phone?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  portfolio_url?: string | null;
  is_verified: boolean;
  is_suspended: boolean;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  website?: string | null;
  description?: string | null;
  industry?: string | null;
  location?: string | null;
  company_size?: string | null;
  is_verified: boolean;
}

export interface JobWithCompany {
  id: string;
  recruiter_id: string;
  company_id: string;
  title: string;
  slug: string;
  description: string;
  requirements: string;
  responsibilities?: string | null;
  location: string;
  work_mode: WorkMode;
  job_type: JobType;
  min_experience: number;
  max_experience: number;
  min_salary?: number | null;
  max_salary?: number | null;
  currency: string;
  required_skills: string[];
  nice_to_have_skills?: string[] | null;
  industry?: string | null;
  status: JobStatus;
  deadline?: string | null;
  created_at: string;
  updated_at: string;
  company: Company;
  match_percentage?: number;
  applications_count?: number;
  is_saved?: boolean;
}

export interface ResumeData {
  id: string;
  user_id: string;
  title: string;
  file_url?: string | null;
  file_name?: string | null;
  file_type?: string | null;
  raw_text?: string | null;
  parsed_data: {
    personal_info?: {
      full_name?: string;
      email?: string;
      phone?: string;
      location?: string;
      links?: string[];
    };
    education?: Array<{
      institution: string;
      degree: string;
      field_of_study: string;
      start_year: string;
      end_year: string;
      grade?: string;
    }>;
    experience?: Array<{
      company: string;
      position: string;
      start_date: string;
      end_date: string;
      current?: boolean;
      description: string;
      technologies?: string[];
    }>;
    skills?: {
      languages?: string[];
      frameworks?: string[];
      tools?: string[];
      databases?: string[];
      concepts?: string[];
    };
    projects?: Array<{
      title: string;
      description: string;
      technologies?: string[];
      link?: string;
    }>;
    certifications?: string[];
  };
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResumeAnalysisResult {
  id: string;
  resume_id: string | null;
  user_id: string;
  job_id?: string | null;
  job_title?: string | null;
  job_description: string;
  overall_score: number;
  parser_score: number;
  skills_score: number;
  experience_score: number;
  ats_score: number;
  summary: string;
  created_at: string;
  agents: {
    parser: AgentOutputData;
    skills_matcher: AgentOutputData;
    experience_evaluator: AgentOutputData;
    ats_checker: AgentOutputData;
    final_scorer: AgentOutputData;
  };
}

export interface AgentOutputData {
  agent_name: string;
  score: number;
  status: string;
  data: Record<string, any>;
  suggestions: string[];
  execution_time_ms: number;
}

export interface Question {
  id: string;
  track_id: string;
  level: SkillLevel;
  type: QuestionType;
  topic: string;
  question_text: string;
  code_snippet?: string | null;
  options: Array<{ id: string; text: string }>;
  explanation: string;
  points: number;
}

export interface TestWithTrack {
  id: string;
  title: string;
  track_id: string;
  track_name?: string;
  track_slug?: string;
  track_icon?: string;
  level: SkillLevel;
  duration_minutes: number;
  total_questions: number;
  passing_score: number;
  is_active: boolean;
}

export interface TestAttemptDetail {
  id: string;
  test_id: string;
  user_id: string;
  assignment_id?: string | null;
  status: TestAttemptStatus;
  score_percentage: number;
  grade_band: string;
  total_questions: number;
  correct_answers_count: number;
  started_at: string;
  completed_at?: string | null;
  duration_seconds: number;
  topic_breakdown: Record<string, { correct: number; total: number; score: number }>;
  strengths: string[];
  weaknesses: string[];
  proctoring_risk_score: number;
  proctoring_status: ProctoringStatus;
  reviewer_notes?: string | null;
  reviewer_decision?: string | null;
  created_at: string;
  test: TestWithTrack;
  candidate?: UserProfile;
}

export interface ProctoringViolationEvent {
  id?: string;
  attempt_id: string;
  event_type:
    | 'NO_FACE'
    | 'MULTIPLE_FACES'
    | 'FACE_OUT_OF_FRAME'
    | 'LOOKING_AWAY'
    | 'OBJECT_DETECTED'
    | 'VOICE_DETECTED'
    | 'TAB_SWITCH'
    | 'WINDOW_BLUR'
    | 'FULLSCREEN_EXIT'
    | 'SCREEN_SHARE_STOPPED'
    | 'HARDWARE_TRACK_ENDED'
    | 'CLIPBOARD_ACTION'
    | 'RIGHT_CLICK'
    | 'DEVTOOLS_SHORTCUT'
    | 'DIFFERENT_PERSON';
  severity: ProctoringSeverity;
  timestamp: string;
  details: Record<string, any>;
  snapshot_url?: string;
}

export interface CandidateApplication {
  id: string;
  job_id: string;
  applicant_id: string;
  resume_id?: string | null;
  status: ApplicationStatus;
  match_score: number;
  resume_score: number;
  test_score?: number | null;
  proctoring_risk?: number | null;
  notes?: string | null;
  share_test_consent: boolean;
  created_at: string;
  updated_at: string;
  applicant: UserProfile;
  job: JobWithCompany;
  resume?: ResumeData;
  best_test_attempt?: TestAttemptDetail;
}
