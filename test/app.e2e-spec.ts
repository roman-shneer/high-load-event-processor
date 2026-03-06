import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Events (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  it('/events/track (POST) - Success', () => {
    return request(app.getHttpServer())
      .post('/events/track')
      .send({
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        eventType: 'click',
        payload: { button: 'buy' },
        timestamp: new Date().toISOString(),
      })
      .expect(202) // Ожидаем наш Accepted
      .expect((res) => {
        expect(res.body.status).toBe('queued');
      });
  });

  it('/events/track (POST) - Validation Error (Missing sessionId)', () => {
    return request(app.getHttpServer())
      .post('/events/track')
      .send({ eventType: 'click' })
      .expect(400); // Ожидаем ошибку валидации
  });

  afterAll(async () => {
    await app.close();
  });
});