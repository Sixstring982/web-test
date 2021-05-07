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
      <input
        class="find-a-table-button"
        type="button"
        value="Find a table"
        v-on:click="makeReservation()"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import { Reservation } from '../../model/Reservation'
import moment from 'moment'

const getInitialDate = (): moment.Moment =>
  // 7 PM today is a good time to eat.
  moment()
    .startOf('day')
    .add(19, 'hours')

const INITIAL_RESERVATION: Reservation = {
  name: '',
  email: '',
  partySize: 2,
  moment: getInitialDate()
}

@Component
export default class ReservationCard extends Vue {
  private reservation: Reservation = INITIAL_RESERVATION

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
    console.log('Making reservation...')
  }

  private updateReservation(r: Partial<Reservation>): void {
    console.log('Updating reservation: ', r)
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

.card-wrapper {
  padding: 1rem 3rem 3rem;
  max-width: 20rem;
  border-radius: 8px;
  box-shadow: 0 4px 16px 10px rgba(0, 0, 0, 0.2);
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
    grid-area: find-a-table-button;
  }
}
</style>
