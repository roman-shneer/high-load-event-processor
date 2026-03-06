import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('analytics_events') // table_name in Postgres
export class AnalyticsEvent {
    @PrimaryGeneratedColumn() // Авто-инкремент ID
    id: number;

    @Column({ type: 'uuid', nullable: false })
    sessionId: string;

    @Column()
    eventType: string;

    @Column({ type: 'jsonb', nullable: true })
    payload: Record<string, any>;

    @CreateDateColumn() // Automatically populated with the creation date
    createdAt: Date;
}