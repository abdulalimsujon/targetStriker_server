import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { IdDto } from 'src/common/dto/id.dto';
import { ApiResponse } from 'src/common/types/apiResponse';
import { EVENT_TYPES } from 'src/interfaces/event';
import { DbService } from 'src/utils/db/db.service';
import { EventService } from 'src/utils/event/event.service';

@Injectable()
export class CommonService {
  constructor(
    private readonly db: DbService,
    private readonly event: EventService,
  ) {}

  public async findConversation(memberOneId: string, memberTwoId: string) {
    return await this.db.conversation.findFirst({
      where: {
        AND: [{ memberOneId: memberOneId }, { memberTwoId: memberTwoId }],
      },
      include: {
        memberOne: {
          select: {
            id: true,
          },
        },
        memberTwo: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  public async createConversation(memberOneId: string, memberTwoId: string) {
    return await this.db.conversation.create({
      data: {
        memberTwoId,
        memberOneId,
      },
    });
  }

  @OnEvent(EVENT_TYPES.CONVERSATION_CREATE)
  async getOrCreteConversationEventHandler({
    memberOneId,
    memberTwoId,
  }: {
    memberOneId: string;
    memberTwoId: string;
  }) {
    const conversation = await this.findConversation(memberOneId, memberTwoId);

    if (conversation) {
      return conversation;
    }

    return await this.createConversation(memberOneId, memberTwoId);
  }

  public async getMessages({ id: conversationId }: IdDto, { id: cursor }: IdDto):Promise<ApiResponse<any>> {
    const data = await this.db.message.findMany({
      where: {
        conversationId,
      },
      cursor: {
        id: cursor,
      },
    });

    return {
      data,
      message: 'Messages fetched successfully',
      success: true,
    };
  }
}
