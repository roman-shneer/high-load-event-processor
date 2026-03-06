import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsEvent } from './entities/event.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EventsController } from './events.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([AnalyticsEvent]),
        ClientsModule.register([
            {
                name: 'ANALYTICS_SERVICE',
                transport: Transport.RMQ,
                options: {
                    urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
                    queue: 'analytics_queue',
                    queueOptions: {
                        durable: true, // The queue will survive a RabbitMQ reboot.
                    },
                },
            },
        ]),
    ],
    controllers: [EventsController],
})
export class EventsModule { }