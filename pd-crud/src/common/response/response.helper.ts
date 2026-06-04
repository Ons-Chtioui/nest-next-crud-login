export function successResponse<T>(
  data: T,
  message = 'Success',
  statusCode = 200,
) {
  return {
    statusCode,
    message,
    data,
    error: false,
  };
}
export function errorResponse(
  message = 'Error',
  statusCode = 400,
) {
  return {
    statusCode,
    message,
    data: null,
    error: true,
  };
}