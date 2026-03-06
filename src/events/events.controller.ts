import { Controller, Post, Body, Inject, HttpStatus, HttpCode } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload, Ctx, RmqContext } from '@nestjs/microservices'
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsEvent } from './entities/event.entity';
import { AnalyticsEventDto } from './dto/analytics-event.dto';
@Controller('events')
export class EventsController {
    constructor(
        @Inject('ANALYTICS_SERVICE') private readonly client: ClientProxy,
        @InjectRepository(AnalyticsEvent) // Внедряем репозиторий Postgres
        private readonly eventRepository: Repository<AnalyticsEvent>,
    ) { }

    @Post('track')
    @HttpCode(HttpStatus.ACCEPTED) // Возвращаем 202: "Принято в обработку"
    async trackEvent(@Body() data: AnalyticsEventDto) {
        // Отправляем в RabbitMQ без ожидания завершения бизнес-логики (Fire and Forget)
        this.client.emit('event_received', {
            ...data,
            receivedAt: new Date().toISOString(),
        });

        return { status: 'queued', message: 'Event accepted for processing' };
    }


    @MessagePattern('event_received') // Имя паттерна должно совпадать с тем, что в emit
    async handleEvent(@Payload() data: any, @Ctx() context: RmqContext) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        try {
            console.log('--- Processing Event ---');
            console.log('Event Type:', data.eventType);
            console.log('Payload:', data.payload);

            // Имитация записи в БД (здесь будет твой DB Service)
            await this.saveToDatabase(data);

            // ПОДТВЕРЖДАЕМ (Acknowledge), что сообщение обработано успешно
            channel.ack(originalMsg);
            console.log('Event Processed and Acknowledged');

        } catch (error) {
            console.error('Error processing event:', error.message);
            // Если ошибка — возвращаем в очередь (Nack), чтобы попробовать позже
            channel.nack(originalMsg, false, true);
        }
    }

    private async saveToDatabase(data: any) {
        // Тут логика TypeORM или Prisma
        //return new Promise((resolve) => setTimeout(resolve, 100));
        try {
            // Создаем экземпляр сущности из полученных данных
            const event = this.eventRepository.create({
                sessionId: data.sessionId,
                eventType: data.eventType,
                payload: data.payload,
                // createdAt заполнится автоматически благодаря @CreateDateColumn
            });

            // Сохраняем в PostgreSQL
            const savedEvent = await this.eventRepository.save(event);
            console.log(`Event saved to DB with ID: ${savedEvent.id}`);

            return savedEvent;
        } catch (error) {
            console.error('Database Save Error:', error.message);
            throw error; // Бросаем ошибку выше, чтобы сработал nack в RabbitMQ
        }
    }


}