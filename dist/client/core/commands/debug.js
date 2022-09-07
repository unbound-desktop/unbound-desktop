"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),Object.defineProperty(exports,"default",{enumerable:!0,get:()=>c});const a=require("../../../../index.json"),b=require("../../../common/constants"),c={name:"debug",description:"Sends debug information about Unbound.",execute(){let c=b.ReleaseChannels[DiscordNative.app.getReleaseChannel()];return{send:!0,content:`**Unbound Debug Info** 

>>> \xbb **Version**: ${a.version}
\xbb **Release**: ${c} - ${DiscordNative.app.getVersion()}
\xbb **Memory Usage**: ${Math.round(DiscordNative.processUtils.getCurrentMemoryUsageKB()/1e3)}MB
\xbb **OS**: ${process.platform} ${DiscordNative.os.arch} (${DiscordNative.os.release})`}}}