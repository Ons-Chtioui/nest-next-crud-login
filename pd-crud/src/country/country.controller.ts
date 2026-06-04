import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { CountryService } from './country.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';

import {
  successResponse,
  errorResponse,
} from '../common/response/response.helper';

@Controller('country')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Post()
  async create(@Body() createCountryDto: CreateCountryDto) {
    const country = await this.countryService.create(createCountryDto);

    return successResponse(country, 'Country created successfully', 201);
  }

  @Get()
  async findAll() {
    const countries = await this.countryService.findAll();

    return successResponse(countries, 'Countries retrieved successfully');
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const country = await this.countryService.findOne(+id);

    if (!country) {
      return errorResponse('Country not found', 404);
    }

    return successResponse(country, 'Country retrieved successfully');
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCountryDto: UpdateCountryDto,
  ) {
    const updated = await this.countryService.update(+id, updateCountryDto);

    return successResponse(updated, 'Country updated successfully');
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.countryService.remove(+id);

    return successResponse(null, 'Country deleted successfully');
  }
}