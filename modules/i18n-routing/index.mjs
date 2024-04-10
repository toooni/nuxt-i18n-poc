import {
  createResolver,
  defineNuxtModule,
  extendPages,
  addPlugin,
} from "@nuxt/kit";
import clone from "lodash/clone";
import { useI18nHelpers } from "./composables/useI18nHelpers";
import routeTranslations from "../../translations/routes.json";

export default defineNuxtModule({
  setup() {
    const resolver = createResolver(import.meta.url);

    // careful when adding new plugins: the order matters (FILO) -> The last registered plugin will be executed first
    addPlugin({
      src: resolver.resolve("plugins/RedirectionPlugin.js"),
      mode: "server",
    });

    addPlugin({
      src: resolver.resolve("plugins/LocalePlugin.js"),
      mode: "all",
    });

    addPlugin({
      src: resolver.resolve("plugins/UrlPlugin.js"),
      mode: "all",
    });

    extendPages(async (routes) => {
      const { localiseRouteName } = useI18nHelpers();
      const languages = ["de", "fr"];
      const newRoutes = [];

      const getTranslatedPath = (route, lang) => {
        const hasTrailingSlash = route.path.substring(0, 1) === "/";
        const routeKey = hasTrailingSlash
          ? route.path.substring(1)
          : route.path;

        if (routeKey === "") {
          return "";
        }

        if (!routeTranslations[lang][routeKey]) {
          console.error(
            `No translation for route "${routeKey}" in lang "${lang}" found.`,
          );
        }

        return `${hasTrailingSlash ? "/" : ""}${
          routeTranslations[lang][routeKey]
        }`;
      };

      const internationaliseRoute = (route, lang) => {
        const newRoute = Object.assign(clone(route), {
          path: getTranslatedPath(route, lang),
          name: localiseRouteName(route.name, lang),
        });

        if (route.children) {
          newRoute.children = route.children.map((childRoute) => {
            return internationaliseRoute(childRoute, lang);
          });
        }

        return newRoute;
      };

      languages.forEach((lang) => {
        newRoutes.push(
          ...routes.map((route) => internationaliseRoute(route, lang)),
        );
      });

      // don't replace the original routes object because nuxt holds a reference to it
      routes.length = 0; // remove non-i18n routes
      routes.push(...newRoutes); // add i18n routes
    });
  },
});
