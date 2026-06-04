import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CitiesService } from './cities.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  successResponse,
  errorResponse,
} from '../common/response/response.helper';
@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

 
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post()
  async create(@Body() createCityDto: CreateCityDto) {
    const city = await this.citiesService.create(createCityDto);
    return successResponse(city, 'City created successfully', 201);
  }

  
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  //@Roles('admin')
  @Get()
  async findAll() {
    const cities = await this.citiesService.findAll();
    return successResponse(cities, 'Cities retrieved successfully');
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const city = await this.citiesService.findOne(+id);

    return successResponse(city, 'City retrieved successfully');
  }

 
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCityDto: UpdateCityDto,
  ) {
    const updated = await this.citiesService.update(+id, updateCityDto);
    return successResponse(updated, 'City updated successfully');
  }


  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.citiesService.remove(+id);
    return successResponse(null, 'City deleted successfully');
  }
}