import { apiClient } from './client';
import type { SearchResponse } from '../../types/search';

export const searchApi = {
  search: (query: string) => 
    apiClient.post<SearchResponse>('/search', { query }),
};