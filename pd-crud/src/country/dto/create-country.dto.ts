import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateCountryDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(5)
  @Matches(/^[A-Z]+$/, {
    message: 'code must contain only uppercase letters',
  })
  code!: string;
}