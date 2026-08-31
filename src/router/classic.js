// Classic panel — same routes as the main portal, wired to the portal-classic
// pages and the pre-yellow (indigo) layout.
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    component: () => import('../components/layout/PortalLayoutClassic.vue'),
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('../pages/portal-classic/DashboardPage.vue'),
      },
      {
        path: 'booking',
        name: 'booking',
        component: () => import('../pages/portal-classic/BookingPage.vue'),
      },
      {
        path: 'analytics',
        name: 'analytics',
        component: () => import('../pages/portal-classic/AnalyticsPage.vue'),
      },
      {
        path: 'history',
        name: 'history',
        component: () => import('../pages/portal-classic/HistoryPage.vue'),
      },
      {
        path: 'writing',
        name: 'writing',
        component: () => import('../pages/portal-classic/WritingPage.vue'),
      },
      {
        path: 'points',
        name: 'points',
        component: () => import('../pages/portal-classic/PointHistoryPage.vue'),
      },
      {
        path: 'purchase',
        name: 'purchase',
        component: () => import('../pages/portal-classic/PurchasePointsPage.vue'),
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('../pages/portal-classic/ProfilePage.vue'),
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
export const getClassicRouter = () => {
  if (!router) {
    router = createRouter({
      history: createWebHistory(`${import.meta.env.BASE_URL}student-portal-classic`),
      routes,
    });
  }
  return router;
};
