import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { City } from './entities/city.entity';
import { Country } from 'src/country/entities/country.entity';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private readonly citiesRepository: Repository<City>,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
  ) {}

  async create(createCityDto: CreateCityDto) {
    const existingCity = await this.citiesRepository.findOne({
      where: { name: createCityDto.name },
    });

    if (existingCity) {
      throw new ConflictException('City name already exists');
    }

    const country = await this.countryRepository.findOne({
      where: { id: createCityDto.countryId },
    });

    if (!country) {
      throw new NotFoundException(`Country with id ${createCityDto.countryId} not found`);
    }

    const { countryId, ...cityData } = createCityDto;
    const city = this.citiesRepository.create({
      ...cityData,
      country,
    });

    return await this.citiesRepository.save(city);
  }

  async findAll() {
    return await this.citiesRepository.find({ relations: { country: true } });
  }

  async findOne(id: number) {
    const city = await this.citiesRepository.findOne({
      where: { id },
      relations: { country: true },
    });

    if (!city) {
      throw new NotFoundException(`City with id ${id} not found`);
    }

    return city;
  }

  async update(id: number, updateCityDto: UpdateCityDto) {
    const city = await this.findOne(id);

    if (updateCityDto.countryId !== undefined) {
      const country = await this.countryRepository.findOne({
        where: { id: updateCityDto.countryId },
      });

      if (!country) {
        throw new NotFoundException(`Country with id ${updateCityDto.countryId} not found`);
      }

      city.country = country;
    }

    const { countryId, ...cityData } = updateCityDto as any;
    Object.assign(city, cityData);

    return await this.citiesRepository.save(city);
  }

  async remove(id: number) {
    const city = await this.findOne(id);

    return await this.citiesRepository.remove(city);
  }
}