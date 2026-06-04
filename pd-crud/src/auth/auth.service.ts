import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: RegisterDto) {
    //  check email unique
    const existingUser = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = this.userRepository.create({
      ...data,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    const { password, ...result } = savedUser;

    return result;
  }

  async login(data: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      role:user.role,
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }
  async createAdmin() {
  const existing = await this.userRepository.findOne({
    where: { email: 'admin@gmail.com' },
  });

  if (existing) return;

  const hashedPassword = await bcrypt.hash('123456', 10);

  const admin = this.userRepository.create({
    firstName: 'Admin',
    lastName:'admin',
    email: 'admin@gmail.com',
    password: hashedPassword,
    role: 'admin',
  });

  await this.userRepository.save(admin);
}
  
}