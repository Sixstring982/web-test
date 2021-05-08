<template>
  <div class="card-wrapper settings-card">
    <h2>Restaurant settings</h2>

    <Spinner v-if="loading" />
    <template v-else>
      <div v-if="settings === null">
        Restaurant settings failed to load.
      </div>
      <template v-else>
        <h3>Base party size</h3>
        <p>
          The base number of parties that we can handle during any given time
          slot. Updating this value will update all time slots which have not
          configured a specific capacity.
        </p>
        <div class="base-parties-input">
          <input
            v-if="!loading"
            class="base-parties-input"
            type="number"
            :value="settings.basePartySize"
            @change="updateBasePartySize($event)"
          />
        </div>
        <p />
        <input
          type="button"
          :value="saveButtonText"
          v-on:click="saveSettings()"
        />
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import axios from 'axios'
import { Component, Vue } from 'vue-property-decorator'

import { RestaurantSettings } from '../../model/RestaurantSettings'
import Spinner from '../../components/spinner/Spinner.vue'

@Component({
  components: {
    Spinner
  }
})
export default class RestaurantSettingsComponent extends Vue {
  settings: RestaurantSettings | null = null

  loading = false
  saving = false

  saveButtonText = 'Save'

  /* override */
  mounted(): void {
    this.reload()
  }

  reload(): void {
    this.loading = true
    axios
      .get('http://localhost:9090/restaurantsettings')
      .then(response => {
        this.settings = {
          basePartySize: response.data.base_parties_per_time_slot
        }

        console.log(response)
      })
      .catch(error => {
        this.settings = null
        console.log(error)
      })
      .then(() => {
        this.loading = false
      })
  }

  updateBasePartySize(event: InputEvent): void {
    this.settings = {
      ...this.settings,
      basePartySize: Number((event.target as HTMLInputElement).value)
    }
  }

  saveSettings(): void {
    if (this.settings === null) {
      return
    }

    this.saving = true
    this.saveButtonText = 'Saving...'

    const postArgs = {
      basePartySize: this.settings.basePartySize
    }

    console.log(postArgs)

    axios
      .post('http://localhost:9090/restaurantsettings', postArgs)
      .then(response => {
        this.saveButtonText = 'Settings saved successfully'
      })
      .catch(error => {
        console.log(error)
        this.saveButtonText = 'Settings could not be saved. Try again later.'
      })
      .then(() => {
        setTimeout(() => {
          this.saveButtonText = 'Save'
        }, 500)
      })
  }
}
</script>

<style lang="scss">
.settings-card {
  width: 20rem;
  text-align: left;
}
</style>
