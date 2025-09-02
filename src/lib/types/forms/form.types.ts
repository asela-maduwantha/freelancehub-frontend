import { UserRole } from "../enums/status.types";

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
};

export type OtpVerification = {
  email: string;
  otp: string;
};