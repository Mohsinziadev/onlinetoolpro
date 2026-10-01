/**
 * Non-catalog navigation. Tool, category and article links are generated from
 * the catalog and blog registry, so they never need to be listed here.
 */
export type NavLink = { label: string; href: string; description?: string };

export const resourceLinks: NavLink[] = [
  { label: "Blog", href: "/blog", description: "Step-by-step guides that go with the tools." },
  { label: "How it works", href: "/how-it-works", description: "How the tools work and keep your data private." },
  { label: "FAQs", href: "/faq", description: "Answers to common questions." },
];

export const companyLinks: NavLink[] = [
  { label: "About", href: "/about", description: "Who we are and how we build the tools." },
  { label: "Contact", href: "/contact", description: "Questions, problems or tool ideas." },
];

export const legalLinks: NavLink[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms", href: "/terms" },
  { label: "Disclaimer", href: "/disclaimer" },
  { label: "Acceptable Use", href: "/acceptable-use" },
];

export const toolLinks: NavLink[] = [
  { label: "All tools", href: "/tools" },
  { label: "Popular tools", href: "/tools#popular" },
  { label: "New tools", href: "/tools#new" },
];
