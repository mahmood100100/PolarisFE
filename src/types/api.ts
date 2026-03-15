export interface ApiResponseSuccess<T> {
  success: true;
  message: string;
  result: T;
}

export interface ApiResponseError {
  success: false;
  error: string;
  statusCode: number;
}
