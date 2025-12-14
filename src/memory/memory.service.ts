import { Injectable } from '@nestjs/common';
import { CreateMemoryDto } from './dto/create-memory.dto';
import { UpdateMemoryDto } from './dto/update-memory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Memory } from './entities/memory.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MemoryService {
  constructor(
    @InjectRepository(Memory)
    private memoryRepository: Repository<Memory>,
  ) {}

  create(createMemoryDto: CreateMemoryDto) {
    return this.memoryRepository.save(createMemoryDto);
  }

  async getMemoryCounts(yearMonth: string) {
    // yearMonth format: "YYYY-MM"
    const startDate = `${yearMonth}-01`;
    // MySQL-specific query
    const results = await this.memoryRepository
      .createQueryBuilder('memory')
      .select('memory.date', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('memory.date LIKE :yearMonth', { yearMonth: `${yearMonth}%` })
      .groupBy('memory.date')
      .getRawMany();

    // Transform to { "2024-12-14": 3, ... } map
    return results.reduce((acc, curr) => {
      // curr.date might be a Date object depending on driver, ensure string
      let dateStr = curr.date;
      if (curr.date instanceof Date) {
        // Use local date parts to prevent timezone shift (e.g., KST midnight -> UTC previous day)
        const year = curr.date.getFullYear();
        const month = String(curr.date.getMonth() + 1).padStart(2, '0');
        const day = String(curr.date.getDate()).padStart(2, '0');
        dateStr = `${year}-${month}-${day}`;
      }
      acc[dateStr] = parseInt(curr.count, 10);
      return acc;
    }, {});
  }

  findAll(date?: string) {
    if (date) {
      return this.memoryRepository.find({
        where: { date: date },
        order: { createdAt: 'DESC' },
      });
    }
    return this.memoryRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  findOne(id: number) {
    return this.memoryRepository.findOneBy({ id });
  }

  update(id: number, updateMemoryDto: UpdateMemoryDto) {
    return this.memoryRepository.update(id, updateMemoryDto);
  }

  remove(id: number) {
    return this.memoryRepository.delete(id);
  }
}
