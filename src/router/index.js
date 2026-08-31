import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    component: () => import('../components/layout/PortalLayout.vue'),
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('../pages/portal/DashboardPage.vue'),
      },
      {
        path: 'booking',
        name: 'booking',
        component: () => import('../pages/portal/BookingPage.vue'),
      },
      {
        path: 'analytics',
        name: 'analytics',
        component: () => import('../pages/portal/AnalyticsPage.vue'),
      },
      {
        path: 'history',
        name: 'history',
        component: () => import('../pages/portal/HistoryPage.vue'),
      },
      {
        path: 'writing',
        name: 'writing',
        component: () => import('../pages/portal/WritingPage.vue'),
      },
      {
        path: 'points',
        name: 'points',
        component: () => import('../pages/portal/PointHistoryPage.vue'),
      },
      {
        path: 'purchase',
        name: 'purchase',
        component: () => import('../pages/portal/PurchasePointsPage.vue'),
      },
      {
        path: 'refer',
        name: 'refer',
        component: () => import('../pages/portal/ReferPage.vue'),
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('../pages/portal/ProfilePage.vue'),
      },
      // Redirect any old billing requests to analytics
      {
        path: 'billing',
        redirect: '/analytics',
      },
      // Retired routes (e.g. the old /counseling stub) land on the dashboard
      // rather than rendering an empty RouterView.
      {
        path: ':pathMatch(.*)*',
        redirect: '/',
      },
    ]
  }
];

let router;
export const getRouter = () => {
  if (!router) {
    router = createRouter({
      history: createWebHistory('/student-portal'),
      routes,
    });
  }
  return router;
};
