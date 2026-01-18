import { createRouter, createWebHistory } from 'vue-router'
import TestComponent from '@/components/TestComponent.vue'
import ToastContainer from '@/components/ToastContainer.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/assets'
    },
    {
      path: '/overview',
      name: 'overview',
      component: TestComponent,
    },
    {
      path: '/assets',
      name: 'assets',
      component: () => import('@/views/asset/AssetList.vue'),
    },
    {
      path: '/ht-db',
      name: 'ht-db',
      component: TestComponent,
    },
    {
      path: '/tools',
      name: 'tools',
      component: ToastContainer,
    },
    {
      path: '/category',
      name: 'category',
      component: TestComponent,
    },
    {
      path: '/search',
      name: 'search',
      component: TestComponent,
    },
    {
      path: '/report',
      name: 'report',
      component: TestComponent,
    }
  ],
})

export default router
