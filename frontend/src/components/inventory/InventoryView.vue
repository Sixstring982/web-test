<template>
  <div class="card-wrapper inventory-card">
    <div class="month-title">
      <span class="material-icons nav-button" @click="decrementMonth()">
        navigate_before
      </span>
      <span class="material-icons nav-button today-button"
            title="Jump to today"
            @click="jumpToToday()">
        today
      </span>
      <span class="month-label">
        {{ monthAndYear }}
      </span>
      <span class="material-icons nav-button" @click="incrementMonth()">
        navigate_next
      </span>
    </div>
    <div class="date-card-grid">
      <div
        class="day-of-week-header"
        v-for="dayOfWeek in [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday'
        ]"
        v-bind:key="dayOfWeek"
      >
        {{ dayOfWeek }}
      </div>
      <div
        class="date-card-target"
        v-for="config of dateCardConfigs"
        v-bind:key="config.key"
        @click="toggleDateCard(config.key)"
      >
        <DateCardComponent :config="config" />
      </div>
    </div>
    <div class="select-buttons-wrapper">
      Select
      <input type="button" value="All" @click="selectAll()" />
      <input type="button" value="None" @click="selectNone()" />
    </div>
  </div>
</template>

<script lang="ts">
import moment from 'moment'
import { Component, Vue } from 'vue-property-decorator'
import DateCardComponent from './DateCard.vue'
import {
  DateCardConfig,
  dateCardForDayOfMonth,
  emptyDateCardConfig,
  FullDateCardConfig,
  isEmptyDateCardConfig,
  toggleSelected
} from './DateCardConfig'

const buildDateCardsForRelativeMonth = (
  delta: number
): readonly DateCardConfig[] => {
  const cards = []

  const firstDayOfWeek = moment()
    .add(delta, 'months')
    .startOf('month')
    .day()

  const lastDayOfMonth = moment()
    .add(delta, 'months')
    .daysInMonth()

  for (let x = 0; x < 7; x++) {
    for (let y = 0; y < 6; y++) {
      const dayOfMonth = x * 6 + y
      if (
        dayOfMonth < firstDayOfWeek ||
        dayOfMonth - firstDayOfWeek >= lastDayOfMonth
      ) {
        cards.push(emptyDateCardConfig())
      } else {
        cards.push(dateCardForDayOfMonth(dayOfMonth - firstDayOfWeek + 1))
      }
    }
  }

  return cards
}

@Component({
  components: {
    DateCardComponent
  }
})
export default class InventoryViewComponent extends Vue {
  dateCardConfigs: readonly DateCardConfig[] = buildDateCardsForRelativeMonth(0)

  monthAndYear = moment().format('MMMM YYYY')
  monthDelta = 0

  decrementMonth() {
    this.shiftMonth(-1)
  }

  jumpToToday() {
    this.monthDelta = 0
    this.shiftMonth(0)
  }

  incrementMonth() {
    this.shiftMonth(1)
  }

  toggleDateCard(key: symbol): void {
    this.updateFullCardConfigs(x => {
      if (x.key !== key) {
        return x
      }
      return toggleSelected(x)
    })
  }

  selectAll(): void {
    this.updateFullCardConfigs(x => ({
      ...x,
      selected: true
    }))
  }

  selectNone(): void {
    this.updateFullCardConfigs(x => ({
      ...x,
      selected: false
    }))
  }

  private updateFullCardConfigs(
    fn: (c: FullDateCardConfig) => FullDateCardConfig
  ): void {
    this.dateCardConfigs = this.dateCardConfigs.map(x => {
      if (isEmptyDateCardConfig(x)) {
        return x
      }
      return fn(x)
    })
  }

  private shiftMonth(delta: number): void {
    this.monthDelta += delta
    this.monthAndYear = moment()
      .add(this.monthDelta, 'months')
      .format('MMMM YYYY')
    this.dateCardConfigs = buildDateCardsForRelativeMonth(this.monthDelta)
  }
}
</script>

<style lang="scss">
.month-title {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 1rem;

  & > * {
    margin: 0 .25rem;
  }

  & > .month-label {
    width: 12rem;
  }

  & > .nav-button {
    width: 2.5rem;
    height: 2.5rem;
    padding: 0.5rem;
    font-size: 2.5rem;
    cursor: pointer;
    user-select: none;
    border-radius: 50%;

    transition: all 64ms ease-in-out;

    &:hover {
      transition: all 0 ease-in-out;
      background-color: #2c3e50;
      color: #42b983;
    }
    &:active {
      transition: all 0ms;
      background-color: #42b983;
      color: #2c3e50;
    }
  }
}

.date-card-grid {
  display: grid;

  grid-template-rows: 1.5rem repeat(6, 1fr);
  grid-template-columns: repeat(7, 1fr);

  row-gap: 1rem;
  column-gap: 1rem;
}

.select-buttons-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  margin-top: 1rem;

  font-size: 1.25rem;

  & > * {
    font-size: 1rem;
    margin: 0 0.5rem;
  }
}

@media only screen and (max-width: 600px) {
  .day-of-week-header {
    display: none;
  }

  .date-card-grid {
    grid-template-rows: repeat(6, 1fr);
    grid-template-columns: 1fr;
  }
}
</style>
