<template>
  <div id="app">
    <!-- 确保组件标签名正确 -->
    <FullCalendar />
  </div>
</template>

<script>
// 确保路径正确
import FullCalendar from './components/FullCalendar.vue';

export default {
  name: 'App',
  components: {
    // 确保组件名正确注册
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
  color: #2c3e50;
  margin-top: 60px;
}
</style>