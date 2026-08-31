// Single source of truth for the referral programme. The numbers here are the
// ones printed on the legacy mypage referral screen — keep them in step with
// whatever the back end actually awards, and every banner, modal and page in
// the portal follows automatically.

/** The student's own code. Comes from the API in production. */
export const REFERRAL_CODE = 'DK5M51VK';

/** Registration page a referred friend has to sign up through. */
export const REFERRAL_BASE_URL = 'https://brighture-edu.com/register/index.html';

/** What each side gets, and the conditions attached. */
export const REFERRAL_TERMS = {
  friendDiscount: 20,          // USD off the friend's plan
  friendDiscountLabel: '$20',
  windowDays: 60,              // friend must purchase within this many days of registering
  referrerPoints: 5,           // credited to the referrer
};

export const referralUrl = (code = REFERRAL_CODE) =>
  `${REFERRAL_BASE_URL}?referral_code=${code}`;

export const referralShareMessage = (code = REFERRAL_CODE) =>
  `Join me on Brighture for 1-on-1 English lessons! Register with my referral code ${code} ` +
  `and get ${REFERRAL_TERMS.friendDiscountLabel} USD off your plan: ${referralUrl(code)}`;

/** The programme rules, verbatim from the legacy referral page. */
export const REFERRAL_RULES = [
  {
    icon: 'fa-solid fa-tag',
    title: `${REFERRAL_TERMS.friendDiscountLabel} USD off for your friend`,
    detail:
      `Friends who register using your referral code receive a ${REFERRAL_TERMS.friendDiscountLabel} USD ` +
      'discount on their plan as a referral benefit.',
  },
  {
    icon: 'fa-regular fa-clock',
    title: `Valid for ${REFERRAL_TERMS.windowDays} days`,
    detail:
      `The discount applies to their first purchase within ${REFERRAL_TERMS.windowDays} days of registration.`,
  },
  {
    icon: 'fa-solid fa-coins',
    title: `${REFERRAL_TERMS.referrerPoints} points for you`,
    detail:
      `Once your friend buys a plan and starts learning, you receive ${REFERRAL_TERMS.referrerPoints} points ` +
      'as a thank-you for your referral.',
  },
];

/** "How to Refer", as listed on the legacy page. */
export const REFERRAL_HOW_TO = [
  'Share the membership registration page URL and your referral code with your friends.',
  'Post your referral URL and code on social media, blogs, or other platforms.',
];
