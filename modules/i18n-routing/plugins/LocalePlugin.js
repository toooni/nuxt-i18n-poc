import { useI18nRouting } from "@/modules/i18n-routing/composables/useI18nRouting";
import { useI18nHelpers } from "@/modules/i18n-routing/composables/useI18nHelpers";
import { createI18n } from "vue-i18n";

import de from "@/locales/de.json";
import deAT from "@/locales/de-AT.json";
import deCH from "@/locales/de-CH.json";
import deDE from "@/locales/de-DE.json";
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";
import frCH from "@/locales/fr-CH.json";
import frFR from "@/locales/fr-FR.json";

const messages = {
  de,
  "de-AT": deAT,
  "de-CH": deCH,
  "de-DE": deDE,
  en,
  fr,
  "fr-CH": frCH,
  "fr-FR": frFR,
};

export default defineNuxtPlugin(async (nuxtApp) => {
  const { vueApp: app } = nuxtApp;
  const router = useRouter();

  const {
    LOCALE_CHOOSER_DOMAIN,
    DEFAULT_LOCALE,
    LOCALE_CHOOSER_LOCALE,
    locales,
    setLocale,
    filterLocalesByDomain,
  } = useI18nRouting();
  const { langFromRouteName } = useI18nHelpers();

  /*
    Using "i18n.global" throws an error in production build, so don't do that
    I'm not entirely sure why, but I think it has something to do with "global"
    not being an ideal variable name and webpack being confused by it
   */
  const getGlobalI18n = () => i18n["global"];

  const handleLocaleDetection = async (detectedLocale) => {
    getGlobalI18n().locale.value = detectedLocale.code;
    setLocale(detectedLocale);
  };

  const detectLocale = async (targetRouteParam) => {
    const url = nuxtApp.$getCurrentUrl();
    const targetRoute = targetRouteParam
      ? targetRouteParam
      : router.resolve({
          path: `${url.pathname}${url.search}`,
        });

    // TODO: set the locale based on the default lang headers on all pages of weekend4two.com
    // TODO: also on weekend4two.ch/ -> on all other pages, the desired language can be derived from the url path. on all other domains, we can only offer one language)
    if (url.hostname === LOCALE_CHOOSER_DOMAIN) {
      return await handleLocaleDetection(LOCALE_CHOOSER_LOCALE);
    }

    // fallback if no hostname is present (error pages!?)
    const domainLocales =
      url.hostname === "undefined"
        ? locales
        : filterLocalesByDomain(url.hostname);

    if (domainLocales.length === 0) {
      // this means we're on a domain that doesn't exist
      return await handleLocaleDetection(DEFAULT_LOCALE);
    }

    const desiredLang = langFromRouteName(targetRoute.name);

    const filteredLocales = domainLocales.filter(
      (locale) => locale.code.substring(0, 2) === desiredLang,
    );

    if (filteredLocales.length <= 0) {
      // the desired language is not known on this domain -> we set the default language of this domain
      return await handleLocaleDetection(domainLocales[0]);
    }

    return await handleLocaleDetection(filteredLocales[0]);
  };

  router.beforeEach(async (to) => {
    if (process.client) {
      await detectLocale(to); // we don't await because the locale is reactive and everything will be updated when it's ready
    }
  });

  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    missingWarn: false, // turn this on, when you're debugging translations / fallbacks
    fallbackWarn: false, // turn this on, when you're debugging translations / fallbacks
    locale: "en", // this is only temporary - after the locale is guessed, this will be updated
    messages,
    datetimeFormats: {
      de: {
        very_short: {
          day: "numeric",
          month: "numeric",
        },
        short_with_year: {
          day: "numeric",
          month: "short",
          year: "2-digit",
        },
        date: {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        },
        long_date: {
          day: "numeric",
          month: "long",
          year: "numeric",
        },
        full_written: {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        },
        month_long_year: {
          month: "short",
          year: "numeric",
        },
        month_xlong_year: {
          month: "long",
          year: "numeric",
        },
        time: {
          hourCycle: "h23",
          hour: "2-digit",
          minute: "2-digit",
        },
      },
      fr: {
        very_short: {
          day: "numeric",
          month: "numeric",
        },
        short_with_year: {
          day: "numeric",
          month: "short",
          year: "2-digit",
        },
        date: {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        },
        long_date: {
          day: "numeric",
          month: "long",
          year: "numeric",
        },
        full_written: {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        },
        month_long_year: {
          month: "long",
          year: "numeric",
        },
        time: {
          hourCycle: "h23",
          hour: "2-digit",
          minute: "2-digit",
        },
      },
    },
  });

  await detectLocale(); // we await, because on initial load, it's crucial to have the correct locale set from the beginning

  app.use(i18n);
});
