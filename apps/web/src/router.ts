import { createRouter, createWebHistory } from 'vue-router';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('./views/CreateLecture.vue'),
    },
    {
      path: '/admin/:adminToken',
      component: () => import('./views/AdminDashboard.vue'),
    },
    {
      path: '/admin/:adminToken/stats',
      component: () => import('./views/AdminStats.vue'),
    },
    {
      path: '/join/:code',
      component: () => import('./views/AudienceVote.vue'),
    },
    {
      path: '/stats/:code',
      component: () => import('./views/PublicStats.vue'),
    },
  ],
});
