interface ApiResponse<T = void> {
  success: boolean;
  error?: string;
  response?: T;
}