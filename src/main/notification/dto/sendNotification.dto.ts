// src/notification/dto/send-notification.dto.ts
import { IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IdDto } from 'src/common/dto/id.dto';

export class SendNotificationDto extends IdDto {
  @ApiProperty({
    description: 'FCM token of the recipient device',
    example: 'dLzL_w3vQ8KcQ1SaKJWnhr:APA91bGLT...',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'Notification title',
    example: 'New Message',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Notification body/message',
    example: 'You have received a new message.',
  })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiPropertyOptional({
    description: 'Additional data to send with the notification',
    example: {
      chatId: 'abc123',
      type: 'message',
    },
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, string>;
}