export interface SearchQuery {
  name_condition?: string;
  current_stage?: string;
  duration_condition?: {
    stage: string;
    operator: string;
    value: number;
    unit: string;
  };
  history_condition?: {
    stage: string;
    comparison: string;
    date_ref: string;
  };
  include_statuses?: string[];
  exclude_statuses?: string[];
  combinator: string;
}

export interface SearchResult {
  id: number;
  name: string;
  current_stage: string;
  stage_entered_at: string;
}

export interface SearchResponse {
  query: string;
  interpretation: SearchQuery;
  results: SearchResult[];
  explanation: string | null;
}