import { Module } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CitiesController } from './cities.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { City } from './entities/city.entity';
import { Country } from 'src/country/entities/country.entity';
@Module({
  imports: [TypeOrmModule.forFeature([City, Country])],
  controllers: [CitiesController],
  providers: [CitiesService],
})
export class CitiesModule {}
