import { siteConfig } from "@/lib/site";
import type { Author } from "@/lib/blog/types";

/**
 * Bylines. Only describe people and experience that are real. When a named
 * writer joins, add them here (type "Person") with an honest bio, and set
 * `authorId` on their articles.
 */
export const authors: Author[] = [
  {
    id: "editorial",
    name: `${siteConfig.name} Editorial Team`,
    role: "Builds and tests the tools on this site",
    bio: `The team behind ${siteConfig.name}. We write guides from building and testing these tools, and check platform rules against official documentation such as YouTube Help. When something changes, we update the article and its date.`,
    type: "Organization",
    url: "/about",
  },
];

export function getAuthor(id: string): Author {
  return authors.find((a) => a.id === id) ?? authors[0];
}
