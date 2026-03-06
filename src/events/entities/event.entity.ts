import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('analytics_events') // Имя таблицы в Postgres
export class AnalyticsEvent {
    @PrimaryGeneratedColumn() // Авто-инкремент ID
    id: number;

    @Column({ type: 'uuid', nullable: false })
    sessionId: string;

    @Column()
    eventType: string;

    // Использование jsonb — это Senior-level подход в Postgres для гибких данных
    @Column({ type: 'jsonb', nullable: true })
    payload: Record<string, any>;

    @CreateDateColumn() // Автоматическая дата создания
    createdAt: Date;
}