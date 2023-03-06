import { IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsEmail(undefined, { message: 'INVALID_EMAIL' })
  email: string;
}
