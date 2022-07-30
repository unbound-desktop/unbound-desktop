import { Messages, Users as AsyncUsers } from '@webpack/api';
import { SelectedChannels, Users } from '@webpack/stores';
import type { MessageJSON } from 'discord-types/general';
import { Clyde } from '@webpack/common';
import { IDs } from '@constants';

export function initialize() {
   void AsyncUsers.getUser(IDs.BOT);
}

export function send(message: MessageJSON, channel: string = SelectedChannels.getChannelId()) {
   const payload = {
      ...Clyde.createBotMessage(channel, message?.content),
      state: 'SENT',
      author: Users.getUser(IDs.BOT),
      channel_id: channel,
      ...message
   };

   Messages?.receiveMessage(channel, payload);
}