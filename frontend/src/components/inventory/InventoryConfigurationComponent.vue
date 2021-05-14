<template>
  <div class="configure-inventory-wrapper">
    <div class="inventory-header">
      <h3>Configure inventory</h3>
    </div>
    <template v-if="selectedConfigs().length === 0">
      Select at least one date to configure inventory.
    </template>
    <template v-else>
      <div class="inputs-wrapper">
        <div class="new-capacity-wrapper">
          New capacity:
          <input
            class="new-capacity-input"
            type="number"
            :value="newCapacity"
            @change="handleNewCapacityChange($event)"
          />
        </div>
        <input type="button" value="Apply" @click="applyTimeConfig()" />
      </div>
      <TimeSelectorComponent
        v-for="config in selectedConfigs()"
        v-bind:key="config.key"
        :dateCardConfig="config"
        @copyToSelectedDates="handleCopyToSelectedDates($event)"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { DateCardConfig, isFullDateCardConfig } from './DateCardConfig'

import TimeSelectorComponent, {
  CopyToSelectedDatesEvent
} from './TimeSelector.vue'

export interface ApplyTimeConfigEvent {
  readonly newCapacity: number
}

@Component({
  components: {
    TimeSelectorComponent
  }
})
export default class InventoryConfigurationComponent extends Vue {
  @Prop() configs: readonly DateCardConfig[]

  newCapacity = 3

  selectedConfigs(): readonly DateCardConfig[] {
    return this.configs.filter(x => isFullDateCardConfig(x) && x.selected)
  }

  handleCopyToSelectedDates(e: CopyToSelectedDatesEvent): void {
    this.$emit('copyToSelectedDates', e)
  }

  handleNewCapacityChange(e: InputEvent): void {
    this.newCapacity = Number((e.target as HTMLInputElement).value)
  }

  applyTimeConfig(): void {
    this.$emit('applyTimeConfig', {
      newCapacity: this.newCapacity
    })
  }
}
</script>

<style scoped lang="scss">
.inventory-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.inputs-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
</style>
