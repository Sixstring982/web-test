<template>
  <div>
    <h1>Inventory</h1>
    <div class="inventory-grid">
      <InventoryViewComponent ref="inventoryView" class="inventory-view" />
      <RestaurantSettings
        class="restaurant-settings"
        @updated="handleRestarauntSettingsUpdated()"
      />
    </div>
  </div>
</template>

<script lang="ts">
import InventoryViewComponent from '../components/inventory/InventoryView.vue'
import RestaurantSettings from '../components/restuarant/RestaurantSettings.vue'

export default {
  name: 'Inventory',
  components: {
    InventoryViewComponent,
    RestaurantSettings
  },
  methods: {
    handleRestarauntSettingsUpdated: function() {
      this.$refs.inventoryView.refresh()
    }
  }
}
</script>

<style scoped lang="scss">
.inventory-grid {
  display: grid;
  grid-template-columns: 1fr 0fr;
  grid-template-rows: 1fr;
  grid-template-areas: 'inventory-view restaurant-settings';
  row-gap: 2rem;
  column-gap: 2rem;

  & > .inventory-view {
    grid-area: inventory-view;
  }
  & > .restaurant-settings {
    grid-area: restaurant-settings;
  }
}

@media only screen and (max-width: 600px) {
  .inventory-grid {
    grid-template-columns: 1fr;
    grid-template-areas:
      'inventory-view'
      'restaurant-settings';
  }
}
</style>
