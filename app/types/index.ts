export const Gender = {
  female: "female",
  male: "male",
} as const;

export type Gender = (typeof Gender)[keyof typeof Gender];

export const AgeGroup = {
  child: "child",
  teenager: "teenager",
  adult: "adult",
  senior: "senior",
} as const;

export type AgeGroupType = (typeof AgeGroup)[keyof typeof AgeGroup];

export const Role = {
  admin: "admin",
  analyst: "analyst",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export interface Profile {
  id: string;
  name: string;
  gender: Gender;
  gender_probability: number;
  age: number;
  age_group: AgeGroupType;
  country_id: string;
  country_name: string;
  country_probability: number;
  created_at: string | Date;
  updated_at?: string | Date;
}

export interface User {
  id: string;
  github_id: string;
  username: string;
  email: string;
  avatar_url: string;
  role: Role;
  is_active: boolean;
  last_login_at: string | Date;
  created_at: string | Date;
}

export interface Credentials {
  access_token: string;
  refresh_token: string;
  username: string;
  role: Role;
}