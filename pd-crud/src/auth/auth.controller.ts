import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { successResponse } from '../common/response/response.helper';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    const user = await this.authService.register(body);

    return successResponse(user, 'User registered successfully', 201);
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    const result = await this.authService.login(body);

    return successResponse(result, 'Login successful');
  }
}