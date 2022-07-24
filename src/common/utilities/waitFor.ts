import sleep from './sleep';

async function waitFor(selector: string, timeout: number = 0) {
   const data = {
      element: document.querySelector(selector),
      cancelled: false,
      timeout: null
   };

   if (timeout > 0) {
      data.timeout = setTimeout(() => data.cancelled = true, timeout);
   }

   while (!data.element && !(data.element = document.querySelector(selector))) {
      await sleep(1);
      if (data.cancelled) break;
   };

   clearTimeout(data.timeout);

   return data.element;
};

export = waitFor;