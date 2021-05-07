<template>
  <div id="app">
    <div id="nav">
      <router-link to="/reservations">Reservations</router-link> |
      <router-link to="/inventory">Inventory</router-link>
    </div>
    <div class="central-column">
      <router-view />
    </div>
  </div>
</template>

<style lang="scss">
@import url("https://fonts.googleapis.com/icon?family=Material+Icons&display=swap");

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 2rem 0;
  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

.central-column {
  display: flex;
  flex-direction: column;
  align-items: center;
}

body {
  margin: 0 5rem;
}
</style>
