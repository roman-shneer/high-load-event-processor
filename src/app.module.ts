import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Добавляем импорт
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    // Конфигурация подключения к PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost', // Берем из Docker или localhost
      port: 5432,
      username: 'user', // Из твоего docker-compose
      password: 'pass', // Из твоего docker-compose
      database: 'analytics_db', // Из твоего docker-compose
      autoLoadEntities: true,   // Автоматически регистрирует файлы .entity.ts
      synchronize: true,        // Создает таблицы сам (только для разработки!)
    }),
    EventsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }