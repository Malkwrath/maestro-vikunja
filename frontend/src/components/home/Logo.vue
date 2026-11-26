<script setup lang="ts">
import MaestroLogo from '@/assets/maestro-logo.svg?component'
</script>

<template>
<div class="maestro-brand" title="Maestro">
<MaestroLogo class="maestro-icon" aria-label="Maestro" />
<span class="maestro-wordmark">MAESTRO</span>
</div>
</template>

<style lang="scss" scoped>
.maestro-brand {
display: inline-flex;
align-items: center;
gap: 0.65rem;
text-decoration: none;
user-select: none;
}

.maestro-icon {
inline-size: 36px;
block-size: 36px;
flex-shrink: 0;
}

.maestro-wordmark {
font-weight: 800;
font-size: 1.25rem;
letter-spacing: 0.14em;
color: #f8f8f8;
text-transform: uppercase;
}
</style>
