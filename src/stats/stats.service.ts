import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { RabbitStat } from './entities/stat.entity';
import { lstat } from 'fs';
import Docker = require('dockerode');

@Injectable()
export class StatsService {
    private readonly logger = new Logger(StatsService.name);
    
    // Данные для подключения (лучше вынести в .env)
    private readonly RMQ_API = process.env.RABBITMQ_HTTP_URL || 'http://guest:guest@rabbitmq:15672/api/queues/%2F/analytics_queue';
    //private docker = new (Docker as any)(); 
    private readonly docker = new Docker(); 
    constructor(
        @InjectRepository(RabbitStat)
        private statsRepo: Repository<RabbitStat>,
    ) { }

    @Cron('*/5 * * * * *') // Каждые 5 секунд
    async handleCron() {
        try {
            const { data } = await axios.get(this.RMQ_API, { timeout: 5000 });
            

            const pg = await this.getMetricsByContainerName('high-load-event-processor-postgres-1');
            const app = await this.getMetricsByContainerName('high-load-event-processor-api-gateway-1');            

            const statsData = {
                queueName: String(data.name),
                // Принудительно приводим к числу через Number() или +
                publishRate: Number(data.message_stats?.publish_details?.rate || 0),
                deliverRate: Number(data.message_stats?.deliver_details?.rate || 0),
                postgresCpu: pg.cpu, // Округляем до 2 знаков
                postgresRam: pg.ram, // Округляем до 2 знаков
                appCpu: app.cpu,
                appRam: app.ram,
            };

            // Теперь вызываем create
            const stat = this.statsRepo.create(statsData);
            await this.statsRepo.save(stat);
         
            //this.logger.debug(`Stats saved: Pub ${stat.publishRate} / Del ${stat.deliverRate}`);
        } catch (e) {
            this.logger.error('Failed to fetch RabbitMQ metrics: ' + e.message);
        }
    }

    private async getMetricsByContainerName(name: string) {
        try {
            const container = this.docker.getContainer(name);
            const stats = await container.stats({ stream: false });

            // Расчет CPU % (одинаковый для всех контейнеров)
            const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
            const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;

            const cpuPercent = systemDelta > 0
                ? Number(((cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100.0).toFixed(2))
                : 0;

            // Память в MB
            const memUsage = Math.round(stats.memory_stats.usage / 1024 / 1024);

            return { cpu: Math.round(cpuPercent * 100) / 100, ram: Math.round(memUsage * 100) / 100 };
        } catch (e) {
            this.logger.error(`Failed to get stats for ${name}: ${e.message}`);
            return { cpu: 0, ram: 0 };
        }
    }

    // Метод для контроллера (чтобы React мог забрать данные)
    async getLatestStats() {
        return this.statsRepo.find({
            order: { createdAt: 'DESC' },
            take: 50, // Последние 50 записей для графика
        });
    }
}