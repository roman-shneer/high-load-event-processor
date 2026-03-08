import { Controller, Post, Body, Inject, HttpStatus, HttpCode, UseGuards } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload, Ctx, RmqContext } from '@nestjs/microservices'
import { ThrottlerGuard } from '@nestjs/throttler';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsEvent } from './entities/event.entity';
import { AnalyticsEventDto } from './dto/analytics-event.dto';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

@Controller('events')
export class EventsController {
    private eventBuffer: any[] = [];
    private readonly BATCH_SIZE = 500; // Оптимально для PostgreSQL
    private readonly FLUSH_INTERVAL = 5000; // Сбрасывать каждые 5 сек, если буфер не заполнился
    private totalReceived = 0;
    private totalProcessed = 0;

    constructor(
        @Inject('ANALYTICS_SERVICE') private readonly client: ClientProxy,
        @InjectRepository(AnalyticsEvent) // inject repository for Postgres
        private readonly eventRepository: Repository<AnalyticsEvent>,
        @InjectMetric('artillery_events_received_total') public readonly counter: Counter
    ) {
        setInterval(() => this.flushBuffer(), this.FLUSH_INTERVAL);
    }

    //@UseGuards(ThrottlerGuard)
    @Post('track')
    @HttpCode(HttpStatus.ACCEPTED) // return 202 Accepted
    async trackEvent(@Body() data: AnalyticsEventDto) {
        // Sending to RabbitMQ without waiting for business logic to complete (Fire and Forget)
        this.counter.inc();
        this.totalReceived++;
        this.client.emit('event_received', {
            ...data,
            receivedAt: new Date().toISOString(),
        });

        return { status: 'queued', message: 'Event accepted for processing' };
    }


    @MessagePattern('event_received') 
    async handleEvent(@Payload() data: any, @Ctx() context: RmqContext) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        try {
            /*
            console.log('--- Processing Event ---');
            console.log('Event Type:', data.eventType);
            console.log('Payload:', data.payload);
            */
            // dbsave
            await this.saveToDatabase(data);

            //  ACKNOWLEDGE that the message has been processed successfully.
            channel.ack(originalMsg);
            /*console.log('Event Processed and Acknowledged');*/

        } catch (error) {
            console.error('Error processing event:', error.message);
            // if error - return to queue (Nack), for retry later.
            channel.nack(originalMsg, false, true);
        }
    }

    private async flushBuffer() {
        if (this.eventBuffer.length === 0) return;

        const itemsToSave = [...this.eventBuffer];
        this.eventBuffer = []; // Очищаем основной буфер сразу

        try {
            await this.eventRepository
                .createQueryBuilder()
                .insert()
                .into(AnalyticsEvent)
                .values(itemsToSave)
                .execute();
            this.totalProcessed += itemsToSave.length;
            console.log(`🚀 Batch saved: ${itemsToSave.length} events, total: ${this.totalProcessed} from ${this.totalReceived}`);
        } catch (error) {
            console.error('Database Batch Save Error:', error.message);
            // В продакшене здесь стоит вернуть данные в очередь (RabbitMQ)
        }
    }

    private async saveToDatabase(data: any) {

        //temporary disabled - its should cause for overwriting pool
        //await new Promise(resolve => setTimeout(resolve, 1000));
        this.eventBuffer.push(data);

        if (this.eventBuffer.length >= this.BATCH_SIZE) {
            console.log(`saveTodata ${this.eventBuffer.length}`)
            // no await!!!
            this.flushBuffer();
        }
        /*
        try {
            //  create an instance of an entity from the received data
            const event = this.eventRepository.create({
                sessionId: data.sessionId,
                eventType: data.eventType,
                payload: data.payload,
                // createdAt will be filled automatically by @CreateDateColumn
            });

            // save to PostgreSQL
            const savedEvent = await this.eventRepository.save(event);
            console.log(`Event saved to DB with ID: ${savedEvent.id}`);

            return savedEvent;
        } catch (error) {
            console.error('Database Save Error:', error.message);
            throw error;// Throw the error above to trigger nack in RabbitMQ
        }*/
    }


}