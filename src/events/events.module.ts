import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsEvent } from './entities/event.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EventsController } from './events.controller';
import { PrometheusModule, makeCounterProvider } from '@willsoto/nestjs-prometheus';
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
        PrometheusModule.register({
            path: '/metrics', // путь для сбора метрик Prometheus
        }),
    ],
    controllers: [EventsController],
    providers: [
        // Регистрируем кастомный счетчик для ваших эвентов
        makeCounterProvider({
            name: 'artillery_events_received_total',
            help: 'Total events received from Artillery',
        }),
    ],
})
export class EventsModule { }