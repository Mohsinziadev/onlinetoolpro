"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ImageIcon, RefreshCw, X } from "lucide-react";
import { UploadDropzone } from "@/components/tool/upload-dropzone";
import { ErrorState } from "@/components/tool/states";
import { ToolIcon } from "@/components/tool-icon";
import { useThumbnail } from "@/lib/image/store";
import type { LoadedImage } from "@/lib/image/load";
import { ACCEPTED_TYPES } from "@/lib/image/load";
import { getTool, toolHref } from "@/lib/catalog/lite";
import { cn, formatBytes } from "@/lib/utils";

const THUMB_TOOLS = ["thumbnail-analyzer", "thumbnail-preview", "thumbnail-readability", "thumbnail-safe-zone"];

/**
 * Shared frame for the four thumbnail tools: empty state with dropzone,
 * then a file bar + tool-specific content once an image is loaded.
 */
export function ThumbnailWorkspace({
  children,
  emptyTitle,
}: {
  children: (image: LoadedImage) => ReactNode;
  emptyTitle?: string;
}) {
  const { image, loading, error, load, clear } = useThumbnail();
  const pathname = usePathname();

  if (!image) {
    return (
      <div className="space-y-4">
        <UploadDropzone onFile={load} loading={loading} title={emptyTitle} />
        {error ? <ErrorState title="We couldn't use that file" description={error} /> : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-2 pl-3 shadow-card sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
          <img src={image.url} alt="" className="h-9 w-16 shrink-0 rounded-md object-cover" />
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-medium text-ink">{image.file.name}</p>
            <p className="num text-xs text-muted">
              {image.width} × {image.height} · {formatBytes(image.file.size)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-[12.5px] font-medium text-ink transition-colors hover:bg-bg-subtle focus-within:ring-4 focus-within:ring-ink/5">
            <RefreshCw aria-hidden className="h-3.5 w-3.5" />
            Replace
            <input
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) load(f);
                e.target.value = "";
              }}
            />
          </label>
          <button
            type="button"
            onClick={clear}
            className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-medium text-muted transition-colors hover:bg-bg-subtle hover:text-ink"
          >
            <X aria-hidden className="h-3.5 w-3.5" />
            Clear
          </button>
        </div>
      </div>

      {error ? <ErrorState title="We couldn't use that file" description={`${error} The previous image is still loaded.`} /> : null}

      <div key={image.url} className="animate-fade-in">
        {children(image)}
      </div>

      <nav aria-label="Continue with this thumbnail" className="rounded-2xl border border-line bg-bg-subtle p-4">
        <p className="flex items-center gap-2 text-[13px] text-muted">
          <ImageIcon aria-hidden className="h-4 w-4" />
          Your image stays loaded — continue in another thumbnail tool:
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {THUMB_TOOLS.map((slug) => {
            const t = getTool("youtube", slug);
            if (!t) return null;
            const current = pathname === toolHref(t);
            return (
              <Link
                key={slug}
                href={toolHref(t)}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12.5px] font-medium transition-colors",
                  current
                    ? "border-cta bg-cta text-cta-ink"
                    : "border-line bg-surface text-ink hover:border-line-strong",
                )}
              >
                <ToolIcon name={t.icon} className="h-3.5 w-3.5" />
                {t.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
