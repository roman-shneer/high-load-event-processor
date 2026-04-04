import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
@Entity()
export class RabbitStat {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    queueName: string;

    @Column('float', { default: 0 }) // Используем float для скоростей
    publishRate: number;

    @Column('float', { default: 0 })
    deliverRate: number;

    @Column('float', { default: 0 })
    postgresCpu: number; // В процентах (например, 15.5)

    @Column('float', { default: 0 })
    postgresRam: number; // В Мегабайтах (например, 256.0)

    @Column('float', { default: 0 })
    appCpu: number; // В процентах (например, 15.5)

    @Column('float', { default: 0 })
    appRam: number; // В Мегабайтах (например, 256.0)

    @CreateDateColumn()
    createdAt: Date;
}