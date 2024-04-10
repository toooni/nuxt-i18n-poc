<template>
  <NuxtLink v-bind="$props.nuxtLinkProps" :to="i18nTo"><slot /></NuxtLink>
</template>

<script setup>
import { useI18nRouting } from "@/modules/i18n-routing/composables/useI18nRouting";
import { useI18nHelpers } from "@/modules/i18n-routing/composables/useI18nHelpers";

const { locale } = useI18nRouting();
const { localiseRouteName, localeToLang } = useI18nHelpers();

const props = defineProps({
  nuxtLinkProps: {
    // this will just pass down the original props that NuxtLink knows about
    type: Object,
    default: () => {},
  },
  to: {
    type: [Object, String],
    default: () => {},
  },
});

const originalName = props.to.name;

const i18nTo = computed(() => {
  const i18nTo = toRaw(props.to);

  if (originalName && !originalName.includes("___")) {
    i18nTo.name = localiseRouteName(
      originalName,
      localeToLang(locale.value.code)
    );
  }

  return i18nTo;
});
</script>
