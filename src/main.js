import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入字体路标
import './assets/font/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'
import axios from 'axios'
import TreesTable from 'vue-table-with-tree-grid'
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// axios 请求拦截
axios.interceptors.request.use(config => {
  // 为请求头对象，添加 Token 验证的 Authorization 字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 最后要返回config
  console.log(config)
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('table-tree', TreesTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
