import { User } from '../../user/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class Memory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  text: string;

  @Column('longtext', { nullable: true })
  imageUrl: string;

  @Column({ type: 'date' })
  date: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true }) // Nullable for migration (existing data has no user)
  userId: number;

  @ManyToOne(() => User, (user) => user.memories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
