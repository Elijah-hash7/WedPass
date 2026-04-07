export class RegisterDto {
  name: string;
  email: string;
  password: string;
}

export class VerifyEmailDto {
  email: string;
  otp: string;
}

export class LoginDto {
  email: string;
  password: string;
}
