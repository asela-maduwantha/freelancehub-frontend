// Global success envelope from backend
export interface ApiResponse<T = unknown> {
  data: T;
  timestamp: string;
}

export interface ApiError {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  error: string;
  message: string | string[];
}
