import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id/parse-mongo-id.pipe';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApiKeyGuard } from 'src/guards/api-key/api-key.guard';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(ApiKeyGuard, JwtGuard)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @UseGuards(ApiKeyGuard, JwtGuard)
  @Get()
  findAll(@Query() paginationDto : PaginationDto) {
    return this.userService.findAll(paginationDto);
  }

  @UseGuards(ApiKeyGuard, JwtGuard)
  @Delete()
  deleteAll() {
    return this.userService.deleteAll();
  } 

  @UseGuards(ApiKeyGuard, JwtGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne( id);
  }

  @UseGuards(ApiKeyGuard, JwtGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update( id, updateUserDto);
  }

  @UseGuards(ApiKeyGuard, JwtGuard)
  @Delete(':id')
  remove(@Param('id', ParseMongoIdPipe) id: string) {
    return this.userService.remove(id);
  }

  @UseGuards(ApiKeyGuard, JwtGuard)
  @Delete('/user/usersd')
  usersd(@Body() body: string[]){
    return this.userService.usersd(body);
  }
}
