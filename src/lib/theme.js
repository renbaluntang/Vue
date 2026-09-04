import { ref, watch } from 'vue';

/**
 * Portal colour scheme. Tailwind is configured with `darkMode: ["class"]`, so
 * the whole theme hangs off a single class on <html> — the palette itself lives
 * in styles.css under `.dark`.
 */
const STORAGE_KEY = 'brighture:theme';

const readStored = () => {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
};

const systemPrefersDark = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-color-scheme: dark)').matches === true;

const stored = readStored();

/** An explicit choice wins; otherwise follow the operating system. */
export const isDark = ref(stored ? stored === 'dark' : systemPrefersDark());

const apply = (dark) => {
  document.documentElement.classList.toggle('dark', dark);
  // Keeps the mobile browser chrome from staying light above a dark page.
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', dark ? '#0B1120' : '#FDF9EF');
};

apply(isDark.value);

watch(isDark, (dark) => {
  apply(dark);
  try { localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light'); } catch { /* private mode */ }
});

// Until someone picks a side, keep following the system if it changes.
if (typeof window !== 'undefined' && !stored) {
  window.matchMedia?.('(prefers-color-scheme: dark)')?.addEventListener?.('change', (event) => {
    if (!readStored()) isDark.value = event.matches;
  });
}

export const toggleTheme = () => { isDark.value = !isDark.value; };
