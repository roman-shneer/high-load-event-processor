import { Controller, Sse, MessageEvent } from '@nestjs/common';
import { Observable, interval, from } from 'rxjs';
import { StatsService } from './stats.service';
import { map, switchMap } from 'rxjs/operators';
@Controller('api/stats')
export class StatsController {
    constructor(private readonly statsService: StatsService) { }
    @Sse('stream')
    stream(): Observable<MessageEvent> {
        return interval(1000).pipe(
            switchMap(() => from(this.statsService.getLatestStats())),
            map((data) => ({ data }))
        );
    }
}