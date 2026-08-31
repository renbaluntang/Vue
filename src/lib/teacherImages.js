// Real instructor portraits served by the Brighture API, keyed by teacher id.
// Each key was matched to its teacher by eye against the live booking page, so a
// name and a face always travel together — never paired by array position.
const imageUrl = (key) => `https://brighture-edu.com/api.html?model=teacher&cmd=image&key=${key}`;

export const TEACHER_IMAGE_KEYS = {
  'Jirvy Dela Torre': 184,
  'Jane Pasanting': 178,
  'Analyn Yosores': 176,
  'Sandra Auman': 175,
  'Nash Tatoy': 139,
};

/** Short forms used in chat threads resolve to the same person. */
const ALIASES = { 'Analyn Y.': 'Analyn Yosores' };

export const TEACHER_IMAGES = Object.values(TEACHER_IMAGE_KEYS).map(imageUrl);

export const imageForKey = imageUrl;

export const teacherImage = (name) => {
  const key = TEACHER_IMAGE_KEYS[ALIASES[name] ?? name];
  return key ? imageUrl(key) : TEACHER_IMAGES[0];
};
