import { Injectable, Logger } from '@nestjs/common';
import { ChildProcess, spawn } from 'child_process';
import { join } from 'path';

@Injectable()
export class TestsService {
    private artilleryProcess: ChildProcess | null = null;
    private readonly logger = new Logger(TestsService.name);

    runTest(filename: string) {
        if (this.artilleryProcess) return { status: 'Already running' };
        const configPath = join(process.cwd(), 'performance', filename);

        // Запускаем процесс
        this.artilleryProcess = spawn('npx', ['artillery', 'run', configPath]);

        // БЕЗОПАСНАЯ ПРОВЕРКА: stdout может быть null, если процесс не запустился
        if (this.artilleryProcess.stdout) {
            this.artilleryProcess.stdout.on('data', (data) => {
                this.logger.log(`Artillery Output: ${data.toString()}`);
            });
        }

        // То же самое для stderr (ошибки)
        if (this.artilleryProcess.stderr) {
            this.artilleryProcess.stderr.on('data', (data) => {
                this.logger.error(`Artillery Error: ${data.toString()}`);
            });
        }

        this.artilleryProcess.on('close', (code) => {
            this.logger.warn(`Artillery process exited with code ${code}`);
            this.artilleryProcess = null;
        });

        this.artilleryProcess.on('error', (err) => {
            this.logger.error(`Failed to start Artillery: ${err.message}`);
            this.artilleryProcess = null;
        });

        return { status: 'Started' };
    }

    stopTest() {
        if (!this.artilleryProcess) return { status: 'Not running' };

        this.artilleryProcess.kill('SIGINT');
        this.artilleryProcess = null;
        return { status: 'Stopped' };
    }

    getStatus() {
        return { isRunning: !!this.artilleryProcess };
    }
}