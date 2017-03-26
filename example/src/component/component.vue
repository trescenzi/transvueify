<template>
  <div class="component">
    <slot name="first></slot>
    <div>{{splitter}}</div>
    <slot name="second"></slot>
  </div>
</template>

<script>
  export default {
    data: {
      splitter: 'hi',
    },
  }
</script>

<style lang="scss">
.component {
  &:nth-child(1) {
    background-color: red;
  }

  &:nth-child(2) {
    background-color: blue;
  }

  &:nth-child(3) {
    background-color: green;
  }
}
</style>
