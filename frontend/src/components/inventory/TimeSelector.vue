<template>
  <div class="time-selector-wrapper">
    <div class="time-selector-header">
      <h2>{{ getDate() }}</h2>
      <span
        class="material-icons copy-button"
        title="Copy time selection to other selected dates"
        @click="handleCopyButtonClick()"
      >
        assignment
      </span>
    </div>
    <div
      class="times-wrapper"
      @mousedown="startDrag()"
      @mouseup="stopDrag()"
      @mouseleave="stopDrag()"
    >
      <span
        v-for="(n, i) in 96"
        v-bind:key="i"
        v-bind:class="{ selected: isTimeSelected(i), saved: isTimeSaved(i) }"
        class="time-selector"
        @click="toggleTime(i)"
        @mouseenter="highlightTime(i)"
        @mouseleave="clearTime()"
      >
        {{ capacityForTime(i) }}
      </span>
    </div>
    <template v-if="currentTime === null">
      Select a time
    </template>
    <template v-else>
      {{ currentTime }}
    </template>
  </div>
</template>

<script lang="ts">
import moment from 'moment'
import { Component, Prop, Vue } from 'vue-property-decorator'
import { FullDateCardConfig } from './DateCardConfig'

export interface CopyToSelectedDatesEvent {
  readonly fromDateCardConfig: FullDateCardConfig
}

@Component
export default class TimeSelectorComponent extends Vue {
  @Prop() dateCardConfig: FullDateCardConfig

  currentTime: string | null = null

  dragging = false

  getDate(): string {
    if (this.dateCardConfig === undefined) {
      return '(unknown date)'
    }
    return moment()
      .month(this.dateCardConfig.month)
      .date(this.dateCardConfig.dayOfMonth)
      .format('MMMM Do')
  }

  handleCopyButtonClick(): void {
    const event: CopyToSelectedDatesEvent = {
      fromDateCardConfig: this.dateCardConfig,
    }

    this.$emit('copyToSelectedDates', event)
  }

  startDrag(): void {
    this.dragging = true
  }

  stopDrag(): void {
    this.dragging = false
  }

  isTimeSelected(index: number): boolean {
    return this.dateCardConfig.selectedTimes.has(index)
  }

  isTimeSaved(index: number): boolean {
    return this.dateCardConfig.savedTimes.has(index)
  }

  toggleTime(index: number): void {
    if (this.dateCardConfig.selectedTimes.has(index)) {
      this.dateCardConfig.selectedTimes.delete(index)
    } else {
      this.dateCardConfig.selectedTimes.add(index)
    }
  }

  highlightTime(index: number): void {
    const hour = Math.floor(index / 4)
    const minute = (() => {
      const m = (index * 15) % 60
      if (m > 10) {
        return String(m)
      }
      return '0' + String(m)
    })()

    this.currentTime = `${hour}:${minute}`

    if (this.dragging) {
      this.toggleTime(index)
    }
  }

  clearTime(): void {
    this.currentTime = null
  }

  capacityForTime(index: number): number {
    return this.dateCardConfig.savedTimes.get(index) ?? 0
  }
}
</script>

<style scoped lang="scss">
.time-selector-header {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.copy-button {
  width: 1.5rem;
  height: 1.5rem;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 50%;

  &:hover {
    background-color: #2c3e50;
    color: #42b983;
  }
}

.times-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: center;

  & > .time-selector {
    user-select: none;
    width: 0.6rem;
    height: 2rem;
    border: 1px solid black;

    will-change: background-color;

    &:hover,
    &.selected {
      background-color: gray;
    }
    &.selected {
      background-color: red;
    }
    &.selected:hover {
      background-color: darken(red, 20);
    }
    &:active,
    &.selected:active {
      background-color: yellow;
    }
  }
}
</style>
