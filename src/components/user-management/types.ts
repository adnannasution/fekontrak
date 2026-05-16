
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'pic' | 'viewer';
  company_name?: string;
  phone?: string;
  created_at: string;
  updated_at?: string;
  is_active: boolean;
}

export interface UserFormData {
  email: string;
  full_name: string;
  role: 'admin' | 'pic' | 'viewer';
  company_name: string;
  phone: string;
}
