import Vue from 'vue'
import Router from 'vue-router'

// import Login from './components/Login.vue'
const Login = () => import(/* webpackChunkName: "one" */ './components/Login.vue')
// import Home from './components/Home.vue'
const Home = () => import(/* webpackChunkName: "one" */ './components/Home.vue')
// import Welcome from './components/Welcome.vue'
const Welcome = () => import(/* webpackChunkName: "one" */ './components/Welcome.vue')

// import Users from './components/user/Users.vue'
const Users = () => import(/* webpackChunkName: "two" */ './components/user/Users.vue')
// import Rights from './components/power/Rights.vue'
const Rights = () => import(/* webpackChunkName: "two" */ './components/power/Rights.vue')
// import Roles from './components/power/Roles.vue'
const Roles = () => import(/* webpackChunkName: "two" */ './components/power/Roles.vue')

// import Goods from './components/goodmanager/Goods.vue'
const Goods = () => import(/* webpackChunkName: "three" */ './components/goodmanager/Goods.vue')
// import Params from './components/goodmanager/Params.vue'
const Params = () => import(/* webpackChunkName: "three" */ './components/goodmanager/Params.vue')

// import Categories from './components/goodmanager/Categories.vue'
const Categories = () => import(/* webpackChunkName: "four" */ './components/goodmanager/Categories.vue')
// import Add from './components/goodmanager/Addgoods.vue'
const Add = () => import(/* webpackChunkName: "four" */ './components/goodmanager/Addgoods.vue')

// import Orders from './components/ordermanager/Orders.vue'
const Orders = () => import(/* webpackChunkName: "five" */ './components/ordermanager/Orders.vue')
// import Reports from './components/statistic/Reports.vue'
const Reports = () => import(/* webpackChunkName: "five" */ './components/statistic/Reports.vue')

Vue.use(Router)

const router = new Router({
  routes: [
    // 对初始化页面链接进行重定向
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [{ path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/rights', component: Rights },
        { path: '/roles', component: Roles },
        { path: '/goods', component: Goods },
        { path: '/params', component: Params },
        { path: '/categories', component: Categories },
        { path: '/orders', component: Orders },
        { path: '/reports', component: Reports },
        { path: '/goods/add', component: Add }
      ]
    }
  ]
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  // 接受当前的token值
  const tokenStr = window.sessionStorage.getItem('token')
  // 如果没有token值回到登录界面
  if (!tokenStr) return next('/login')
  return next()
})
// to代表将要访问的路径
// from 代表从哪个路径跳转而来
// next 是一个函数，表示放行
// next() 放行  next('/login') 强制跳转

export default router
