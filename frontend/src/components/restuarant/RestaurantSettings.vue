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
            class="base-parties-input"
            type="number"
            :value="settings.basePartySize"
            @change="updateBasePartySize($event)"
          />
        </div>
        <p />
        <Spinner v-if="saving" />
        <input v-else type="button" value="Save" v-on:click="saveSettings()" />
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

  /* override */
  mounted(): void {
    this.reload()
  }

  reload(): void {
    this.loading = true
    axios
      .get('http://localhost:9090/restaurantsettings/get')
      .then(response => {
        this.settings = {
          basePartySize: response.data.base_parties_per_time_slot
        }
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

    const postArgs = {
      basePartySize: this.settings.basePartySize
    }

    axios
      .post('http://localhost:9090/restaurantsettings/update', postArgs)
      .then(() => {
        this.$emit('updated')
      })
      .catch(error => {
        console.log(error)
      })
      .then(() => {
        this.saving = false
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
