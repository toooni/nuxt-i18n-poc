export default defineNuxtPlugin((nuxtApp) => {
  const headers = useRequestHeaders();

  const getCurrentUrl = () => {
    /*
      Never use the referrer header to get the url here.
      When using the locale switcher, the referrer will of course point
      to the previous host
    */
    return new URL(
      process.server
        ? `https://${headers.host}${nuxtApp.ssrContext.url}`
        : window.location,
    );
  };

  return {
    provide: {
      getCurrentUrl: () => {
        return getCurrentUrl();
      },
      getCurrentOrigin: () => {
        return getCurrentUrl().origin;
      },
    },
  };
});
