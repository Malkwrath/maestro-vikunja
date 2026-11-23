import { computed, watch, readonly } from "vue";
import { createSharedComposable, tryOnMounted } from "@vueuse/core";
import type { BasicColorSchema } from "@vueuse/core";

const CLASS_DARK = "dark";
const CLASS_LIGHT = "light";

export const useColorScheme = createSharedComposable(() => {
	const store = computed<BasicColorSchema>(() => "dark");
	const isDark = computed<boolean>(() => true);

	function onChanged(v: boolean) {
		const el = window?.document.querySelector("html");
		el?.classList.toggle(CLASS_DARK, v);
		el?.classList.toggle(CLASS_LIGHT, !v);
	}

	watch(isDark, onChanged, { flush: "post" });

	tryOnMounted(() => onChanged(isDark.value));

	return {
		store,
		isDark: readonly(isDark),
	};
});
