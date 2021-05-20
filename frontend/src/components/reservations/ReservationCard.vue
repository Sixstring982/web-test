<template>
  <div class="card-wrapper">
    <h3>
      <span class="title">
        <span class="material-icons">today</span>
        Make a reservation
      </span>
    </h3>

    <div class="input-wrapper">
      <input
        class="name-input"
        placeholder="Name"
        type="text"
        :value="reservation.name"
        @change="handleNameChange($event)"
      />
      <input
        class="email-input"
        placeholder="Email"
        type="text"
        :value="reservation.email"
        @change="handleEmailChange($event)"
      />
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
          v-else
          type="button"
          value="Find a table"
          :disbaled="!isFormValid()"
          v-on:click="makeReservation()"
        />
      </div>

      <AlertComponent
        v-if="alertConfig !== null"
        class="alert"
        :config="alertConfig"
        @dismiss="dismissAlert()"
      />

      <div class="suggested-times-wrapper">
        <input
          v-for="time in suggestedTimes"
          v-bind:key="time.toISOString()"
          type="button"
          :value="time.format('HH:mm')"
          v-on:click="makeReservation(time)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import axios from 'axios'
import moment, { Moment } from 'moment'

import Spinner from '../spinner/Spinner.vue'
import { Reservation } from '../../model/Reservation'
import AlertComponent from '../alert/Alert.vue'
import { AlertConfig, errorAlert, infoAlert } from '../alert/AlertConfig'

const getInitialDate = (): moment.Moment => {
  // 7PM tonight is a good time to eat.
  const m = moment()
    .startOf('day')
    .add(19, 'hours')

  // ...Unless it's past 7. Let's go tomorrow.
  if (moment().hour() >= 19) {
    m.add(1, 'day')
  }

  return m
}

const getInitialReservation = (): Reservation => ({
  name: '',
  email: '',
  partySize: 2,
  moment: getInitialDate()
})

@Component({
  components: {
    AlertComponent,
    Spinner
  }
})
export default class ReservationCard extends Vue {
  private reservation: Reservation = getInitialReservation()

  alertConfig: AlertConfig | null = null

  suggestedTimes: readonly Moment[] = []

  private loading = false

  handleNameChange(event: InputEvent): void {
    const name = (event.target as HTMLInputElement).value

    this.updateReservation({ name })
  }

  handleEmailChange(event: InputEvent): void {
    const email = (event.target as HTMLInputElement).value

    this.updateReservation({ email })
  }

  getReservationDate(): string {
    return this.reservation.moment.format('YYYY-MM-DD')
  }

  getReservationTime(): string {
    return this.reservation.moment.format('HH:mm')
  }

  handleDateChange(event: InputEvent): void {
    const oldMoment = this.reservation.moment

    const newMoment = moment((event.target as HTMLInputElement).value)

    this.updateReservationMoment(
      newMoment.hour(oldMoment.hour()).minute(oldMoment.minute())
    )
  }

  handleTimeChange(event: InputEvent): void {
    const value = (event.target as HTMLInputElement).value
    const hour = Number(value.split(':')[0])
    const minute = Number(value.split(':')[1])

    this.updateReservationMoment(
      moment(this.reservation.moment)
        .hour(hour)
        .minute(minute)
    )
  }

  handleGuestCountChange(event: InputEvent): void {
    const value = (event.target as HTMLInputElement).value

    this.updateReservation({ partySize: Number(value) })
  }

  isFormValid(): boolean {
    return this.getFormError() === undefined
  }

  makeReservation(atTime?: Moment): void {
    this.dismissAlert()
    this.suggestedTimes = []

    const formError = this.getFormError()
    if (formError !== undefined) {
      this.alertConfig = errorAlert(formError)
      return
    }

    const time = atTime ?? this.reservation.moment

    this.loading = true

    axios
      .post('http://localhost:9090/reservation/make', {
        name: this.reservation.name,
        email: this.reservation.email,
        partySize: this.reservation.partySize,
        time: time.toISOString()
      })
      .then(response => {
        if (response.data.success) {
          this.alertConfig = infoAlert(
            ` Reservation made at ${time.format('HH:mm')}.`
          )
        } else {
          if (!response.data.suggestedTimes) {
            this.alertConfig = errorAlert(
              'No reservations can be made near this time. Please make a ' +
                'reservation for another day.'
            )
          } else {
            this.suggestedTimes = response.data.suggestedTimes.map(time =>
              moment(time)
            )
          }
        }
      })
      .catch(error => {
        this.alertConfig = errorAlert('Reservation unsuccessful.')
      })
      .then(() => {
        this.loading = false
      })
  }

  dismissAlert(): void {
    this.alertConfig = null
  }

  private getFormError(): string | undefined {
    if (this.reservation.name.length < 3) {
      return 'Please enter a longer name.'
    }
    // Super simple email regexp. They're hard to validate properly!
    if (this.reservation.email.match(/.+@.+\..[a-z]+/) === null) {
      return 'Please enter a valid email.'
    }
    if (this.reservation.partySize < 1) {
      return 'Please choose a valid party size.'
    }
    if (this.reservation.moment.toDate().getTime() < new Date().getTime()) {
      return 'Please choose a time in the future.'
    }
    return undefined
  }

  private updateReservationMoment(moment: Moment): void {
    this.updateReservation({ moment })
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
    'name-input              name-input'
    'email-input             email-input'
    'date-input              date-input'
    'time-input              guest-count-input'
    'find-a-table-button     find-a-table-button'
    'alert                   alert'
    'suggested-times-wrapper suggested-times-wrapper';

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
  & > .alert {
    grid-area: alert;
  }
  & > .suggested-times-wrapper {
    grid-area: suggested-times-wrapper;
    display: flex;
    flex-direction: column;

    & > * {
      margin-top: 0.2rem;
    }
    &:first-child {
      margin-top: 0;
    }
  }
}
</style>
