const { IPCEvents } = require('./constants');
const { ipcRenderer } = require('electron');
const uuid = require('./utilities/uuid');
const { existsSync } = require('fs');
const { join } = require('path');

const SEP = uuid(4);
const SEPStart = uuid(4);

class Git {
   isInstalled() {
      return ipcRenderer.invoke(IPCEvents.SPAWN_GIT, 'git --version').then(() => true, () => false);
   }

   async getURL(path) {
      try {
         const res = await ipcRenderer.invoke(IPCEvents.SPAWN_GIT, 'git config --get remote.origin.url', path);
         return res.trim().endsWith('.git') ? res.slice(0, -5) : res;
      } catch (e) {
         throw e;
      }
   }

   async isRepo(path) {
      return existsSync(join(path, '.git'));
   }

   async pull(path, force = false) {
      if (force) await this.reset(path);
      return ipcRenderer.invoke(IPCEvents.SPAWN_GIT, 'git pull', path);
   }

   async getBranch(path) {
      try {
         const res = await ipcRenderer.invoke(IPCEvents.SPAWN_GIT, 'git name-rev --name-only HEAD', path);
         return res.slice(0, -1);
      } catch (e) {
         throw e;
      }
   }

   async getNewCommits(path, branch) {
      await this.fetch(path);

      const res = await ipcRenderer.invoke(IPCEvents.SPAWN_GIT, `git log ${branch}..origin/${branch} --pretty=format:"${SEPStart}${SEP}%H${SEP}${SEP}%h${SEP}${SEP}%an${SEP}${SEP}%ar${SEP}${SEP}%s${SEP}${SEP}%b${SEP}${SEPStart}`, path);
      return this.#parseCommits(res);
   }

   async getCommit(path, branch) {
      const res = await ipcRenderer.invoke(IPCEvents.SPAWN_GIT, `git log -1 ${branch} --pretty=format:"${SEPStart}${SEP}%H${SEP}${SEP}%h${SEP}${SEP}%an${SEP}${SEP}%ar${SEP}${SEP}%s${SEP}${SEP}%b${SEP}${SEPStart}`, path);
      return this.#parseCommits(res)[0];
   }

   async getCommits(path, branch) {
      const res = await ipcRenderer.invoke(IPCEvents.SPAWN_GIT, `git log ${branch} --pretty=format:"${SEPStart}${SEP}%H${SEP}${SEP}%h${SEP}${SEP}%an${SEP}${SEP}%ar${SEP}${SEP}%s${SEP}${SEP}%b${SEP}${SEPStart}`, path);
      return this.#parseCommits(res);
   }

   #parseCommits(res) {
      return res.split(SEPStart).filter(r => r !== '\n' && Boolean(r)).map(entry => entry.split(SEP).filter(Boolean)).map(info => {
         const [longHash, short, author, time, message, longMessage = ''] = info;
         return { longHash, short, author, time, message, longMessage };
      });
   }

   fetch(path) {
      return ipcRenderer.invoke(IPCEvents.SPAWN_GIT, 'git fetch', path);
   }

   reset(path) {
      return ipcRenderer.invoke(IPCEvents.SPAWN_GIT, 'git reset HEAD~1 --hard', path);
   }

   clone(path, url, branch) {
      return ipcRenderer.invoke(IPCEvents.SPAWN_GIT, `git clone ${url} ${branch && `-b ${branch}`}`, path);
   }

   async getBranches(path) {
      try {
         const res = await ipcRenderer.invoke(IPCEvents.SPAWN_GIT, `git branch --format "%(refname:short)"`, path);
         return res.split('\n').filter(Boolean);
      } catch (e) {
         throw e;
      }
   }
};

module.exports = new Git();