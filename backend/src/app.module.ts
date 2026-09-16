import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'jobs.sqlite',
      autoLoadEntities: true,
      synchronize: true,
    }),
    JobsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}