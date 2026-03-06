import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common'; // Импортируем пайп
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Включаем глобальную валидацию
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // Удаляет из запроса поля, которых нет в DTO
      forbidNonWhitelisted: true, // Выдает ошибку, если прислали лишние поля
      transform: true,        // Автоматически преобразует типы (например, строку в число)
    }),
  );

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'analytics_queue',
      queueOptions: { durable: true },
      noAck: false, // Важно для Senior: подтверждаем получение вручную
    },
  });

  await app.startAllMicroservices(); // Запускаем прослушку очереди

  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();