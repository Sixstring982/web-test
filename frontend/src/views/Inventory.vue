<template>
  <div>
    <h1>Inventory</h1>
    <div class="inventory-grid">
      <InventoryView class="inventory-view" />
      <RestaurantSettings class="restaurant-settings" />
    </div>
  </div>
</template>

<script lang="ts">
import InventoryView from '../components/inventory/InventoryView.vue'
import RestaurantSettings from '../components/restuarant/RestaurantSettings.vue'

export default {
  name: 'Inventory',
  components: {
    InventoryView,
    RestaurantSettings
  }
}
</script>

<style scoped lang="scss">
.inventory-grid {
  display: grid;
  grid-template-columns: 1fr 10rem;
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
</style>
