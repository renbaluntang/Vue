// Real instructor portraits, keyed by teacher id. Each key was matched to its
// teacher by eye against the live booking page, so a name and a face always
// travel together — never paired by array position.
//
// The portraits are bundled rather than fetched from the API. The endpoint
// (`api.html?model=teacher&cmd=image&key=…`) runs through a PHP session, so it
// answers with `Cache-Control: no-store` and hands out a session cookie on every
// hit. The browser is therefore forbidden from caching the faces and re-fetched
// all of them on every page load — ~700ms apiece for a 9KB portrait, which is
// what put the loading skeletons on screen. Bundled copies are hashed and
// cached for good. Re-download them into src/assets/teachers/ when a teacher
// changes their photo.
const LOCAL_PORTRAITS = import.meta.glob('../assets/teachers/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
});

const remoteUrl = (key) => `https://brighture-edu.com/api.html?model=teacher&cmd=image&key=${key}`;

export const TEACHER_IMAGE_KEYS = {
  'Jirvy Dela Torre': 184,
  'Jane Pasanting': 178,
  'Analyn Yosores': 176,
  'Sandra Auman': 175,
  'Nash Tatoy': 139,
};

/** Short forms used in chat threads resolve to the same person. */
const ALIASES = { 'Analyn Y.': 'Analyn Yosores' };

/** Falls back to the live endpoint for any id that has no bundled copy yet. */
export const imageForKey = (key) =>
  LOCAL_PORTRAITS[`../assets/teachers/${key}.jpg`] ?? remoteUrl(key);

export const TEACHER_IMAGES = Object.values(TEACHER_IMAGE_KEYS).map(imageForKey);

export const teacherImage = (name) => {
  const key = TEACHER_IMAGE_KEYS[ALIASES[name] ?? name];
  return key ? imageForKey(key) : TEACHER_IMAGES[0];
};
