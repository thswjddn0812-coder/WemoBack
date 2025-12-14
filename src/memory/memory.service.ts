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

  create(createMemoryDto: CreateMemoryDto, user: any) {
    const memory = this.memoryRepository.create({
      ...createMemoryDto,
      user: { id: user.userId }, // Associate with user using ID
    });
    return this.memoryRepository.save(memory);
  }

  async getMemoryCounts(yearMonth: string, user: any) {
    // yearMonth format: "YYYY-MM"
    const startDate = `${yearMonth}-01`;
    // MySQL-specific query
    const results = await this.memoryRepository
      .createQueryBuilder('memory')
      .select('memory.date', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('memory.date LIKE :yearMonth', { yearMonth: `${yearMonth}%` })
      .andWhere('memory.userId = :userId', { userId: user.userId })
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

  findAll(date: string | undefined, user: any) {
    if (date && date !== 'all') {
      return this.memoryRepository.find({
        where: { date: date, user: { id: user.userId } },
        order: { createdAt: 'DESC' },
      });
    }
    return this.memoryRepository.find({
      where: { user: { id: user.userId } },
      order: { createdAt: 'DESC' },
    });
  }

  findOne(id: number, user: any) {
    return this.memoryRepository.findOne({ where: { id, user: { id: user.userId } } });
  }

  update(id: number, updateMemoryDto: UpdateMemoryDto, user: any) {
    return this.memoryRepository.update({ id, user: { id: user.userId } }, updateMemoryDto);
  }

  remove(id: number, user: any) {
    return this.memoryRepository.delete({ id, user: { id: user.userId } });
  }
}
