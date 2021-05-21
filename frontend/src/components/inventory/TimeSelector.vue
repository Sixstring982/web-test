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
    <div class="times-wrapper" @mouseup="stopDrag()" @mouseleave="stopDrag()">
      <span
        v-for="(n, i) in 96"
        v-bind:key="i"
        v-bind:class="{ selected: isTimeSelected(i) }"
        class="time-selector"
        @mousedown="startDrag(i)"
        @mouseenter="dragTo(i)"
      >
        <span title="The number of reservations at this time.">{{
          reservationsForTime(i) || '_'
        }}</span>
        <span
          class="time-view"
          v-bind:class="{
            medium: isMedium(i),
            full: isFull(i),
            overfull: isOverfull(i)
          }"
          :title="timeViewTooltip(i)"
          >{{ timeStringForTime(i) }}</span
        >
        <span
          class="capacity-view"
          v-bind:class="{
            saved: isCapacitySaved(i)
          }"
          title="The planned capacity at this time."
          >{{ capacityForTime(i) }}</span
        >
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import moment from 'moment'
import { Component, Prop, Vue } from 'vue-property-decorator'
import { FullDateCardConfig } from './DateCardConfig'

const minMax = (a: number, b: number): { min: number; max: number } => ({
  min: Math.min(a, b),
  max: Math.max(a, b)
})

const isBetween = (n: number, a: number, b: number): boolean => {
  const { min, max } = minMax(a, b)
  return n >= min && n <= max
}

export interface CopyToSelectedDatesEvent {
  readonly fromDateCardConfig: FullDateCardConfig
}

const MEDIUM_THRESHOLD = 0.5
const FULL_THRESHOLD = 0.8
const OVERFULL_THRESHOLD = 1

@Component
export default class TimeSelectorComponent extends Vue {
  @Prop() dateCardConfig: FullDateCardConfig

  dragStart?: number
  dragEnd?: number

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
      fromDateCardConfig: this.dateCardConfig
    }

    this.$emit('copyToSelectedDates', event)
  }

  startDrag(index: number): void {
    this.dragStart = index
    this.dragTo(index)
  }

  stopDrag(): void {
    this.dragStart = undefined
    this.dragEnd = undefined
  }

  dragTo(index: number): void {
    if (this.dragStart !== undefined) {
      this.dragEnd = index

      for (let i = 0; i <= 96; i++) {
        const between = isBetween(i, this.dragStart, this.dragEnd)
        if (between) {
          this.dateCardConfig.selectedTimes.add(i)
        } else {
          this.dateCardConfig.selectedTimes.delete(i)
        }
      }
      this.$forceUpdate()
    }
  }

  isTimeSelected(index: number): boolean {
    return this.dateCardConfig.selectedTimes.has(index)
  }

  isMedium(index: number): boolean {
    return this.capacityRatioForTime(index) >= MEDIUM_THRESHOLD
  }

  isFull(index: number): boolean {
    return this.capacityRatioForTime(index) > FULL_THRESHOLD
  }

  isOverfull(index: number): boolean {
    return this.capacityRatioForTime(index) > OVERFULL_THRESHOLD
  }

  timeViewTooltip(index: number): string {
    const ratio = this.capacityRatioForTime(index)

    if (ratio > OVERFULL_THRESHOLD) {
      return 'You have too many reservations! You need to add capacity.'
    }
    if (ratio > FULL_THRESHOLD) {
      return 'You almost have too many reservations. Consider adding capacity.'
    }
    if (ratio > MEDIUM_THRESHOLD) {
      return (
        'You have a lot of reservations at this time. You may need to add ' +
        'capacity if you get too busy!'
      )
    }
    return 'You have plenty of capacity left.'
  }

  toggleTime(index: number): void {
    if (this.dateCardConfig.selectedTimes.has(index)) {
      this.dateCardConfig.selectedTimes.delete(index)
    } else {
      this.dateCardConfig.selectedTimes.add(index)
    }
  }

  highlightTime(index: number): void {
    if (this.dragStart !== undefined) {
      this.toggleTime(index)
    }
  }

  timeStringForTime(index: number): string {
    const hour = Math.floor(index / 4)
    const minute = (() => {
      const m = (index * 15) % 60
      if (m > 10) {
        return String(m)
      }
      return '0' + String(m)
    })()

    return `${hour}:${minute}`
  }

  isCapacitySaved(index: number): boolean {
    return this.dateCardConfig.savedTimes.has(index)
  }

  capacityForTime(index: number): number {
    return (
      this.dateCardConfig.savedTimes.get(index) ??
      this.dateCardConfig.baseCapacity
    )
  }

  reservationsForTime(index: number): number {
    return this.dateCardConfig.reservationsByTime.get(index) ?? 0
  }

  private capacityRatioForTime(index: number): number {
    const capacity = this.capacityForTime(index)
    if (capacity === 0) {
      return 1
    }

    const reservations = this.reservationsForTime(index)

    return reservations / capacity
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
  display: grid;
  grid-template-rows: repeat(3, 1fr);
  grid-template-columns: repeat(32, 1fr);

  cursor: context-menu;

  & > .time-selector {
    display: flex;
    flex-direction: column;

    user-select: none;
    width: 100%;
    height: 3rem;
    line-height: 1rem;
    border: 1px solid black;

    will-change: background-color;

    & > .time-view {
      font-size: 0.8rem;
      &.medium {
        background-color: yellow;
      }
      &.full {
        color: white;
        background-color: orangered;
        text-shadow: 0 0 2px black;
      }
      &.overfull {
        color: white;
        background-color: red;
        text-shadow: 0 0 2px black;
      }
    }

    & > .capacity-view.saved {
      background-color: rgba(0, 0, 0, 0.6);
      color: white;
    }

    &:hover {
      background-color: gray;
    }
    &.selected {
      background-color: #42b983;
    }
    &.selected:hover {
      background-color: darken(#42b983, 20);
    }
    &:active,
    &.selected:active {
      background-color: yellow;
    }
  }
}
</style>
