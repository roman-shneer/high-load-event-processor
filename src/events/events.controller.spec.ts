import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { AnalyticsEventDto } from './dto/analytics-event.dto';

describe('EventsController', () => {
    let controller: EventsController;
    let clientProxy: any;

    beforeEach(async () => {
        // Mock (replace) the RabbitMQ client
        clientProxy = { emit: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [EventsController],
            providers: [
                { provide: 'ANALYTICS_SERVICE', useValue: clientProxy },
                { provide: 'AnalyticsEventRepository', useValue: {} }, // Mock repository if needed
                {
                    provide: 'PROM_METRIC_ARTILLERY_EVENTS_RECEIVED_TOTAL',
                    useValue: {
                        inc: jest.fn(), // Plug for metric increment method
                    },
                },
                {
                    provide: 'PROM_METRIC_SOME_OTHER_METRIC',
                    useValue: { inc: jest.fn(), observe: jest.fn() },
                },
            ],
        }).compile();

        controller = module.get<EventsController>(EventsController);
    });

    it('should emit an event to RabbitMQ and return accepted status', async () => {
        const dto: AnalyticsEventDto = {
            sessionId: '550e8400-e29b-41d4-a716-446655440000',
            eventType: 'test_event',
            payload: { key: 'value' },
            timestamp: new Date().toISOString(),
        };

        const result = await controller.trackEvent(dto);

        expect(clientProxy.emit).toHaveBeenCalledWith('event_received', expect.any(Object));
        expect(result.status).toBe('queued');
    });
});