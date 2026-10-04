// ────────────────────────────────────────────────
// Standard JSON response types
// ────────────────────────────────────────────────

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errorCode?: string;
  errors?: Record<string, string[]>;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// Helper functions to create consistent responses
export function successResponse<T>(data: T, message?: string): ApiSuccessResponse<T> {
  return { success: true, data, ...(message && { message }) };
}

export function errorResponse(
  message: string,
  errorCode?: string,
  errors?: Record<string, string[]>
): ApiErrorResponse {
  return {
    success: false,
    message,
    ...(errorCode && { errorCode }),
    ...(errors && { errors }),
  };
}

export interface PaginatedData<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function paginatedResponse<T>(
  data: T[],
  meta: PaginatedData<T>['meta'],
  message?: string
): ApiSuccessResponse<PaginatedData<T>> {
  return successResponse({ data, meta }, message);
}
