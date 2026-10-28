import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    component: () => import('../components/layout/AdminPortalLayout.vue'),
    children: [
      // Templates are where level checks start, so the portal opens there.
      { path: '', redirect: '/templates' },
      { path: 'templates', name: 'a-templates', meta: { title: 'Level check templates' }, component: () => import('../pages/admin-portal/TemplatesPage.vue') },
      { path: 'templates/new', name: 'a-template-new', meta: { title: 'New template', nav: '/templates' }, component: () => import('../pages/admin-portal/TemplateBuilderPage.vue') },
      { path: 'templates/:id', name: 'a-template-edit', meta: { title: 'Edit template', nav: '/templates' }, component: () => import('../pages/admin-portal/TemplateBuilderPage.vue') },
      { path: 'levels', name: 'a-levels', meta: { title: 'Students & levels' }, component: () => import('../pages/admin-portal/LevelsPage.vue') },
      { path: 'assessments', name: 'a-assessments', meta: { title: 'Assessments' }, component: () => import('../pages/admin-portal/AssessmentsPage.vue') },
      { path: 'emails', name: 'a-emails', meta: { title: 'Emails' }, component: () => import('../pages/admin-portal/EmailsPage.vue') },
      // Unknown paths land on the templates list rather than an empty view.
      { path: ':pathMatch(.*)*', redirect: '/' },
    ],
  },
];

let router;
export const getAdminRouter = () => {
  if (!router) {
    router = createRouter({
      history: createWebHistory(`${import.meta.env.BASE_URL}admin-portal`),
      routes,
    });
  }
  return router;
};
