export const navItems = [
  { href: "#platform", label: "Platform" },
  { href: "#build", label: "Build phases" },
  { href: "/login", label: "Login" },
];

export const buildPhases = [
  {
    title: "Foundation",
    description:
      "App shell, route structure, visual system, and environment setup for the PRD features.",
  },
  {
    title: "Core Data",
    description:
      "Users, subscriptions, scores, charities, draws, and payout-ready relational design.",
  },
  {
    title: "Member Product",
    description:
      "Authentication, score entry, subscription status, charity selection, and the user dashboard.",
  },
  {
    title: "Admin Operations",
    description:
      "Draw controls, winner verification, content management, reports, and payout tracking.",
  },
];

export const dashboardMetrics = [
  { label: "Subscription", value: "Active", hint: "Yearly plan renewal on Apr 19" },
  { label: "Latest score", value: "34", hint: "Stableford score from Mar 22" },
  { label: "Charity share", value: "15%", hint: "Chosen contribution percentage" },
  { label: "Draw entries", value: "3", hint: "Included in the next monthly cycle" },
];

export const adminPanels = [
  "User and subscription management",
  "Monthly draw simulation and publishing",
  "Charity content and featured spotlight control",
  "Winner verification and payout status tracking",
];
