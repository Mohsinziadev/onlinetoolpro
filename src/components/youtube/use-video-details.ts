"use client";

import { useState } from "react";
import { apiGet } from "@/lib/client-api";
import { parseVideoInput } from "@/lib/youtube/parse";
import type { DataSource, VideoDetails } from "@/lib/youtube/types";

/** Shared fetch state for tools that look up one video's full public details. */
export function useVideoDetails() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [invalid, setInvalid] = useState(false);
  const [data, setData] = useState<{ video: VideoDetails; source: DataSource } | null>(null);

  async function lookup(value: string) {
    setError(null);
    setData(null);
    const parsed = parseVideoInput(value);
    setInvalid(!parsed);
    if (!parsed) return;
    setLoading(true);
    try {
      const res = await apiGet<VideoDetails>(`/api/youtube/video-details?v=${encodeURIComponent(parsed.id)}`);
      setData({ video: res.data, source: res.source });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, invalid, data, lookup };
}
