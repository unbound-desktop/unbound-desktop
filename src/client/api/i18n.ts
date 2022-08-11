import { Locale } from '@webpack/common';
import i18n from '@client/i18n';

type LocaleStrings = Record<string, Record<string, any>>;

export const state = {
   locale: 'en-US',
   messages: {}
};

export function initialize() {
   if (!Locale) return;

   state.locale = Locale.getLocale() ?? 'en-US';
   Locale.on('locale', onChange);

   // Add core strings
   add(i18n);
}

export function shutdown() {
   if (!Locale) return;

   const context = Locale._provider._context;

   for (const locale in state.messages) {
      if (!state.messages[locale]) continue;

      for (const message of Object.keys(state.messages[locale])) {
         delete context.defaultMessages[message];
         delete context.messages[message];
         delete Locale.Messages[message];
      }
   }

   Locale.off('locale', onChange);
}

export function add(strings: LocaleStrings) {
   if (typeof strings !== 'object' || Array.isArray(strings)) {
      throw new Error('Locale strings must be an object with languages and strings.');
   }

   for (const locale in strings) {
      addStrings(locale, strings[locale]);
   }
};

export function addStrings(locale: string, strings: LocaleStrings) {
   if (!state.locale) return;

   state.messages[locale] ??= {};
   Object.assign(state.messages[locale], strings);

   inject();
}

export function inject() {
   if (!state.locale || !Locale) return;

   const context = Locale._provider._context;

   Object.assign(context.messages, state.messages[state.locale] ?? {});
   Object.assign(context.defaultMessages, state.messages['en-US'] ?? {});
}

function onChange(locale) {
   state.locale = locale;
   Locale.loadPromise.then(inject);
}