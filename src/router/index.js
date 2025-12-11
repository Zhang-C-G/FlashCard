import { createRouter, createWebHistory } from 'vue-router'
import ReviewView from '@/views/ReviewView.vue'
import AddView from '@/views/AddView.vue'
import ManageView from '@/views/ManageView.vue'

const routes = [
  {
    path: '/',
    name: 'review',
    component: ReviewView
  },
  {
    path: '/add',
    name: 'add',
    component: AddView
  },
  {
    path: '/manage',
    name: 'manage',
    component: ManageView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
