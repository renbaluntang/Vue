import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    component: () => import('../components/layout/TeacherPortalLayout.vue'),
    children: [
      { path: '', name: 't-dashboard', component: () => import('../pages/teacher-portal/DashboardPage.vue') },
      { path: 'reservations', name: 't-reservations', component: () => import('../pages/teacher-portal/ReservationsPage.vue') },
      { path: 'schedule', name: 't-schedule', component: () => import('../pages/teacher-portal/SchedulePage.vue') },
      { path: 'lessons', name: 't-lessons', component: () => import('../pages/teacher-portal/LessonLogPage.vue') },
      { path: 'writing', name: 't-writing', component: () => import('../pages/teacher-portal/WritingPage.vue') },
      { path: 'analytics', name: 't-analytics', component: () => import('../pages/teacher-portal/AnalyticsPage.vue') },
      { path: 'profile', name: 't-profile', component: () => import('../pages/teacher-portal/ProfilePage.vue') },
      // Anything retired lands on the reservation list rather than an empty view.
      { path: ':pathMatch(.*)*', redirect: '/' },
    ],
  },
];

let router;
export const getTeacherRouter = () => {
  if (!router) {
    router = createRouter({
      history: createWebHistory(`${import.meta.env.BASE_URL}teacher-portal`),
      routes,
    });
  }
  return router;
};
