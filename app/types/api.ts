import type { Profile, User } from "./index";

export interface Links {
  self: string;
  prev: string | null;
  next: string | null;
}

export interface SuccessResponse<T> {
  status: "success";
  total?: number;
  page?: number;
  limit?: number;
  total_pages?: number;
  links?: Links;
  message?: string;
  count?: number;
  data: T;
}

export interface ErrorResponse {
  status: "error";
  message: string;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export interface ProfileFilters {
  gender?: "male" | "female";
  country_id?: string;
  age_group?: "child" | "teenager" | "adult" | "senior";
  min_age?: number;
  max_age?: number;
  min_gender_probability?: number;
  min_country_probability?: number;
  sort_by?: "age" | "created_at" | "gender_probability";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
}

export interface LoginCallbackResponse {
  status: "success" | "error";
  message: string;
  data?: {
    access_token: string;
    username: string;
    role: string;
  };
}

export interface RefreshResponse {
  status: "success" | "error";
  data?: {
    access_token: string;
    refresh_token: string;
  };
}

export interface WhoamiResponse {
  user: User;
}