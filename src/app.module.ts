import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import Redis from 'ioredis';
import { join } from 'path';
import { StatsModule } from './stats/stats.module';
import { TestsModule } from './tests/tests.module';

@Module({
  imports: [
    // config PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: 5432,
      username: 'user',
      password: 'pass',
      database: 'analytics_db',
      autoLoadEntities: true,   // Automatically registers .entity.ts files
      synchronize: true,        // Creates tables automatically (only for development, disable in production)
    }),
    EventsModule,
    ThrottlerModule.forRoot({
      throttlers: [{ limit: 1000000, ttl: 60000 }], // 10 requests per minute per IP/ID
      storage: new ThrottlerStorageRedisService(
        new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
      ),
    }),
    ServeStaticModule.forRoot({
      // Указываем путь к папке dist, которую создал Vite
      rootPath: join(__dirname, '..', 'client', 'dist'),
    }),
    ScheduleModule.forRoot(),
    StatsModule,
    TestsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }