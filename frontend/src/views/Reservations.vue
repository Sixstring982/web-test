<template>
  <div>
    <h1>Reservations</h1>
    <ReservationCard />
  </div>
</template>

<script lang="ts">
import ReservationCard from '../components/reservations/ReservationCard.vue'

export default {
  name: 'Reservations',
  components: {
    ReservationCard
  }
}
</script>
