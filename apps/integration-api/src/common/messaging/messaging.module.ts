import { Global, Module } from '@nestjs/common';
import { RabbitPublisher } from './rabbit.publisher';
import { OutboxService } from './outbox.service';

@Global()
@Module({ providers: [RabbitPublisher, OutboxService], exports: [RabbitPublisher, OutboxService] })
export class MessagingModule {}
