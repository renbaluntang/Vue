import { createApp } from "vue";
import { createPinia } from "pinia";
import { getRouter } from "./router";
import { getClassicRouter } from "./router/classic";
import { getMinimalRouter } from "./router/minimal";
import i18n from "./i18n";
import App from "./pages/app-panel/App.vue";
import LoginRegisterPanel from "./pages/LoginRegisterPanel.vue";
import LoginRegisterPanelV2 from "./pages/LoginRegisterPanelV2.vue";
import RootPage from "./pages/RootPage.vue";
import SocialConversationPage from "./pages/SocialConversationPage.vue";
import StudentView from "./pages/StudentView.vue";
import StudentViewV2 from "./pages/StudentViewV2.vue";
import StudentViewV3 from "./pages/StudentViewV3.vue";
import StudentViewV4 from "./pages/StudentViewV4.vue";
import PointsPurchase from "./pages/PointsPurchase.vue";
import PortalApp from "./pages/PortalApp.vue";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./styles.css";

const normalizedPath = window.location.pathname.replace(/\/+$/, "") || "/";
const isTeacherView = normalizedPath === "/teacher";
const isStudentView = normalizedPath === "/student";
const isStudentViewV2 = normalizedPath === "/student-2";
const isStudentViewV3 = normalizedPath === "/student-3";
const isStudentViewV4 = normalizedPath === "/student-4";
const isSocialConversationView = normalizedPath === "/social-conversation";
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
  if (isTeacherView) {
    return App;
  }
  if (isLoginView || isLoginViewV2) {
    return LoginRegisterPanelV2;
  }
  if (normalizedPath === "/login-1") {
    return LoginRegisterPanel;
  }
  if (isStudentView) {
    return StudentView;
  }
  if (isStudentViewV2) {
    return StudentViewV2;
  }
  if (isStudentViewV3) {
    return StudentViewV3;
  }
  if (isStudentViewV4) {
    return StudentViewV4;
  }
  if (isSocialConversationView) {
    return SocialConversationPage;
  }
  if (normalizedPath === "/points-purchase") {
    return PointsPurchase;
  }
  if (isStudentPortalView || isStudentPortalClassicView || isStudentPortalV2View) {
    return PortalApp;
  }
  return RootPage;
};

const page = getPage();
const app = createApp(page);

if (page === PortalApp) {
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
