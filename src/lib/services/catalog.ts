import { api } from '../api/api-client';
import type { Category, Skill } from '../types/catalog';

export const CategoriesService = {
  create: (body: Partial<Category>) => api.post<Category>('/categories', body),
  list: () => api.get<Category[]>('/categories'),
  popular: () => api.get<Category[]>('/categories/popular'),
  getById: (id: string) => api.get<Category>(`/categories/${id}`),
  update: (id: string, body: Partial<Category>) => api.patch<Category>(`/categories/${id}`, body),
  remove: (id: string) => api.delete<string>(`/categories/${id}`),
};

export const SkillsService = {
  list: () => api.get<Skill[]>('/skills'),
  categories: () => api.get<any>('/skills/categories'),
  getById: (id: string) => api.get<Skill>(`/skills/${id}`),
  create: (body: Partial<Skill>) => api.post<Skill>('/skills', body),
  update: (id: string, body: Partial<Skill>) => api.put<Skill>(`/skills/${id}`, body),
  remove: (id: string) => api.delete<string>(`/skills/${id}`),
  popularTop: () => api.get<Skill[]>(`/skills/popular/top`),
};
