import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    component: () => import('../components/layout/PortalMinimalLayout.vue'),
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('../pages/portal-minimal/DashboardPage.vue'),
      },
      {
        path: 'booking',
        name: 'booking',
        component: () => import('../pages/portal-minimal/BookingPage.vue'),
      },
      {
        path: 'analytics',
        name: 'analytics',
        component: () => import('../pages/portal-minimal/AnalyticsPage.vue'),
      },
      {
        path: 'counseling',
        name: 'counseling',
        component: () => import('../pages/portal-minimal/CounselingPage.vue'),
      },
      {
        path: 'history',
        name: 'history',
        component: () => import('../pages/portal-minimal/HistoryPage.vue'),
      },
      {
        path: 'writing',
        name: 'writing',
        component: () => import('../pages/portal-minimal/WritingPage.vue'),
      },
      {
        path: 'points',
        name: 'points',
        component: () => import('../pages/portal-minimal/PointHistoryPage.vue'),
      },
      {
        path: 'purchase',
        name: 'purchase',
        component: () => import('../pages/portal-minimal/PurchasePointsPage.vue'),
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('../pages/portal-minimal/ProfilePage.vue'),
      },
      {
        path: 'billing',
        redirect: '/analytics',
      },
    ]
  }
];

let router;
export const getMinimalRouter = () => {
  if (!router) {
    router = createRouter({
      history: createWebHistory('/student-portal-v2'),
      routes,
    });
  }
  return router;
};
