import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
@Entity()
export class RabbitStat {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    queueName: string;

    @Column('float', { default: 0 })
    publishRate: number;

    @Column('float', { default: 0 })
    deliverRate: number;

    @Column('float', { default: 0 })
    postgresCpu: number; 

    @Column('float', { default: 0 })
    postgresRam: number;

    @Column('float', { default: 0 })
    appCpu: number; 

    @Column('float', { default: 0 })
    appRam: number;

    @CreateDateColumn()
    createdAt: Date;
}