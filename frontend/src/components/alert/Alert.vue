<template>
  <div
    class="alert-wrapper"
    v-bind:class="{ info: isInfo(), warning: isWarning(), error: isError() }"
  >
    {{ config.message }}
    <div class="dismiss-button material-icons" @click="handleDismiss()">
      close
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { AlertConfig, AlertKind } from './AlertConfig'

@Component
export default class AlertComponent extends Vue {
  @Prop() config: AlertConfig

  isInfo(): boolean {
    return this.config.kind === AlertKind.INFO
  }

  isWarning(): boolean {
    return this.config.kind === AlertKind.WARNING
  }

  isError(): boolean {
    return this.config.kind === AlertKind.ERROR
  }

  handleDismiss(): void {
    this.$emit('dismiss')
  }
}
</script>

<style scoped lang="scss">
.alert-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  border-radius: 4px;
  padding: .5rem;

  color: whitesmoke;

  &.info {
    background-color: green;
  }
  &.warning {
    background-color: yellow;
  }
  &.error {
    background-color: red;
  }

  & > .dismiss-button {
    cursor: pointer;
    border-radius: 50%;

    &:hover {
      background-color: rgba(0,0,0,.4)
    }
  }
}
</style>
