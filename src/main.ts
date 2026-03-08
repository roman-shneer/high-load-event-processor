import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common'; // Импортируем пайп
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // Removes fields from the request that are not in the DTO
      forbidNonWhitelisted: true, // Throws an error if additional fields are sent
      transform: true,        // Automatically transforms types (e.g., string to number)
    }),
  );

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'analytics_queue',
      queueOptions: { durable: true },
      noAck: false, //confirm receipt manually
    },
  });

  await app.startAllMicroservices(); // We start listening to the queue

  await app.listen(3000, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();