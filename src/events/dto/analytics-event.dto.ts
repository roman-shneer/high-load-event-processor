import { IsString, IsNotEmpty, IsObject, IsUUID } from 'class-validator';

export class AnalyticsEventDto {
    @IsUUID()
    readonly sessionId: string;

    @IsString()
    @IsNotEmpty()
    readonly eventType: string; // например, 'product_view' или 'add_to_cart'

    @IsObject()
    readonly payload: Record<string, any>;

    @IsString()
    readonly timestamp: string;
}