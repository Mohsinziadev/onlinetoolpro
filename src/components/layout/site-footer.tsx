import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { activeCategories, categoryHref, liveTools } from "@/lib/catalog/lite";
import { companyLinks, legalLinks, resourceLinks, toolLinks, type NavLink } from "@/lib/nav";
import { siteConfig } from "@/lib/site";

function Column({ title, links }: { title: string; links: NavLink[] }) {
  return (
    <div>
      <p className="text-[14px] font-medium text-ink">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-[14px] text-muted transition-colors hover:text-ink">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  // Categories with tools appear automatically as they launch; long lists flow into two columns.
  const categoryLinks = activeCategories.map((c) => ({ label: c.title, href: categoryHref(c) }));

  return (
    <footer className="mt-32 border-t border-line bg-bg-subtle">
      <div className="container-page grid grid-cols-1 gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.3fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-[14px] leading-[1.5] text-muted">{siteConfig.description}</p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-[13px] font-medium text-accent">Every tool is 100% free</p>
        </div>
        <Column title="Tools" links={toolLinks} />
        <div>
          <p className="text-[14px] font-medium text-ink">Categories</p>
          <ul className="mt-4 grid gap-x-6 gap-y-2.5">
            {categoryLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-[14px] text-muted transition-colors hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <Column title="Resources" links={resourceLinks} />
        <Column title="Company" links={companyLinks} />
        <Column title="Legal" links={legalLinks} />
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-6 text-[13px] text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Not affiliated with YouTube, Google or any other platform we build tools for.
          </p>
          <p>
            {liveTools.length} free tools · {activeCategories.length} categories
          </p>
        </div>
      </div>
    </footer>
  );
}
