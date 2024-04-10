export const useI18nHelpers = () => {
  const localeToLang = (locale) => {
    return locale.substring(0, 2);
  };

  const localiseRouteName = (routeName, lang) => {
    return `${routeName}___${lang}`;
  };

  const deLocaliseRouteName = (localisedRouteName) => {
    if (localisedRouteName === undefined) {
      return undefined;
    }

    return localisedRouteName.substring(0, localisedRouteName.length - 5);
  };

  const langFromRouteName = (localisedRouteName) => {
    if (localisedRouteName === undefined) {
      return "en";
    }

    return localisedRouteName.substring(localisedRouteName.length - 2);
  };

  const guessLanguage = (allowedLanguages, acceptLanguageHeader) => {
    const reqLocales = acceptLanguageHeader
      ?.split(",")
      .map((languageString) => {
        return languageString.substr(0, 2);
      });

    if (reqLocales !== undefined) {
      for (let index = 0; index < reqLocales.length; index++) {
        if (allowedLanguages.indexOf(reqLocales[index]) >= 0) {
          return reqLocales[index];
        }
      }
    }

    return allowedLanguages[0];
  };

  return {
    langFromRouteName,
    localeToLang,
    localiseRouteName,
    deLocaliseRouteName,
    guessLanguage,
  };
};
