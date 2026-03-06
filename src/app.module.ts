import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }