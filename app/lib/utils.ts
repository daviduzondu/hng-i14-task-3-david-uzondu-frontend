import type { Gender, AgeGroupType } from "../types";

export function formatGender(gender: Gender): string {
  return gender.charAt(0).toUpperCase() + gender.slice(1);
}

export function formatAgeGroup(ageGroup: AgeGroupType): string {
  return ageGroup.charAt(0).toUpperCase() + ageGroup.slice(1);
}

export function formatProbability(probability: number): string {
  return `${Math.round(probability * 100)}%`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}