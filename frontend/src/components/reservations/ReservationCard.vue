<template>
  <div class="card-wrapper">
    <h3>
      <span class="title">
        <span class="material-icons">today</span>
        Make a reservation
      </span>
    </h3>

    <div class="input-wrapper">
      <input class="name-input" placeholder="Name" type="text" />
      <input class="email-input" placeholder="Email" type="text" />
      <input
        class="date-input"
        type="date"
        :value="getReservationDate()"
        @change="handleDateChange($event)"
      />
      <input
        class="time-input"
        type="time"
        :value="getReservationTime()"
        @change="handleTimeChange($event)"
      />
      <select
        class="guest-count-input"
        @change="handleGuestCountChange($event)"
      >
        <option value="1">One guest</option>
        <option
          v-for="n in 19"
          v-bind:key="n"
          :value="n + 1"
          :selected="n + 1 === reservation.partySize"
        >
          {{ n + 1 }} guests
        </option>
      </select>

      <div class="find-a-table-button">
        <Spinner v-if="loading" />
        <input
          v-if="!loading"
          type="button"
          value="Find a table"
          v-on:click="makeReservation()"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import axios from 'axios'
import moment from 'moment'

import Spinner from '../spinner/Spinner.vue'
import { Reservation } from '../../model/Reservation'

const getInitialDate = (): moment.Moment =>
  // 7 PM today is a good time to eat.
  moment()
    .startOf('day')
    .add(19, 'hours')

const getInitialReservation = (): Reservation => ({
  name: '',
  email: '',
  partySize: 2,
  moment: getInitialDate()
})

@Component({
  components: {
    Spinner
  }
})
export default class ReservationCard extends Vue {
  private reservation: Reservation = getInitialReservation()

  private loading = false

  getReservationDate(): string {
    return this.reservation.moment.format('YYYY-MM-DD')
  }

  getReservationTime(): string {
    return this.reservation.moment.format('HH:mm')
  }

  handleDateChange(event: InputEvent): void {
    const oldMoment = this.reservation.moment

    const newMoment = moment((event.target as HTMLInputElement).value)

    this.updateReservation({
      moment: newMoment.hour(oldMoment.hour()).minute(oldMoment.minute())
    })
  }

  handleTimeChange(event: InputEvent): void {
    const value = (event.target as HTMLInputElement).value
    const hour = Number(value.split(':')[0])
    const minute = Number(value.split(':')[1])

    this.updateReservation({
      moment: this.reservation.moment.hour(hour).minute(minute)
    })
  }

  handleGuestCountChange(event: InputEvent): void {
    const value = (event.target as HTMLInputElement).value

    this.updateReservation({ partySize: Number(value) })
  }

  makeReservation(): void {
    this.loading = true

    axios
      .get('http://localhost:9090/inventory/list')
      .then(response => {
        console.log(response)
      })
      .catch(error => {
        console.log(error)
      })
      .then(() => {
        this.loading = false
      })
  }

  private updateReservation(r: Partial<Reservation>): void {
    console.log('Updating reservation: ', this.reservation)
    this.reservation = {
      ...this.reservation,
      ...r
    }
  }
}
</script>

<style scoped lang="scss">
.title {
  display: flex;
  align-items: center;
  :first-child {
    padding-right: 0.5rem;
  }
}

.input-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  grid-template-areas:
    'name-input name-input'
    'email-input email-input'
    'date-input date-input'
    'time-input guest-count-input'
    'find-a-table-button find-a-table-button';

  row-gap: 0.5rem;
  column-gap: 0.5rem;
  & > .name-input {
    grid-area: name-input;
  }
  & > .email-input {
    grid-area: email-input;
  }
  & > .date-input {
    grid-area: date-input;
  }
  & > .time-input {
    grid-area: time-input;
  }
  & > .guest-count-input {
    display: flex;
    grid-area: guest-count-input;
  }
  & > .find-a-table-button {
    display: flex;
    justify-content: center;
    grid-area: find-a-table-button;

    & > * {
      height: 1.5rem;
      width: 100%;
    }
  }
}
</style>
