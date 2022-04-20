const { avatar } = require('@constants');
const API = require('@structures/api');

const { Messages } = require('@webpack/common');
const { Channels } = require('@webpack/stores');
const { getByProps } = require('@webpack');
const { bindAll } = require('@utilities');
const Lodash = window._;

const [
   MessageUtil,
   Bots
] = getByProps(
   ['createBotMessage'],
   ['BOT_AVATARS'],
   { bulk: true }
);

class Clyde extends API {
   constructor() {
      super();

      bindAll(this, ['send']);
   }

   get defaultMessage() {
      return {
         state: 'SENT',
         author: {
            avatar: '__UNBOUND__',
            id: '-1',
            bot: true,
            discriminator: '0000',
            username: 'Unbound'
         },
         content: 'Message.'
      };
   }

   start() {
      Bots.BOT_AVATARS['__UNBOUND__'] = avatar;
   }

   stop() {
      delete Bots.BOT_AVATARS['__UNBOUND__'];
   }

   send(channel, message) {
      if (!channel) channel = Channels.getChannelId();

      Messages?.receiveMessage(channel, Lodash.merge({},
         MessageUtil.createBotMessage(channel, message?.content),
         this.defaultMessage,
         message
      ));
   }
};

module.exports = new Clyde();