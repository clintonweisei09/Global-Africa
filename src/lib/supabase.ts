import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface Job {
  id: string;
  title: string;
  employer_id: string | null;
  company: string;
  logo: string;
  country: string;
  flag: string;
  city: string;
  salary: string;
  salary_min: number;
  salary_max: number | null;
  agent_name: string | null;
  agent_avatar: string | null;
  agent_personality: string | null;
  type: string;
  category: string;
  visa: boolean;
  accommodation: boolean;
  meals: boolean;
  insurance: boolean;
  contract: string;
  working_hours: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  description: string;
  tags: string[];
  posted: string;
  status: string;
  created_at: string;
}

export interface Employer {
  id: string;
  name: string;
  logo: string;
  tagline: string;
  country: string;
  flag: string;
  city: string;
  description: string;
  website: string;
  verified: boolean;
  rating: number;
  open_roles: number;
  hiring_history: number;
}

export interface Application {
  id: string;
  user_id: string;
  job_id: string;
  status: string;
  current_stage: number;
  stages: string[];
  stage_dates: Record<string, string>;
  interview_date: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
  job?: Job;
}

export interface SavedJob {
  id: string;
  user_id: string;
  job_id: string;
  job?: Job;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  recovery_phone: string | null;
  two_factor_enabled: boolean;
  fingerprint_enabled: boolean;
  avatar_url: string | null;
  bio: string | null;
  profession: string | null;
  country: string | null;
  city: string | null;
  experience_years: number;
  profile_completion: number;
  login_country: string | null;
  login_city: string | null;
  login_lat: number | null;
  login_lng: number | null;
  login_ip: string | null;
  login_device: string | null;
  last_login_at: string | null;
}

export interface UserDocument {
  id: string;
  user_id: string;
  type: string;
  name: string;
  file_url: string;
  status: string;
  uploaded_at: string;
}

export interface Review {
  id: string;
  employer_id: string;
  author_name: string;
  rating: number;
  title: string;
  content: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  created_at: string;
}

export interface TravelDocument {
  id: string;
  user_id: string;
  application_id: string | null;
  job_id: string | null;
  document_type: string;
  document_number: string;
  country: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  issue_date: string;
  expiry_date: string | null;
  status: string;
  fee_amount: number;
  paid_at: string | null;
  created_at: string;
}
