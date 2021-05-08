<template>
  <div
    class="card-wrapper date-card-wrapper"
    v-bind:class="{ empty: isEmpty(), selected: isSelected() }"
  >
    <div v-if="!isEmpty()" class="day-of-month">
      {{ config.dayOfMonth }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { DateCardConfig, isEmptyDateCardConfig } from './DateCardConfig'

@Component
export default class DateCardComponent extends Vue {
  @Prop() private config!: DateCardConfig

  isEmpty(): boolean {
    return isEmptyDateCardConfig(this.config)
  }

  isSelected(): boolean {
    if (isEmptyDateCardConfig(this.config)) {
      return false
    }
    return this.config.selected
  }
}
</script>

<style scoped lang="scss">
$EMPTY_BG_COLOR: gray;

$FULL_BG_COLOR: steelblue;
$SELECTED_BG_COLOR: orangered;

.date-card-wrapper {
  cursor: pointer;
  width: 3rem;
  height: 3rem;

  background-color: $FULL_BG_COLOR;

  transition: all 64ms ease-in;

  &.empty {
    cursor: not-allowed;
    background-color: $EMPTY_BG_COLOR;
    &:hover {
      background-color: $EMPTY_BG_COLOR;
      transform: translateY(0);
    }
  }

  &.selected {
    background-color: $SELECTED_BG_COLOR;
    &:hover {
      background-color: lighten($SELECTED_BG_COLOR, 20);
    }
  }

  &:hover {
    background-color: lighten($FULL_BG_COLOR, 20);
    transition: transform 64ms ease-out;
    transform: translateY(-0.5rem);
  }
  &:active {
    background-color: darken($FULL_BG_COLOR, 20);
  }

  & > .day-of-month {
    color: whitesmoke;
    font-size: 1.25rem;
    transform: color 64ms linear;
  }
  &:hover > .day-of-month {
    color: black;
  }
}
</style>
