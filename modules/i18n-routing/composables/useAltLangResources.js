import { useI18nRouting } from "./useI18nRouting";
import { useI18nHelpers } from "./useI18nHelpers";
import { useI18nUrlRouter } from "./useI18nUrlRouter";

export const useAltLangResources = (nuxtApp) => {
  if (!nuxtApp) {
    nuxtApp = useNuxtApp();
  }

  const router = useRouter();
  const { resolveUrl } = useI18nUrlRouter();
  const { locales, locale, LOCALE_CHOOSER_DOMAIN } = useI18nRouting();
  const { deLocaliseRouteName } = useI18nHelpers();

  const altLangResources = useState("altLangResources", () => []);

  const setAltLangResources = (newAltLangResources) => {
    altLangResources.value = [...newAltLangResources];
  };

  const clearAltLangResources = () => {
    altLangResources.value = [];
  };

  const addAltLangResource = (newAltLangResource) => {
    altLangResources.value = [...altLangResources.value, newAltLangResource];
  };

  const autoGenerateAltLangResources = () => {
    setAltLangResources(calculateCurrentAltLangResources());
  };

  const generateAltLangResourcesByCallback = (routeName, paramCallback) => {
    setAltLangResources([
      ...locales.map((availableLocale) => {
        return {
          hreflang: availableLocale.code,
          href: resolveUrl(
            {
              name: routeName,
              params: paramCallback(availableLocale),
            },
            availableLocale.code,
            availableLocale.domain
          ),
        };
      }),
    ]);
  };

  const calculateCurrentAltLangResources = () => {
    let deLocalisedRouteName = deLocaliseRouteName(
      router.currentRoute.value.name
    );

    if (isCurrentDomainLocaleChooserDomain()) {
      // on *.com, alt resources always point to the index page
      deLocalisedRouteName = "packages";
    }

    return [
      ...locales.map((availableLocale) => {
        return {
          hreflang: availableLocale.code,
          href: resolveUrl(
            {
              name: deLocalisedRouteName,
              params: router.currentRoute.value.params,
            },
            availableLocale.code,
            availableLocale.domain
          ),
        };
      }),
    ];
  };

  const isCurrentDomainLocaleChooserDomain = () => {
    // avoid error if locale is not set
    if (locale.value === undefined) {
      return false;
    }
    return locale.value.tld === LOCALE_CHOOSER_DOMAIN.split(".").pop();
  };

  const getFullSetOfLocaleResources = () => {
    return locales.map((existingLocale) => {
      const altLangResourceForLocale = altLangResources.value.find(
        (filteredAltLangResource) => {
          return filteredAltLangResource.hreflang === existingLocale.code;
        }
      );

      if (altLangResourceForLocale) {
        return altLangResourceForLocale;
      }

      return {
        hreflang: existingLocale.code,
        href: resolveUrl(
          { name: "packages" },
          existingLocale.code,
          existingLocale.domain
        ),
      };
    });
  };

  const resetAltLangResources = () => {
    setAltLangResources([]);
  };

  return {
    altLangResources,
    setAltLangResources,
    resetAltLangResources,
    addAltLangResource,
    clearAltLangResources,
    autoGenerateAltLangResources,
    generateAltLangResourcesByCallback,
    getFullSetOfLocaleResources,
    isCurrentDomainLocaleChooserDomain,
  };
};
