import type { Database } from './supabase';

export type Role = Database['public']['Enums']['role'];
export type User = Database['public']['Tables']['user']['Row'];
export type Team = Database['public']['Tables']['team']['Row'];
export type TeamMember = Database['public']['Tables']['team_member']['Row'];
export type Invitation = Database['public']['Tables']['invitation']['Row'];
