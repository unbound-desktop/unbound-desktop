import { Messages, Users as AsyncUsers } from '@webpack/api';
import { SelectedChannels, Users } from '@webpack/stores';
import type { MessageJSON } from 'discord-types/general';
import { Clyde } from '@webpack/common';
import { IDs } from '@constants';

const Lodash = window._;

export function initialize() {
   void AsyncUsers.getUser(IDs.BOT);
}

export function send(channel: string | undefined, message: MessageJSON) {
   if (!channel) channel = SelectedChannels.getChannelId();

   Messages?.receiveMessage(channel, Lodash.merge({},
      Clyde.createBotMessage(channel, message?.content),
      { state: 'SENT', author: Users.getUser(IDs.BOT), channel_id: channel },
      message
   ));
}