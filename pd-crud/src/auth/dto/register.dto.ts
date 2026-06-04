import { IsEmail, IsString, MinDate, minLength, MinLength } from "class-validator";

export class RegisterDto {
@IsString()
  firstName!: string;
@IsString()
  lastName!: string;
   @IsEmail()
  email!: string;
@IsString()
@MinLength(6)
  password!: string;
}