export interface FormRequestStatus {
  isLoading: boolean;
  error: string|null;
  completedSuccessfully?: boolean;
}