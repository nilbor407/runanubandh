export const httpStatusCodes = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER: 500,
  UNAUTHORIZED: 401,
  PERMISSION_DENIED: 403,
  UPLOAD_FAILED: 409,
  DELETED_FILE_FAILED: 409,
  RESOURCE_ALREADY_EXISTS: 409,
};

export const errorMessage = {
  INVALID_PASSWORD: 'Invalid Password',
  INACTIVE_USER: ' User is InActive',
  USER_NOT_FOUND: 'No User Record found',
  UNAUTHORIZED_USER: 'Unauthorized user',
  RESOURCE_NOT_FOUND: 'Resource not found',
  EMAIL_VALIDATION_FAIL: 'Email validation failed',
  INTERNAL_SERVER: 'Internal Server Error',
  PERMISSION_DENIED: 'Permission Denied',
  INVALID_REQUEST_PARAMS: 'Invalid request params',
  AUTHENTICATION_FAILED: 'Authentication failed: Invalid Auth Token ',
  USER_NAME_ALREADY_EXISTS: 'Username already exists in the system.',
  EMAIL_ALREADY_EXISTS: 'Email address already exists in the system.',
  UPLOAD_FAILED: 'S3 File Upload failed',
  DELETED_FILE_FAILED: 'S3 File deleted failed',
  USER_WITH_EMAIL_ALREADY_EXISTS:
    'A user with this email address already exists in the system.',
  USER_NOT_LOGIN:
    'Access Denied: You are not authorized to access this portal. Please contact the administrator for further assistance.',
};
