import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
     app.enableCors();
    const authService = app.get(AuthService);

   // await authService.createAdmin();

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
