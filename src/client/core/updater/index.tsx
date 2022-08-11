interface ChangelogItem {
   type: string;
   items: string[];
}

interface Update {
   version: string;
   changelog: ChangelogItem[];
}

interface UpdateCheck {
   hasUpdate: boolean;
   updates?: Update[];
}

export async function check(url: string): Promise<UpdateCheck> {
   try {
      const res = await fetch(url).then(r => r.json());
      console.log(res);

      return {
         hasUpdate: true
      };
   } catch (e) {
      console.log(e.message);
      return {
         hasUpdate: false
      };
   }
}