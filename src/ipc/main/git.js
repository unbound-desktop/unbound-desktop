const { IPCEvents } = require('../../modules/constants');
const { exec } = require('child_process');
const { ipcMain } = require('electron');

ipcMain.handle(IPCEvents.SPAWN_GIT, (_, command, cwd) => {
   return new Promise((resolve, reject) => {
      try {
         exec(command, { cwd }, (err, out) => {
            if (err) {
               err.message = `Failed to spawn git with command ${command}: ${err.message}`;
               return reject(err);
            }

            resolve(out);
         });
      } catch (e) {
         throw new Error('Failed to spawn git with command ' + command, e.message);
      }
   });
});