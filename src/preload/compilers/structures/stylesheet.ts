export default class StyleSheet {
   public element: Element;

   constructor(
      public code: string,
      public path: string
   ) {
      this.element = document.createElement('style');

      this.element.innerHTML = code;
      this.element.setAttribute('data-unbound', 'true');
      this.element.setAttribute('data-path', path);
   }

   async append(): Promise<void> {
      try {
         if (!document.head) {
            const head = document.createElement('head');
            const html = document.querySelector('html');
            if (!html) {
               throw 'HTML element not found, head couldn\'t be created.';
            }

            html.appendChild(head);
         }

         if (document.querySelector(`style[data-path='${this.path}']`)) {
            return;
         }

         document.head.appendChild(this.element);
      } catch (e) {
         console.error(`Failed to append ${this.path} to the document's head.`, e);
      }
   }

   remove(): void {
      try {
         this.element.remove();
      } catch (e) {
         console.error(`Failed to remove ${this.path} from the document head.`, e);
      }
   }
}