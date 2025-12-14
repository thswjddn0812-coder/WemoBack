import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { MemoryService } from './memory.service';
import { CreateMemoryDto } from './dto/create-memory.dto';
import { UpdateMemoryDto } from './dto/update-memory.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('memory')
export class MemoryController {
  constructor(private readonly memoryService: MemoryService) {}

  @Post()
  create(@Body() createMemoryDto: CreateMemoryDto, @Request() req) {
    return this.memoryService.create(createMemoryDto, req.user);
  }

  @Get('counts')
  getMemoryCounts(@Query('month') month: string, @Request() req) {
    return this.memoryService.getMemoryCounts(month, req.user);
  }

  @Get()
  findAll(@Query('date') date = 'all', @Request() req) {
    return this.memoryService.findAll(date, req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.memoryService.findOne(+id, req.user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMemoryDto: UpdateMemoryDto, @Request() req) {
    return this.memoryService.update(+id, updateMemoryDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.memoryService.remove(+id, req.user);
  }
}
