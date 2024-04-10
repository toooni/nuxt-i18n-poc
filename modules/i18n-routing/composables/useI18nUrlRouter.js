import { useI18nRouting } from "@/modules/i18n-routing/composables/useI18nRouting";
import { useI18nHelpers } from "@/modules/i18n-routing/composables/useI18nHelpers";

export const useI18nUrlRouter = (nuxtApp) => {
  if (!nuxtApp) {
    nuxtApp = useNuxtApp();
  }

  const router = useRouter();
  const { locale, getLocaleByCode } = useI18nRouting();
  const { localiseRouteName, localeToLang } = useI18nHelpers();

  const resolveFullPath = (route, targetLocale = locale.value.code) => {
    const fullPath = router.resolve({
      ...route,
      name: localiseRouteName(route.name, localeToLang(targetLocale)),
    }).fullPath;

    return fullPath === "" ? "/" : fullPath;
  };

  const resolveUrl = (
    route,
    targetLocale = locale.value.code,
    domain = locale.value.domain
  ) => {
    const url = new URL(
      resolveFullPath(route, targetLocale),
      nuxtApp.$getCurrentOrigin()
    );

    url.hostname = domain;

    return url.href;
  };

  const resolveUrlByLocaleCode = (route, targetLocaleCode) => {
    const localisation = getLocaleByCode(targetLocaleCode);
    return resolveUrl(route, localisation.code, localisation.domain);
  };

  return {
    resolveFullPath,
    resolveUrl,
    resolveUrlByLocaleCode,
  };
};
