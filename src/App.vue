<template>
  <div id="app">
    <FullCalendar />
  </div>
</template>

<script>
import FullCalendar from './components/FullCalendar.vue';

export default {
  name: 'App',
  components: {
    FullCalendar
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #002b49;
  margin-top: 30px;
}
</style>    