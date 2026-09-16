import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './entities/job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { JobStatus } from './job-status.enum';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
  ) {}

  async create(createJobDto: CreateJobDto): Promise<Job> {
    const job = this.jobsRepository.create(createJobDto);

    return this.jobsRepository.save(job);
  }

  async findAll(): Promise<Job[]> {
    return this.jobsRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async updateStatus(
    id: number,
    updateJobStatusDto: UpdateJobStatusDto,
  ): Promise<Job> {
    const nextStatus = updateJobStatusDto.status;

    const job = await this.jobsRepository.findOne({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException(`Job with id ${id} not found`);
    }

    const allowedTransitions: Record<JobStatus, JobStatus[]> = {
      [JobStatus.PENDING]: [JobStatus.RUNNING, JobStatus.FAILED],
      [JobStatus.RUNNING]: [JobStatus.COMPLETED, JobStatus.FAILED],
      [JobStatus.COMPLETED]: [],
      [JobStatus.FAILED]: [],
    };

    if (!allowedTransitions[job.status].includes(nextStatus)) {
      throw new BadRequestException(
        `Invalid status transition: ${job.status} → ${nextStatus}`,
      );
    }

    const result = await this.jobsRepository
      .createQueryBuilder()
      .update(Job)
      .set({ status: nextStatus })
      .where('id = :id', { id })
      .andWhere('status = :currentStatus', {
        currentStatus: job.status,
      })
      .execute();

    if (result.affected !== 1) {
      throw new BadRequestException(
        'Job status changed before this request could be applied',
      );
    }

    return this.jobsRepository.findOneOrFail({
      where: { id },
    });
  }

  async remove(id: number): Promise<void> {
    const job = await this.jobsRepository.findOne({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException(`Job with id ${id} not found`);
    }

    await this.jobsRepository.remove(job);
  }
}