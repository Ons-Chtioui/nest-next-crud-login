import { MinLength,IsBoolean, IsNumber, IsString, IsOptional } from "class-validator";

export class CreateCityDto {
      @IsString()
  @MinLength(3)
    name!: string;
     @IsOptional()
  @IsString()
    description!: string;
    @IsBoolean()
    active!: boolean;
    @IsNumber()
    countryId!:number;
}
