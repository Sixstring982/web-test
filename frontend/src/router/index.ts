import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Reservations from '../views/Reservations.vue'

Vue.use(VueRouter)

const routes: readonly RouteConfig[] = [
  {
    path: '/',
    redirect: 'reservations'
  },
  {
    path: '/reservations',
    name: 'Reservations',
    component: Reservations
  },
  {
    path: '/inventory',
    name: 'Inventory',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ '../views/Inventory.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [...routes]
})

export default router
