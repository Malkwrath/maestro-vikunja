<template>
<div class="no-auth-wrapper">
<Logo class="logo" />
<div class="noauth-container">
<section
class="image"
:class="{ 'has-message': motd !== '' }"
>
<Message v-if="motd !== ''">
{{ motd }}
</Message>
<h2 class="image-title">
{{ $t("misc.welcomeBack") }}
</h2>
</section>
<main
id="main-content"
tabindex="-1"
class="content"
>
<div>
<h2
v-if="title"
class="title"
>
{{ title }}
</h2>
<ApiConfig v-if="shouldShowApiConfig" />
<Message
v-if="motd !== ''"
class="is-hidden-tablet mbe-4"
>
{{ motd }}
</Message>
<slot />
</div>
<Legal />
</main>
</div>
</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import Logo from '@/components/home/Logo.vue'
import Message from '@/components/misc/Message.vue'
import Legal from '@/components/misc/Legal.vue'
import ApiConfig from '@/components/misc/ApiConfig.vue'

import { useTitle } from '@/composables/useTitle'
import { useConfigStore } from '@/stores/config'
import { isDesktopApp } from '@/helpers/desktopAuth'

const props = withDefaults(
defineProps<{
showApiConfig?: boolean;
}>(),
{
showApiConfig: false,
},
)

const isDesktop = isDesktopApp()
const hasStoredApiUrl = isDesktop && localStorage.getItem('API_URL') !== null
const shouldShowApiConfig = computed(() => props.showApiConfig && (!isDesktop || hasStoredApiUrl))

const configStore = useConfigStore()
const motd = computed(() => configStore.motd)

const route = useRoute()
const { t } = useI18n({ useScope: 'global' })
const title = computed(() =>
route.meta?.title ? t(route.meta.title as string) : '',
)
useTitle(() => title.value)
</script>

<style lang="scss" scoped>
.no-auth-wrapper {
background: radial-gradient(circle at 50% 0%, rgba(184, 134, 11, 0.14) 0%, #0b0d10 62%);
min-block-size: 100vh;
display: flex;
flex-direction: column;
place-items: center;
justify-content: center;
padding: 1.5rem;
}

.noauth-container {
max-inline-size: $desktop;
inline-size: 100%;
min-block-size: 56vh;
display: flex;
background-color: #14171c;
border: 1px solid rgba(184, 134, 11, 0.35);
box-shadow: 0 20px 50px rgba(0, 0, 0, 0.65);
overflow: hidden;

@media screen and (min-width: $desktop) {
border-radius: $radius;
}
}

.image {
inline-size: 50%;
padding: 2rem;
display: flex;
flex-direction: column;
justify-content: flex-end;

@media screen and (max-width: $tablet) {
display: none;
}

@media screen and (min-width: $tablet) {
background:
radial-gradient(circle at 30% 25%, rgba(252, 54, 82, 0.12), transparent 55%),
radial-gradient(circle at 75% 75%, rgba(184, 134, 11, 0.22), transparent 60%),
linear-gradient(145deg, #1b1b1b 0%, #0e1013 100%);
border-inline-end: 1px solid rgba(184, 134, 11, 0.2);
position: relative;

&.has-message {
justify-content: space-between;
}

&::before {
content: "";
position: absolute;
inset: 0;
background: url("@/assets/maestro-logo.svg?url") no-repeat center 38% / 140px 140px;
opacity: 0.14;
pointer-events: none;
}

> * {
position: relative;
}
}
}

.content {
display: flex;
justify-content: space-between;
flex-direction: column;
padding: 2rem 2rem 1.5rem;

@media screen and (max-width: $desktop) {
inline-size: 100%;
max-inline-size: 450px;
margin-inline: auto;
}

@media screen and (min-width: $desktop) {
inline-size: 50%;
}
}

.logo {
max-inline-size: 100%;
margin: 0 0 1.5rem;
}

.image-title {
color: #f8f8f8;
font-size: 2.25rem;
font-weight: 700;
}
</style>
