import { apiClient } from './client';
import type { Candidate } from '../../types/candidate';

export interface CreateCandidateRequest {
  name: string;
}

export interface CandidateListResponse {
  candidates: Candidate[];
}

export const candidatesApi = {
  getAll: () => apiClient.get<CandidateListResponse>('/candidates'),
  
  getById: (id: number) => apiClient.get<Candidate>(`/candidates/${id}`),
  
  create: (data: CreateCandidateRequest) => 
    apiClient.post<Candidate>('/candidates', data),
  
  transition: (id: number, targetStage: string) =>
    apiClient.post<Candidate>(`/candidates/${id}/transition`, { target_stage: targetStage }),
  
  reject: (id: number) =>
    apiClient.post<Candidate>(`/candidates/${id}/reject`, {}),

  delete: (id: number) =>
    apiClient.delete<void>(`/candidates/${id}`),
  
  getHistory: (id: number) => apiClient.get<any>(`/candidates/${id}/history`),
};