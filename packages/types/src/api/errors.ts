export enum ErrorCode {
  // Generic
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',

  // Patient
  PATIENT_NOT_FOUND = 'PATIENT_NOT_FOUND',
  PATIENT_CPF_DUPLICATE = 'PATIENT_CPF_DUPLICATE',

  // Professional
  PROFESSIONAL_NOT_FOUND = 'PROFESSIONAL_NOT_FOUND',

  // Convenio
  CONVENIO_NOT_FOUND = 'CONVENIO_NOT_FOUND',

  // Attendance unit
  ATTENDANCE_UNIT_NOT_FOUND = 'ATTENDANCE_UNIT_NOT_FOUND',

  // Appointment type
  APPOINTMENT_TYPE_NOT_FOUND = 'APPOINTMENT_TYPE_NOT_FOUND',

  // Professional schedule
  PROFESSIONAL_SCHEDULE_NOT_FOUND = 'PROFESSIONAL_SCHEDULE_NOT_FOUND',
  PROFESSIONAL_SCHEDULE_CONFLICT = 'PROFESSIONAL_SCHEDULE_CONFLICT',
}

export class AppError extends Error {
  readonly code: ErrorCode
  readonly statusCode: number

  constructor(code: ErrorCode, message: string, statusCode = 500) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        statusCode: this.statusCode,
      },
    }
  }
}
