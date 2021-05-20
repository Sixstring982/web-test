<template>
  <div class="card-wrapper inventory-card">
    <div class="month-title">
      <span class="material-icons nav-button" @click="decrementMonth()">
        navigate_before
      </span>
      <span
        class="material-icons nav-button today-button"
        title="Jump to today"
        @click="jumpToToday()"
      >
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
    <div class="time-selector-wrapper">
      <InventoryConfigurationComponent
        :configs="dateCardConfigs"
        :isApplying="isApplying"
        @copyToSelectedDates="handleCopyToSelectedDates($event)"
        @applyTimeConfig="handleApplyTimeConfig($event)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import moment from 'moment'
import { Component, Vue } from 'vue-property-decorator'
import DateCardComponent from './DateCard.vue'
import InventoryConfigurationComponent, {
  ApplyTimeConfigEvent
} from './InventoryConfigurationComponent.vue'
import {
  DateCardConfig,
  dateCardForDayOfMonth,
  emptyDateCardConfig,
  FullDateCardConfig,
  isFullDateCardConfig,
  pastDateCardForDayOfMonth,
  toggleSelected
} from './DateCardConfig'
import axios from 'axios'
import { CopyToSelectedDatesEvent } from './TimeSelector.vue'

@Component({
  components: {
    DateCardComponent,
    InventoryConfigurationComponent
  }
})
export default class InventoryViewComponent extends Vue {
  dateCardConfigs: readonly DateCardConfig[] = []

  isApplying = false

  monthAndYear = moment().format('MMMM YYYY')
  monthDelta = 0

  async mounted() {
    this.dateCardConfigs = await this.buildDateCardsForRelativeMonth(0)
  }

  /** Refreshes this component by fetching relevant data. */
  async refresh() {
    this.dateCardConfigs = await this.buildDateCardsForRelativeMonth(
      this.monthDelta,
      new Set(
        this.dateCardConfigs
          .filter(x => isFullDateCardConfig(x) && x.selected)
          .map(x => (x as FullDateCardConfig).dayOfMonth)
      )
    )
  }

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

  async handleApplyTimeConfig(e: ApplyTimeConfigEvent) {
    const times: readonly string[][] = this.dateCardConfigs
      .filter(isFullDateCardConfig)
      .filter(x => x.selected)
      // esnext doesn't have flatMap? Bummer. I'll flatten below.
      .map(x => {
        const startOfDay = moment()
          .add(this.monthDelta, 'months')
          .startOf('month')
          .add(x.dayOfMonth - 1, 'days')

        const selectedTimes = [...x.selectedTimes].map(timeIndex =>
          moment(startOfDay)
            .add(15 * timeIndex, 'minutes')
            .toISOString()
        )

        return selectedTimes
      })

    const flatTimes = []
    times.forEach(ts => ts.forEach(t => flatTimes.push(t)))

    this.isApplying = true
    axios
      .post('http://localhost:9090/inventory/update', {
        newCapacity: e.newCapacity,
        times: flatTimes
      })
      .then(() =>
        this.buildDateCardsForRelativeMonth(
          this.monthDelta,
          new Set(
            this.dateCardConfigs
              .filter(x => isFullDateCardConfig(x) && x.selected)
              .map(x => (x as FullDateCardConfig).dayOfMonth)
          )
        )
      )
      .then(dateCards => {
        this.dateCardConfigs = dateCards
        this.isApplying = false
      })
      .catch(() => {
        this.isApplying = false
      })
  }

  handleCopyToSelectedDates(e: CopyToSelectedDatesEvent): void {
    this.dateCardConfigs = this.dateCardConfigs.map(config => {
      if (!isFullDateCardConfig(config) || !config.selected) {
        return config
      }

      return {
        ...config,
        selectedTimes: new Set([...e.fromDateCardConfig.selectedTimes])
      }
    })
  }

  private updateFullCardConfigs(
    fn: (c: FullDateCardConfig) => FullDateCardConfig
  ): void {
    this.dateCardConfigs = this.dateCardConfigs.map(x => {
      if (!isFullDateCardConfig(x)) {
        return x
      }
      return fn(x)
    })
  }

  private async shiftMonth(delta: number) {
    this.monthDelta += delta
    this.monthAndYear = moment()
      .add(this.monthDelta, 'months')
      .format('MMMM YYYY')
    this.dateCardConfigs = await this.buildDateCardsForRelativeMonth(
      this.monthDelta
    )
  }

  private async buildDateCardsForRelativeMonth(
    delta: number,
    selectedDays?: ReadonlySet<number>
  ): Promise<ReadonlyArray<DateCardConfig>> {
    const cards = []

    const firstDayOfWeek = moment()
      .add(delta, 'months')
      .startOf('month')
      .day()

    const lastDayOfMonth = moment()
      .add(delta, 'months')
      .daysInMonth()

    const today = moment().date()

    const response = (
      await axios.post('http://localhost:9090/inventory/query', {
        startTime: moment()
          .add(delta, 'months')
          .startOf('month')
          .toISOString(),
        endTime: moment()
          .add(delta, 'months')
          .endOf('month')
          .toISOString()
      })
    ).data

    console.log(response)

    for (let x = 0; x < 7; x++) {
      for (let y = 0; y < 6; y++) {
        const calendarIndex = x * 6 + y
        const dayOfMonth = calendarIndex - firstDayOfWeek + 1

        if (
          calendarIndex < firstDayOfWeek ||
          calendarIndex - firstDayOfWeek >= lastDayOfMonth
        ) {
          cards.push(emptyDateCardConfig())
        } else if (delta < 0 || (delta === 0 && dayOfMonth < today)) {
          cards.push(pastDateCardForDayOfMonth(dayOfMonth))
        } else {
          const startOfDay = moment()
            .add(delta, 'months')
            .startOf('month')
            .add(dayOfMonth - 1, 'days')

          const capacitiesByIndex = new Map<number, number>()
          const reservationsByIndex = new Map<number, number>()

          // Loop through all 15-minute windows
          for (let i = 0; i < 24 * 4; i++) {
            const windowTime: string = moment(startOfDay)
              .add(15 * i, 'minutes')
              .toISOString()

            capacitiesByIndex.set(
              i,
              response.overrides[windowTime] ?? response.baseCapacity
            )
            reservationsByIndex.set(i, response.reservations[windowTime] ?? 0)
          }

          cards.push(
            dateCardForDayOfMonth(
              moment()
                .add(delta, 'months')
                .month(),
              dayOfMonth,
              capacitiesByIndex,
              reservationsByIndex,
              selectedDays?.has(dayOfMonth)
            )
          )
        }
      }
    }
    return cards
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
    margin: 0 0.25rem;
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
