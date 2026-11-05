import { createApp } from "vue";
import { createPinia } from "pinia";
import { getRouter } from "./router";
import { getClassicRouter } from "./router/classic";
import { getMinimalRouter } from "./router/minimal";
import { getTeacherRouter } from "./router/teacher";
import { getAdminRouter } from "./router/admin";
import i18n from "./i18n";
import LoginRegisterPanel from "./pages/LoginRegisterPanel.vue";
import LoginRegisterPanelV2 from "./pages/LoginRegisterPanelV2.vue";
import RootPage from "./pages/RootPage.vue";
import PortalApp from "./pages/PortalApp.vue";
import TeacherPortalApp from "./pages/TeacherPortalApp.vue";
import AdminPortalApp from "./pages/AdminPortalApp.vue";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./styles.css";

// Under GitHub Pages the app is mounted at /Vue/, so strip that prefix before
// matching — every route check below is written against the app root.
const BASE_PREFIX = import.meta.env.BASE_URL.replace(/\/+$/, "");
const rawPath = window.location.pathname.replace(/\/+$/, "") || "/";
const normalizedPath =
  (BASE_PREFIX && rawPath.startsWith(BASE_PREFIX) ? rawPath.slice(BASE_PREFIX.length) : rawPath) || "/";
const isTeacherPortalView =
  normalizedPath === "/teacher-portal" || normalizedPath.startsWith("/teacher-portal/");
const isAdminPortalView =
  normalizedPath === "/admin-portal" || normalizedPath.startsWith("/admin-portal/");
const isLoginView = normalizedPath === "/login";
const isLoginViewV2 = normalizedPath === "/login-2";

const isStudentPortalClassicView =
  normalizedPath === "/student-portal-classic" || normalizedPath.startsWith("/student-portal-classic/");

const isStudentPortalV2View =
  normalizedPath === "/student-portal-v2" ||
  normalizedPath.startsWith("/student-portal-v2/") ||
  normalizedPath === "/student-5";

const isStudentPortalView =
  !isStudentPortalClassicView &&
  !isStudentPortalV2View &&
  (normalizedPath === "/student-portal" || normalizedPath.startsWith("/student-portal/"));

const getPage = () => {
  if (isAdminPortalView) {
    return AdminPortalApp;
  }
  if (isTeacherPortalView) {
    return TeacherPortalApp;
  }
  if (isLoginView || isLoginViewV2) {
    return LoginRegisterPanelV2;
  }
  if (normalizedPath === "/login-1") {
    return LoginRegisterPanel;
  }
  if (isStudentPortalView || isStudentPortalClassicView || isStudentPortalV2View) {
    return PortalApp;
  }
  return RootPage;
};

const page = getPage();

// The <title> in index.html is only a fallback. Each portal names itself so the
// tab says which one is open — the two are often side by side while testing.
if (isStudentPortalView || isStudentPortalClassicView || isStudentPortalV2View) {
  document.title = "Student Panel";
} else if (isTeacherPortalView) {
  document.title = normalizedPath === "/teacher-portal/login" ? "Teacher Sign In | Brighture" : "Instructor Panel";
} else if (isAdminPortalView) {
  document.title = "Admin Panel";
}

const app = createApp(page);

if (page === TeacherPortalApp) {
  app.use(createPinia());
  app.use(getTeacherRouter());
} else if (page === AdminPortalApp) {
  app.use(createPinia());
  app.use(getAdminRouter());
} else if (page === PortalApp) {
  app.use(createPinia());
  if (isStudentPortalV2View) {
    app.use(getMinimalRouter());
  } else if (isStudentPortalClassicView) {
    app.use(getClassicRouter());
  } else {
    app.use(getRouter());
  }
  app.use(i18n);
}

app.mount("#root");

// Retire the boot splash once the first view is actually on screen. The extra
// frame avoids a flash of empty layout between removing the splash and paint.
requestAnimationFrame(() => {
  const splash = document.getElementById("app-splash");
  if (!splash) return;
  splash.setAttribute("hidden-fading", "");
  splash.addEventListener("transitionend", () => splash.remove(), { once: true });
  // Belt and braces: if the transition never fires (reduced motion, tab in the
  // background), drop it anyway so it can't sit over the app.
  setTimeout(() => splash.remove(), 800);
});
