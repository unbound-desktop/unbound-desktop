interface Response {
   element: HTMLElement;
   remove: () => void;
}

/**
 * @name appendScript
 * @description Appends a script to the unbound's head.
 * @param {string} id - The unique identifier for this script.
 * @param {string} url - The URL of the script.
 * @return {object} Returns an object containing the removal function and the DOM element.
*/
export function appendScript(id: string, url: string): Promise<Response> {
   return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.id = id;
      script.src = url;
      script.onerror = reject;
      script.onload = () => resolve({
         element: script,
         remove: () => script.remove()
      });

      document.head.appendChild(script);
   });
}

/**
 * @name appendStyle
 * @description Appends a style to the unbound's head.
 * @param {string} id - The unique identifier for this style.
 * @param {string} instance - The CSS/URL string to apply to the DOM.
 * @param {boolean} [url=false] - Whether to treat the css as a URL rather than a stylesheet.
 * @return {object} Returns an object containing the removal function and the DOM element.
*/
export function appendStyle(id: string, instance: string, url: boolean = false): Response {
   let element;

   if (url) {
      element = document.createElement('link');
      element.rel = 'stylesheet';
      element.href = instance;
   } else {
      element = document.createElement('style');
      element.id = id;
      element.textContent = instance;
   }

   document.head.appendChild(element);

   return {
      element,
      remove: () => element.remove()
   };
}