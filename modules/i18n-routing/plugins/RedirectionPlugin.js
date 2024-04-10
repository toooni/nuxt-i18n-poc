import { useI18nRouting } from "@/modules/i18n-routing/composables/useI18nRouting";
import { useI18nHelpers } from "@/modules/i18n-routing/composables/useI18nHelpers";
import { useI18nUrlRouter } from "@/modules/i18n-routing/composables/useI18nUrlRouter";

export default defineNuxtPlugin((nuxtApp) => {
  // TODO: maybe move this to route middleware? (vue is still being rendered after redirecting)
  const { LOCALE_CHOOSER_DOMAIN, locale, filterLocalesByCountry } =
    useI18nRouting();
  const {
    localeToLang,
    deLocaliseRouteName,
    localiseRouteName,
    langFromRouteName,
    guessLanguage,
  } = useI18nHelpers();

  const { resolveUrl } = useI18nUrlRouter(useNuxtApp());

  const ssrContext = nuxtApp.ssrContext;
  const router = useRouter();

  const redirect = async (status, location) => {
    await navigateTo(location, { redirectCode: status, external: true });
  };

  const isInitialRequest = () => {
    // checks if `client_id` cookie is set
    const cookies = ssrContext?.event?.req.headers["cookie"]?.split(";");

    if (cookies === undefined) {
      return true;
    }

    for (let index = 0; index < cookies.length; index++) {
      if (cookies[index].trim().substring(0, 9) === "client_id") {
        return false;
      }
    }

    return true;
  };

  if (process.server && ssrContext) {
    const url = nuxtApp.$getCurrentUrl();
    const currentRoute = router.resolve({
      path: `${url.pathname}${url.search}`,
    });

    if (currentRoute.name === undefined) {
      return;
    }

    // redirect non www. to www
    if (url.hostname.startsWith("weekend4two.")) {
      redirect(302, `https://www.${url.hostname}${url.pathname}${url.search}`);
      return;
    }

    if (
      url.hostname.startsWith("www.w42.") ||
      url.hostname.startsWith("w42.")
    ) {
      redirect(301, `https://www.weekend4two.ch${url.pathname}${url.search}`);
      return;
    }

    const prefLang = guessLanguage(
      ["de", "fr"],
      ssrContext?.event?.req.headers["accept-language"],
    );

    if (url.hostname === LOCALE_CHOOSER_DOMAIN) {
      // Allow /c/2345wdf (coupon code auto check) on .com domain. This component will redirect to the correct domain
      if (deLocaliseRouteName(currentRoute.name) === "c-code") {
        return;
      }

      if (url.hostname.endsWith(".com")) {
        // Check "Cloudfront-Viewer-Country" headers here and redirect accordingly (to the respective domain) if set
        const cloudViewerCountry =
          ssrContext?.event?.req.headers["cloudfront-viewer-country"];
        const country =
          cloudViewerCountry !== null && cloudViewerCountry !== undefined
            ? cloudViewerCountry
            : "ch";

        const countryDomains = filterLocalesByCountry(country.toLowerCase());
        const countryLangDomain = countryDomains.find(
          (locale) => locale.language.code === prefLang,
        );

        if (deLocaliseRouteName(currentRoute.name) === "coupon") {
          if (countryLangDomain !== undefined) {
            redirect(
              302,
              resolveUrl(
                {
                  name: "coupon",
                },
                countryLangDomain.language.code,
                countryLangDomain.domain,
              ),
            );
            return;
          }
        }

        if (deLocaliseRouteName(currentRoute.name) === "code") {
          if (countryLangDomain !== undefined) {
            redirect(
              302,
              resolveUrl(
                {
                  name: "code",
                },
                countryLangDomain.language.code,
                countryLangDomain.domain,
              ),
            );
            return;
          }
        }

        if (deLocaliseRouteName(currentRoute.name) === "package-perma") {
          let permaLinkDomain = countryLangDomain;
          if (permaLinkDomain === undefined) {
            permaLinkDomain = countryDomains[0];
          }

          if (permaLinkDomain === undefined) {
            return;
          }

          redirect(
            302,
            resolveUrl(
              {
                name: "package-perma",
              },
              permaLinkDomain.language.code,
              permaLinkDomain.domain,
            ),
          );
          return;
        }

        if (url.pathname === "/") {
          if (countryLangDomain !== undefined) {
            redirect(
              302,
              resolveUrl(
                {
                  name: "packages",
                },
                countryLangDomain.language.code,
                countryLangDomain.domain,
              ),
            );
            return;
          }
        }
      }

      // on the LOCALE_CHOOSER_DOMAIN, only the choose-locale route is allowed
      if (deLocaliseRouteName(currentRoute.name) !== "choose-locale") {
        redirect(
          301,
          router.resolve({
            name: localiseRouteName(
              "choose-locale",
              localeToLang(locale.value.code),
            ),
          }).fullPath,
        );
      }
    } else {
      // if locale and route language don't match, we redirect to the same route in the desired locale
      const routeLang = langFromRouteName(currentRoute.name);
      const localeLang = localeToLang(locale.value.code);

      if (routeLang !== localeLang) {
        redirect(
          302,
          router.resolve({
            name: localiseRouteName(
              deLocaliseRouteName(currentRoute.name),
              localeToLang(locale.value.code),
            ),
            params: currentRoute.params,
          }).fullPath,
        );
      }
    }

    if (url.hostname.endsWith(".ch") && url.pathname === "/") {
      // Redirect to /fr if user prefers fr locale
      if (isInitialRequest()) {
        if (prefLang === "fr") {
          redirect(302, "/" + prefLang);
        }
      }
    }
  }
});
