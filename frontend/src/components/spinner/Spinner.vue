<template>
  <div class="spinner" />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class Spinner extends Vue {}
</script>

<style scoped lang="scss">
.spinner {
  max-width: 1.5rem;
  max-height: 1.5rem;
  min-width: 1.5rem;
  min-height: 1.5rem;
  border-radius: 50%;
  background-image: linear-gradient(
    to left,
    #42b983,
    #42b983 50%,
    #2c3e50 50%,
    #2c3e50
  );

  animation: spinner-animation 1s ease-in-out infinite;
}

@keyframes spinner-animation {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
