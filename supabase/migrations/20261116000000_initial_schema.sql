-- Ready2Hire Initial Production Database Migration
-- Fully normalized Postgres schema with strict RLS, triggers, indexes, and audit logs

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. ENUMS & DOMAIN TYPES
-- ============================================================================
CREATE TYPE user_role AS ENUM ('applicant', 'recruiter', 'admin');
CREATE TYPE work_mode AS ENUM ('remote', 'hybrid', 'onsite');
CREATE TYPE job_type AS ENUM ('full-time', 'internship', 'contract');
CREATE TYPE job_status AS ENUM ('active', 'paused', 'closed');
CREATE TYPE application_status AS ENUM (
  'applied',
  'under_review',
  'shortlisted',
  'test_assigned',
  'interview',
  'offer',
  'rejected'
);
CREATE TYPE skill_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE question_type AS ENUM ('mcq', 'multi_select', 'code_output');
CREATE TYPE test_attempt_status AS ENUM ('in_progress', 'completed', 'timed_out', 'terminated');
CREATE TYPE proctoring_status AS ENUM ('clean', 'needs_review', 'flagged');
CREATE TYPE proctoring_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- ============================================================================
-- 2. CORE TABLES
-- ============================================================================

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'applicant',
  headline TEXT,
  bio TEXT,
  location TEXT,
  phone TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_suspended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- COMPANIES
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  website TEXT,
  description TEXT,
  industry TEXT,
  location TEXT,
  company_size TEXT DEFAULT '50-200 employees',
  is_verified BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- RECRUITER_COMPANY_MAP
CREATE TABLE IF NOT EXISTS public.recruiter_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(recruiter_id, company_id)
);

-- JOBS
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  responsibilities TEXT,
  location TEXT NOT NULL,
  work_mode work_mode NOT NULL DEFAULT 'hybrid',
  job_type job_type NOT NULL DEFAULT 'full-time',
  min_experience NUMERIC(3,1) NOT NULL DEFAULT 0,
  max_experience NUMERIC(3,1) NOT NULL DEFAULT 5,
  min_salary NUMERIC(12,2),
  max_salary NUMERIC(12,2),
  currency TEXT NOT NULL DEFAULT 'INR',
  required_skills TEXT[] NOT NULL DEFAULT '{}',
  nice_to_have_skills TEXT[] DEFAULT '{}',
  industry TEXT,
  status job_status NOT NULL DEFAULT 'active',
  deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- RESUMES
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'My Resume',
  file_url TEXT,
  file_name TEXT,
  file_type TEXT,
  raw_text TEXT,
  parsed_data JSONB DEFAULT '{}'::jsonb,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- RESUME ANALYSES & 5-AGENT SYSTEM
CREATE TABLE IF NOT EXISTS public.resume_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  job_title TEXT,
  job_description TEXT NOT NULL,
  overall_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  parser_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  skills_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  experience_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  ats_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.agent_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES public.resume_analyses(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL, -- 'parser', 'skills_matcher', 'experience_evaluator', 'ats_checker', 'final_scorer'
  score NUMERIC(5,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
  execution_time_ms INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- APPLICATIONS
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  status application_status NOT NULL DEFAULT 'applied',
  match_score NUMERIC(5,2) DEFAULT 0,
  resume_score NUMERIC(5,2) DEFAULT 0,
  test_score NUMERIC(5,2),
  proctoring_risk NUMERIC(5,2),
  notes TEXT,
  share_test_consent BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(job_id, applicant_id)
);

CREATE TABLE IF NOT EXISTS public.application_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  from_status application_status,
  to_status application_status NOT NULL,
  note TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- SAVED ITEMS & ALERTS
CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, job_id)
);

CREATE TABLE IF NOT EXISTS public.saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  query_params JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.job_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  query_params JSONB NOT NULL DEFAULT '{}'::jsonb,
  frequency TEXT NOT NULL DEFAULT 'daily',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 3. SKILL TESTS & QUESTION BANK
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT 'Code',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  level skill_level NOT NULL DEFAULT 'intermediate',
  type question_type NOT NULL DEFAULT 'mcq',
  topic TEXT NOT NULL,
  question_text TEXT NOT NULL,
  code_snippet TEXT,
  options JSONB NOT NULL, -- array of { id: string, text: string }
  correct_answers JSONB NOT NULL, -- array of ids
  explanation TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  level skill_level NOT NULL DEFAULT 'intermediate',
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  total_questions INTEGER NOT NULL DEFAULT 15,
  passing_score NUMERIC(5,2) NOT NULL DEFAULT 60.0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.test_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recruiter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'assigned', -- 'assigned', 'in_progress', 'completed', 'expired'
  expires_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now() + interval '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES public.test_assignments(id) ON DELETE SET NULL,
  status test_attempt_status NOT NULL DEFAULT 'in_progress',
  score_percentage NUMERIC(5,2) DEFAULT 0,
  grade_band TEXT DEFAULT 'F', -- 'A+', 'A', 'B', 'C', 'D', 'F'
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_answers_count INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  topic_breakdown JSONB DEFAULT '{}'::jsonb,
  strengths JSONB DEFAULT '[]'::jsonb,
  weaknesses JSONB DEFAULT '[]'::jsonb,
  proctoring_risk_score NUMERIC(5,2) DEFAULT 0,
  proctoring_status proctoring_status DEFAULT 'clean',
  reviewer_notes TEXT,
  reviewer_decision TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.test_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_options JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_correct BOOLEAN DEFAULT FALSE,
  time_spent_seconds INTEGER DEFAULT 0,
  is_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(attempt_id, question_id)
);

-- ============================================================================
-- 4. PROCTORING & INTEGRITY SYSTEM
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.proctoring_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.test_attempts(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, 
  severity proctoring_severity NOT NULL DEFAULT 'low',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  details JSONB DEFAULT '{}'::jsonb,
  snapshot_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.proctoring_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.test_attempts(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.proctoring_events(id) ON DELETE SET NULL,
  snapshot_url TEXT NOT NULL,
  trigger_reason TEXT NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 5. NOTIFICATIONS, AUDIT & SETTINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed initial app settings
INSERT INTO public.app_settings (key, value) VALUES
('proctoring', '{
  "max_allowed_warnings": 3,
  "risk_threshold_flag": 50,
  "risk_threshold_terminate": 80,
  "face_missing_tolerance_sec": 3,
  "gaze_away_tolerance_sec": 5,
  "retake_cooldown_hours": 24
}'::jsonb),
('platform', '{
  "maintenance_mode": false,
  "allow_recruiter_signup": true,
  "verify_recruiter_domain": false
}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- 6. INDEXES FOR HIGH-PERFORMANCE SEARCH & FILTERING
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_jobs_status_recruiter ON public.jobs(status, recruiter_id);
CREATE INDEX IF NOT EXISTS idx_jobs_location_mode ON public.jobs(location, work_mode);
CREATE INDEX IF NOT EXISTS idx_jobs_skills ON public.jobs USING GIN (required_skills);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant_id ON public.applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_test_attempts_user_id ON public.test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_test_id ON public.test_attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_proctoring_events_attempt ON public.proctoring_events(attempt_id, severity);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);

-- ============================================================================
-- 7. HELPER FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to check if user has role
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id UUID)
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = p_user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id AND role = 'admin');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Trigger to handle new auth user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role user_role := 'applicant';
  v_meta_role text;
BEGIN
  -- Extract requested role from raw_user_meta_data safely
  v_meta_role := new.raw_user_meta_data->>'role';
  
  -- Admin role can NEVER be claimed at signup; default to applicant or recruiter
  IF v_meta_role = 'recruiter' THEN
    v_role := 'recruiter';
  ELSE
    v_role := 'applicant';
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    role,
    headline
  ) VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    v_role,
    CASE WHEN v_role = 'recruiter' THEN 'Talent Acquisition' ELSE 'Computer Science Student' END
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for application status change audit
CREATE OR REPLACE FUNCTION public.handle_application_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.application_events (
      application_id,
      from_status,
      to_status,
      note,
      created_by
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      'Status updated to ' || NEW.status,
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_application_status_update ON public.applications;
CREATE TRIGGER on_application_status_update
  AFTER UPDATE OF status ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_application_status_change();

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proctoring_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proctoring_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- 8.1 PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    -- Role cannot be escalated by user
    role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins have full access to profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- 8.2 COMPANIES POLICIES
CREATE POLICY "Companies viewable by all authenticated users"
  ON public.companies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Recruiters and Admins can create companies"
  ON public.companies FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin(auth.uid()) OR
    public.get_user_role(auth.uid()) = 'recruiter'
  );

CREATE POLICY "Admins or Company Creator can update company"
  ON public.companies FOR UPDATE
  TO authenticated
  USING (
    public.is_admin(auth.uid()) OR
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM public.recruiter_companies rc WHERE rc.company_id = id AND rc.recruiter_id = auth.uid() AND rc.is_admin = true)
  );

-- 8.3 JOBS POLICIES
CREATE POLICY "Active jobs viewable by everyone"
  ON public.jobs FOR SELECT
  TO authenticated
  USING (
    status = 'active' OR
    recruiter_id = auth.uid() OR
    public.is_admin(auth.uid())
  );

CREATE POLICY "Recruiters can create jobs"
  ON public.jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin(auth.uid()) OR
    (public.get_user_role(auth.uid()) = 'recruiter' AND recruiter_id = auth.uid())
  );

CREATE POLICY "Job owners and Admins can update jobs"
  ON public.jobs FOR UPDATE
  TO authenticated
  USING (
    public.is_admin(auth.uid()) OR
    recruiter_id = auth.uid()
  );

CREATE POLICY "Job owners and Admins can delete jobs"
  ON public.jobs FOR DELETE
  TO authenticated
  USING (
    public.is_admin(auth.uid()) OR
    recruiter_id = auth.uid()
  );

-- 8.4 RESUMES POLICIES
CREATE POLICY "Users can manage their own resumes"
  ON public.resumes FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Recruiters can view resumes attached to job applications"
  ON public.resumes FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    public.is_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.jobs j ON a.job_id = j.id
      WHERE a.resume_id = public.resumes.id AND j.recruiter_id = auth.uid()
    )
  );

-- 8.5 RESUME ANALYSES POLICIES
CREATE POLICY "Users can manage their own resume analyses"
  ON public.resume_analyses FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Recruiters can view analyses for their candidates"
  ON public.resume_analyses FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    public.is_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.jobs j ON a.job_id = j.id
      WHERE a.applicant_id = public.resume_analyses.user_id AND j.recruiter_id = auth.uid()
    )
  );

CREATE POLICY "Agent outputs viewable by analysis owner and recruiters"
  ON public.agent_outputs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.resume_analyses ra
      WHERE ra.id = public.agent_outputs.analysis_id AND (
        ra.user_id = auth.uid() OR public.is_admin(auth.uid())
      )
    )
  );

-- 8.6 APPLICATIONS POLICIES
CREATE POLICY "Applicants can view their own applications"
  ON public.applications FOR SELECT
  TO authenticated
  USING (
    applicant_id = auth.uid() OR
    public.is_admin(auth.uid()) OR
    EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.recruiter_id = auth.uid())
  );

CREATE POLICY "Applicants can submit applications"
  ON public.applications FOR INSERT
  TO authenticated
  WITH CHECK (applicant_id = auth.uid());

CREATE POLICY "Recruiters and Admins can update applications"
  ON public.applications FOR UPDATE
  TO authenticated
  USING (
    public.is_admin(auth.uid()) OR
    EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.recruiter_id = auth.uid())
  );

-- 8.7 SAVED JOBS & SEARCHES
CREATE POLICY "Users can manage saved jobs"
  ON public.saved_jobs FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage saved searches"
  ON public.saved_searches FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage job alerts"
  ON public.job_alerts FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 8.8 TRACKS, QUESTIONS, TESTS
CREATE POLICY "Tracks and tests are viewable by all authenticated users"
  ON public.tracks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Tests are viewable by all authenticated users"
  ON public.tests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Questions can only be viewed during active attempt or by admins"
  ON public.questions FOR SELECT
  TO authenticated
  USING (
    public.is_admin(auth.uid()) OR
    EXISTS (SELECT 1 FROM public.test_attempts ta WHERE ta.user_id = auth.uid() AND ta.status = 'in_progress')
  );

CREATE POLICY "Admins have full control over tests and questions"
  ON public.questions FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins have full control over tests"
  ON public.tests FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- 8.9 TEST ATTEMPTS & ANSWERS
CREATE POLICY "Students can view and create their own attempts"
  ON public.test_attempts FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR
    public.is_admin(auth.uid()) OR
    -- Recruiters can view if applicant consented or test was assigned by recruiter
    EXISTS (
      SELECT 1 FROM public.test_assignments ta
      WHERE ta.id = public.test_attempts.assignment_id AND ta.recruiter_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.jobs j ON a.job_id = j.id
      WHERE a.applicant_id = public.test_attempts.user_id AND a.share_test_consent = true AND j.recruiter_id = auth.uid()
    )
  )
  WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Users can manage their answers during test"
  ON public.answers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.test_attempts ta
      WHERE ta.id = public.answers.attempt_id AND (ta.user_id = auth.uid() OR public.is_admin(auth.uid()))
    )
  );

-- 8.10 PROCTORING POLICIES
CREATE POLICY "Proctoring events viewable by candidate, recruiter with consent, or admin"
  ON public.proctoring_events FOR SELECT
  TO authenticated
  USING (
    public.is_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.test_attempts ta
      WHERE ta.id = public.proctoring_events.attempt_id AND (
        ta.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.applications a
          JOIN public.jobs j ON a.job_id = j.id
          WHERE a.applicant_id = ta.user_id AND a.share_test_consent = true AND j.recruiter_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Candidates can insert proctoring events during their attempt"
  ON public.proctoring_events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.test_attempts ta
      WHERE ta.id = public.proctoring_events.attempt_id AND ta.user_id = auth.uid() AND ta.status = 'in_progress'
    )
  );

CREATE POLICY "Snapshots viewable by candidate, recruiter with consent, or admin"
  ON public.proctoring_snapshots FOR SELECT
  TO authenticated
  USING (
    public.is_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.test_attempts ta
      WHERE ta.id = public.proctoring_snapshots.attempt_id AND (
        ta.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.applications a
          JOIN public.jobs j ON a.job_id = j.id
          WHERE a.applicant_id = ta.user_id AND a.share_test_consent = true AND j.recruiter_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Candidates can insert snapshots during attempt"
  ON public.proctoring_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.test_attempts ta
      WHERE ta.id = public.proctoring_snapshots.attempt_id AND ta.user_id = auth.uid() AND ta.status = 'in_progress'
    )
  );

-- 8.11 NOTIFICATIONS & AUDIT
CREATE POLICY "Users can view and update their own notifications"
  ON public.notifications FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "App settings viewable by all, editable by admins"
  ON public.app_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can edit app settings"
  ON public.app_settings FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));
