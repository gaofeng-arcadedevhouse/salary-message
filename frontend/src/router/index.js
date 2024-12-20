
import login from '@/views/login/login.vue';
import sendPayroll from '@/views/send-payroll/send-payroll.vue';
import { createRouter, createWebHistory } from 'vue-router';
export const routes = [
  {
    path: '/',
    component:sendPayroll,
  },
  {
    path: '/send-payroll',
    component:sendPayroll,
  },
  {
    path: '/login',
    component:login,
  }
]
const router = createRouter({
  history: createWebHistory(),
  routes,  
});

export default router;
