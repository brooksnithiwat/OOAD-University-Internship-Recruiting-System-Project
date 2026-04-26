export type ApiErrorData = {
  message?: string;
  status?: number;
  code?: string;
};

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
