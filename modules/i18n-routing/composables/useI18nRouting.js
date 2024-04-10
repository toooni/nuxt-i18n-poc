import { readonly } from "vue";

export const useI18nRouting = () => {
  const LOCALES = [
    {
      code: "de-CH",
      country: {
        code: "ch",
        name: "Schweiz",
      },
      language: {
        code: "de",
        name: "Deutsch",
      },
      domain: useRuntimeConfig().public.subdomain + ".weekend4two.ch",
      tld: "ch",
      currency: "CHF",
    },
    {
      code: "fr-CH",
      country: {
        code: "ch",
        name: "Suisse",
      },
      language: {
        code: "fr",
        name: "français",
      },
      domain: useRuntimeConfig().public.subdomain + ".weekend4two.ch",
      tld: "ch",
      currency: "CHF",
    },
    {
      code: "fr-FR",
      country: {
        code: "fr",
        name: "France",
      },
      language: {
        code: "fr",
        name: "français",
      },
      domain: useRuntimeConfig().public.subdomain + ".weekend4two.fr",
      tld: "fr",
      currency: "EUR",
    },
    {
      code: "de-DE",
      country: {
        code: "de",
        name: "Deutschland",
      },
      language: {
        code: "de",
        name: "Deutsch",
      },
      domain: useRuntimeConfig().public.subdomain + ".weekend4two.de",
      tld: "de",
      currency: "EUR",
    },
    {
      code: "de-AT",
      country: {
        code: "at",
        name: "Österreich",
      },
      language: {
        code: "de",
        name: "Deutsch",
      },
      domain: useRuntimeConfig().public.subdomain + ".weekend4two.at",
      tld: "at",
      languageName: "Deutsch",
      countryName: "Österreich",
      name: "Deutsch - Österreich",
      currency: "EUR",
    },
  ];

  const LOCALE_CHOOSER_DOMAIN =
    useRuntimeConfig().public.subdomain + ".weekend4two.com";

  const DEFAULT_LOCALE = LOCALES[0];
  const LOCALE_CHOOSER_LOCALE = {
    code: "de-CH",
    country: {
      code: "ch",
      name: "Schweiz",
    },
    language: {
      code: "de",
      name: "Deutsch",
    },
    domain: LOCALE_CHOOSER_DOMAIN,
    tld: "com",
    currency: "CHF",
  };

  const locale = useState("locale", () => DEFAULT_LOCALE);

  const setLocale = (newLocale) => {
    locale.value = newLocale;
  };

  const getLocaleByCode = (localeCode) => {
    return LOCALES.find((locale) => locale.code === localeCode);
  };

  const filterLocalesByDomain = (domain) => {
    return LOCALES.filter((locale) => locale.domain === domain);
  };

  const filterLocalesByCountry = (country) => {
    return LOCALES.filter((locale) => locale.country.code === country);
  };

  return {
    LOCALE_CHOOSER_DOMAIN,
    DEFAULT_LOCALE,
    LOCALE_CHOOSER_LOCALE,
    locales: readonly(LOCALES),
    locale: readonly(locale),
    setLocale,
    getLocaleByCode,
    filterLocalesByDomain,
    filterLocalesByCountry,
  };
};
