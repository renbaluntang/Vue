// Single source of truth for what a student can buy. Both the purchase flow and
// the profile's plan display read from here, so a plan can never be renamed in
// one place and go stale in the other.
export const SUBSCRIPTION_PLANS = [
  {
    id: "sub-20",
    name: "Subscription 20",
    price: "$80",
    points: 20,
    validity: "45 days",
    description: "Great for regular weekly lessons",
    savings: null,
  },
  {
    id: "sub-40",
    name: "Subscription 40",
    price: "$154",
    points: 40,
    validity: "45 days",
    description: "Most popular for steady progress",
    popular: true,
    savings: "Save $6 vs Top-up",
  },
  {
    id: "sub-60",
    name: "Subscription 60",
    price: "$225",
    points: 60,
    validity: "45 days",
    description: "Best for intensive study & fast growth",
    savings: "Save $15 vs Top-up",
  },
];

export const ONE_TIME_PLANS = [
  {
    id: "one-5",
    name: "Starter 5",
    price: "$25",
    points: 5,
    validity: "7 days",
    description: "Quick trial & practice sessions",
  },
  {
    id: "one-20",
    name: "Standard 20",
    price: "$85",
    points: 20,
    validity: "30 days",
    description: "Flexible pacing over 1 month",
  },
  {
    id: "one-40",
    name: "Flex 40",
    price: "$165",
    points: 40,
    validity: "60 days",
    description: "Ideal for 2 months of study",
  },
  {
    id: "one-100",
    name: "Power 100",
    price: "$370",
    points: 100,
    validity: "90 days",
    description: "Maximum points & lowest rate",
    bestValue: true,
    savings: "Save $30 vs Top-up",
  },
];

export const TOP_UP_RATE = 4;
export const TOP_UP_PRESETS = [1, 2, 3, 5, 8, 10];

export const ALL_PLANS = [...SUBSCRIPTION_PLANS, ...ONE_TIME_PLANS];

/** Look a plan up by the id stored on the student's profile. */
export const findPlan = (id) => ALL_PLANS.find((plan) => plan.id === id) ?? null;

export const isSubscription = (id) => SUBSCRIPTION_PLANS.some((plan) => plan.id === id);
