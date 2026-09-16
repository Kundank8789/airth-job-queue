import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { JobStatus } from '../job-status.enum';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ length: 100 })
  type: string;

  @Column({
    type: 'text',
    default: JobStatus.PENDING,
  })
  status: JobStatus;

  @CreateDateColumn()
  createdAt: Date;
}