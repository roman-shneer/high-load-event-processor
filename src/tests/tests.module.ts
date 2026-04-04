import { Module } from '@nestjs/common';
import { TestsService } from './tests.service';
import { TestsController } from './tests.controller';

@Module({
  providers: [TestsService],
  controllers: [TestsController]
})
export class TestsModule {}
