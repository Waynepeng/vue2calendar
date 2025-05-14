import Vue from 'vue';
import App from './App.vue';


// Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app');    



import Lunar from 'lunar-javascript';

// 在 Vue 组件中使用
export default {
  computed: {
    lunarInfo() {
      try {
        // 使用 Solar 构造函数
        const solar = Lunar.Solar.fromDate(new Date());
        const lunar = solar.getLunar();
        return lunar;
      } catch (error) {
        console.error('获取农历信息时出错:', error);
        return null;
      }
    }
  },
  methods: {
    getLunarInfo() {
      try {
        const solar = Lunar.Solar.fromDate(new Date());
        const lunar = solar.getLunar();
        return lunar;
      } catch (error) {
        console.error('获取农历信息时出错:', error);
        return null;
      }
    }
  }
};

import axios from 'axios';

axios.interceptors.request.use(config => {
    config.headers['ngrok-skip-browser-warning'] = 'any_value';
    return config;
});

Vue.prototype.$http = axios;