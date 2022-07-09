import { dialog, ipcMain } from 'electron';
import { IPCEvents } from '@constants';

ipcMain.handle(IPCEvents.PROCESS_ISOLATED, () => {
  dialog.showMessageBox({
    type: 'warning',
    title: 'Not Supported',
    message: 'The process is context isolated, unbound does not support isolated processes.',
    detail: 'There can be two causes of this.\nEither nullbyte doesn\'t support your platform or nullbyte failed patching memory.\nYour discord will launch without unbound.',
    buttons: ['OK']
  });
});