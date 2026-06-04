import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { Repository } from 'typeorm';
import { Country } from './entities/country.entity';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class CountryService {
  constructor(@InjectRepository(Country) private readonly countryRepository:Repository<Country>){}
 async create(createCountryDto: CreateCountryDto) {
    const country=this.countryRepository.create(createCountryDto);
    return await this.countryRepository.save(country);
  }

  async findAll() {
    return await this.countryRepository.find({ relations: {
      cities: true,
    },});
  }

  async findOne(id: number) {
    return await this.countryRepository.findOne({
      where: { id },
       relations: {
      cities: true,
    },
    });
  }

  async update(id: number, updateCountryDto: UpdateCountryDto) {
 const country=await this.findOne(id);
     if(!country){
       throw new NotFoundException();
     }
     Object.assign(country,updateCountryDto)
     return  await this.countryRepository.save(country);
   }

  async remove(id: number) {
    const country=await this.findOne(id);
    if(!country){
       throw new NotFoundException();
     }
    return await this.countryRepository.remove(country);
  }
}
