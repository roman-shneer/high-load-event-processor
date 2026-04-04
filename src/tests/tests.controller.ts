import { Controller, Post, Get, Body } from '@nestjs/common';
import { TestsService } from './tests.service';

@Controller('api/tests')
export class TestsController {
    constructor(private readonly testsService: TestsService) { }

    @Post('start')
    start(@Body() data: { filename: string }) {
        return this.testsService.runTest(data.filename);
    }

    @Post('stop')
    stop() {
        return this.testsService.stopTest();
    }

    @Get('status')
    status() {
        return this.testsService.getStatus();
    }
}