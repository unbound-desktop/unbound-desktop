const { avatar } = require('@constants');
const API = require('@structures/api');

const { Messages, Users: AsyncUsers } = require('@webpack/api');
const { SelectedChannels, Users } = require('@webpack/stores');
const { findByProps } = require('@webpack');
const { bindAll } = require('@utilities');
const Lodash = window._;

const [
   MessageUtil,
   Bots
] = findByProps(
   ['createBotMessage'],
   ['BOT_AVATARS'],
   { bulk: true }
);

const ID = '934019188450816000';

class Clyde extends API {
   constructor() {
      super();

      bindAll(this, ['send']);
   }

   get defaultMessage() {
      return {
         state: 'SENT',
         author: Users.getUser(ID)
      };
   }

   async start() {
      await AsyncUsers.getUser(ID);
   }

   send(channel, message) {
      if (!channel) channel = SelectedChannels.getChannelId();

      Messages?.receiveMessage(channel, Lodash.merge({},
         MessageUtil.createBotMessage(channel, message?.content),
         { channel_id: channel },
         this.defaultMessage,
         message
      ));
   }
};

module.exports = new Clyde();