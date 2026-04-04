import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { RabbitStat } from './entities/stat.entity';
import Docker = require('dockerode');

@Injectable()
export class StatsService {
    private readonly logger = new Logger(StatsService.name);
    private readonly RMQ_API = process.env.RABBITMQ_HTTP_URL || 'http://guest:guest@rabbitmq:15672/api/queues/%2F/analytics_queue';
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

                publishRate: Number(data.message_stats?.publish_details?.rate || 0),
                deliverRate: Number(data.message_stats?.deliver_details?.rate || 0),
                postgresCpu: pg.cpu,
                postgresRam: pg.ram,
                appCpu: app.cpu,
                appRam: app.ram,
            };


            const stat = this.statsRepo.create(statsData);
            await this.statsRepo.save(stat);
         

        } catch (e) {
            this.logger.error('Failed to fetch RabbitMQ metrics: ' + e.message);
        }
    }

    private async getMetricsByContainerName(name: string) {
        try {
            const container = this.docker.getContainer(name);
            const stats = await container.stats({ stream: false });


            const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
            const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;

            const cpuPercent = systemDelta > 0
                ? Number(((cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100.0).toFixed(2))
                : 0;


            const memUsage = Math.round(stats.memory_stats.usage / 1024 / 1024);

            return { cpu: Math.round(cpuPercent * 100) / 100, ram: Math.round(memUsage * 100) / 100 };
        } catch (e) {
            this.logger.error(`Failed to get stats for ${name}: ${e.message}`);
            return { cpu: 0, ram: 0 };
        }
    }

    //statistics for controller
    async getLatestStats() {
        return this.statsRepo.find({
            order: { createdAt: 'DESC' },
            take: 50, // last 50 records for dashboard
        });
    }
}