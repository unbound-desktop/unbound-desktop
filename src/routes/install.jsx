const { createLogger } = require('@modules/logger');
const { ConfirmModal } = require('@components');
const { Modals } = require('@webpack/common');
const { paths } = require('@constants');
const { Text } = require('@components');
const Git = require('@modules/git');
const React = require('react');
const path = require('path');

const Logger = createLogger();

const { existsSync } = require('fs');

module.exports = async (ctx, req, res, params) => {
   try {
      const query = new URLSearchParams(params);
      const type = query.get('type');
      const name = query.get('name');
      const url = query.get('url');

      const folder = path.resolve(paths.root, type);
      if (!type || !url || !existsSync(folder)) {
         res.statusCode = 400;
         return res.end();
      }

      await window.DiscordNative.window.focus();

      return Modals.openModal(e => <ConfirmModal
         header={`Install ${name}?`}
         children={<Text>
            This will automatically be downloaded to your {type} folder.
            Do keep in mind installing {type} from untrusted sources is
            severely discouraged and may have the potential of giving attackers
            your personal information.
         </Text>}
         cancelText='Cancel'
         confirmText='Install'
         onConfirm={async () => {
            e.onClose();

            try {
               await Git.clone(folder, decodeURIComponent(url));

               res.statusCode = 200;
               res.end();
               ctx.apis?.toasts?.open({
                  title: `Installation Successful`,
                  color: 'var(--info-positive-foreground)',
                  timeout: 5000,
                  icon: 'CheckmarkCircle',
                  content: `${name} was successfully installed.`
               });
            } catch {
               ctx.apis?.toasts?.open({
                  title: 'Installation Failed',
                  color: 'var(--info-danger-foreground)',
                  timeout: 5000,
                  icon: 'CloseCircle',
                  content: `We couldn\'t install ${name} for you.`
               });
            }
         }}
         {...e}
      />);
   } catch (e) {
      Logger.error('Failed to handle request', e);
   }

   res.statusCode = 500;
   res.end();
};