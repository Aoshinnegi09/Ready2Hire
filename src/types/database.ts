export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'applicant' | 'recruiter' | 'admin';
export type WorkMode = 'remote' | 'hybrid' | 'onsite';
export type JobType = 'full-time' | 'internship' | 'contract';
export type JobStatus = 'active' | 'paused' | 'closed';
export type ApplicationStatus =
  | 'applied'
  | 'under_review'
  | 'shortlisted'
  | 'test_assigned'
  | 'interview'
  | 'offer'
  | 'rejected';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type QuestionType = 'mcq' | 'multi_select' | 'code_output';
export type TestAttemptStatus = 'in_progress' | 'completed' | 'timed_out' | 'terminated';
export type ProctoringStatus = 'clean' | 'needs_review' | 'flagged';
export type ProctoringSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          role: UserRole;
          headline: string | null;
          bio: string | null;
          location: string | null;
          phone: string | null;
          github_url: string | null;
          linkedin_url: string | null;
          portfolio_url: string | null;
          is_verified: boolean;
          is_suspended: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          avatar_url?: string | null;
          role?: UserRole;
          headline?: string | null;
          bio?: string | null;
          location?: string | null;
          phone?: string | null;
          github_url?: string | null;
          linkedin_url?: string | null;
          portfolio_url?: string | null;
          is_verified?: boolean;
          is_suspended?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      companies: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          website: string | null;
          description: string | null;
          industry: string | null;
          location: string | null;
          company_size: string | null;
          is_verified: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          website?: string | null;
          description?: string | null;
          industry?: string | null;
          location?: string | null;
          company_size?: string | null;
          is_verified?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['companies']['Insert']>;
      };
      jobs: {
        Row: {
          id: string;
          recruiter_id: string;
          company_id: string;
          title: string;
          slug: string;
          description: string;
          requirements: string;
          responsibilities: string | null;
          location: string;
          work_mode: WorkMode;
          job_type: JobType;
          min_experience: number;
          max_experience: number;
          min_salary: number | null;
          max_salary: number | null;
          currency: string;
          required_skills: string[];
          nice_to_have_skills: string[] | null;
          industry: string | null;
          status: JobStatus;
          deadline: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          recruiter_id: string;
          company_id: string;
          title: string;
          slug: string;
          description: string;
          requirements: string;
          responsibilities?: string | null;
          location: string;
          work_mode?: WorkMode;
          job_type?: JobType;
          min_experience?: number;
          max_experience?: number;
          min_salary?: number | null;
          max_salary?: number | null;
          currency?: string;
          required_skills?: string[];
          nice_to_have_skills?: string[] | null;
          industry?: string | null;
          status?: JobStatus;
          deadline?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['jobs']['Insert']>;
      };
      applications: {
        Row: {
          id: string;
          job_id: string;
          applicant_id: string;
          resume_id: string | null;
          status: ApplicationStatus;
          match_score: number | null;
          resume_score: number | null;
          test_score: number | null;
          proctoring_risk: number | null;
          notes: string | null;
          share_test_consent: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          applicant_id: string;
          resume_id?: string | null;
          status?: ApplicationStatus;
          match_score?: number | null;
          resume_score?: number | null;
          test_score?: number | null;
          proctoring_risk?: number | null;
          notes?: string | null;
          share_test_consent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['applications']['Insert']>;
      };
      application_events: {
        Row: {
          id: string;
          application_id: string;
          from_status: ApplicationStatus | null;
          to_status: ApplicationStatus;
          note: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          from_status?: ApplicationStatus | null;
          to_status: ApplicationStatus;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['application_events']['Insert']>;
      };
      resumes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          file_url: string | null;
          file_name: string | null;
          file_type: string | null;
          raw_text: string | null;
          parsed_data: Json | null;
          is_primary: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          file_url?: string | null;
          file_name?: string | null;
          file_type?: string | null;
          raw_text?: string | null;
          parsed_data?: Json | null;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['resumes']['Insert']>;
      };
      resume_analyses: {
        Row: {
          id: string;
          resume_id: string | null;
          user_id: string;
          job_id: string | null;
          job_title: string | null;
          job_description: string;
          overall_score: number;
          parser_score: number;
          skills_score: number;
          experience_score: number;
          ats_score: number;
          summary: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          resume_id?: string | null;
          user_id: string;
          job_id?: string | null;
          job_title?: string | null;
          job_description: string;
          overall_score?: number;
          parser_score?: number;
          skills_score?: number;
          experience_score?: number;
          ats_score?: number;
          summary?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['resume_analyses']['Insert']>;
      };
      agent_outputs: {
        Row: {
          id: string;
          analysis_id: string;
          agent_name: string;
          score: number;
          status: string;
          data: Json;
          suggestions: Json;
          execution_time_ms: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          analysis_id: string;
          agent_name: string;
          score: number;
          status?: string;
          data?: Json;
          suggestions?: Json;
          execution_time_ms?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['agent_outputs']['Insert']>;
      };
      tracks: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['tracks']['Insert']>;
      };
      questions: {
        Row: {
          id: string;
          track_id: string;
          level: SkillLevel;
          type: QuestionType;
          topic: string;
          question_text: string;
          code_snippet: string | null;
          options: Json;
          correct_answers: Json;
          explanation: string;
          points: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          track_id: string;
          level?: SkillLevel;
          type?: QuestionType;
          topic: string;
          question_text: string;
          code_snippet?: string | null;
          options: Json;
          correct_answers: Json;
          explanation: string;
          points?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['questions']['Insert']>;
      };
      tests: {
        Row: {
          id: string;
          title: string;
          track_id: string;
          level: SkillLevel;
          duration_minutes: number;
          total_questions: number;
          passing_score: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          track_id: string;
          level?: SkillLevel;
          duration_minutes?: number;
          total_questions?: number;
          passing_score?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['tests']['Insert']>;
      };
      test_assignments: {
        Row: {
          id: string;
          test_id: string;
          candidate_id: string;
          recruiter_id: string | null;
          job_id: string | null;
          status: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          test_id: string;
          candidate_id: string;
          recruiter_id?: string | null;
          job_id?: string | null;
          status?: string;
          expires_at?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['test_assignments']['Insert']>;
      };
      test_attempts: {
        Row: {
          id: string;
          test_id: string;
          user_id: string;
          assignment_id: string | null;
          status: TestAttemptStatus;
          score_percentage: number | null;
          grade_band: string | null;
          total_questions: number;
          correct_answers_count: number;
          started_at: string;
          completed_at: string | null;
          duration_seconds: number | null;
          topic_breakdown: Json | null;
          strengths: Json | null;
          weaknesses: Json | null;
          proctoring_risk_score: number | null;
          proctoring_status: ProctoringStatus;
          reviewer_notes: string | null;
          reviewer_decision: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          test_id: string;
          user_id: string;
          assignment_id?: string | null;
          status?: TestAttemptStatus;
          score_percentage?: number | null;
          grade_band?: string | null;
          total_questions?: number;
          correct_answers_count?: number;
          started_at?: string;
          completed_at?: string | null;
          duration_seconds?: number | null;
          topic_breakdown?: Json | null;
          strengths?: Json | null;
          weaknesses?: Json | null;
          proctoring_risk_score?: number | null;
          proctoring_status?: ProctoringStatus;
          reviewer_notes?: string | null;
          reviewer_decision?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['test_attempts']['Insert']>;
      };
      answers: {
        Row: {
          id: string;
          attempt_id: string;
          question_id: string;
          selected_options: Json;
          is_correct: boolean | null;
          time_spent_seconds: number;
          is_flagged: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          attempt_id: string;
          question_id: string;
          selected_options?: Json;
          is_correct?: boolean | null;
          time_spent_seconds?: number;
          is_flagged?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['answers']['Insert']>;
      };
      proctoring_events: {
        Row: {
          id: string;
          attempt_id: string;
          event_type: string;
          severity: ProctoringSeverity;
          timestamp: string;
          details: Json;
          snapshot_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          attempt_id: string;
          event_type: string;
          severity?: ProctoringSeverity;
          timestamp?: string;
          details?: Json;
          snapshot_url?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['proctoring_events']['Insert']>;
      };
      proctoring_snapshots: {
        Row: {
          id: string;
          attempt_id: string;
          event_id: string | null;
          snapshot_url: string;
          trigger_reason: string;
          captured_at: string;
        };
        Insert: {
          id?: string;
          attempt_id: string;
          event_id?: string | null;
          snapshot_url: string;
          trigger_reason: string;
          captured_at?: string;
        };
        Update: Partial<Database['public']['Tables']['proctoring_snapshots']['Insert']>;
      };
      saved_jobs: {
        Row: {
          id: string;
          user_id: string;
          job_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_id: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['saved_jobs']['Insert']>;
      };
      saved_searches: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          query_params: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          query_params?: Json;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['saved_searches']['Insert']>;
      };
      job_alerts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          query_params: Json;
          frequency: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          query_params?: Json;
          frequency?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['job_alerts']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          link: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type?: string;
          link?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          target_type: string;
          target_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          target_type: string;
          target_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>;
      };
      app_settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['app_settings']['Insert']>;
      };
    };
  };
}
