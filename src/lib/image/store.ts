"use client";

import { useCallback, useSyncExternalStore } from "react";
import { ImageValidationError, loadImage, type LoadedImage } from "@/lib/image/load";

/**
 * In-memory store for the current thumbnail. Lives for the lifetime of the
 * browser tab, so an image dropped into one thumbnail tool is available in the
 * others after client-side navigation. Nothing is persisted or uploaded.
 */
type State = { image: LoadedImage | null; loading: boolean; error: string | null };

let state: State = { image: null, loading: false, error: null };
const listeners = new Set<() => void>();
const SERVER_STATE: State = { image: null, loading: false, error: null };

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function setThumbnailFile(file: File): Promise<void> {
  set({ loading: true, error: null });
  try {
    const loaded = await loadImage(file);
    const previous = state.image;
    set({ image: loaded, loading: false });
    if (previous) {
      URL.revokeObjectURL(previous.url);
      previous.bitmap.close();
    }
  } catch (err) {
    const message =
      err instanceof ImageValidationError ? err.message : "Something went wrong while reading this image.";
    set({ loading: false, error: message });
  }
}

export function clearThumbnail(): void {
  const previous = state.image;
  set({ image: null, error: null, loading: false });
  if (previous) {
    URL.revokeObjectURL(previous.url);
    previous.bitmap.close();
  }
}

export function useThumbnail() {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => state,
    () => SERVER_STATE,
  );
  const load = useCallback((file: File) => setThumbnailFile(file), []);
  return { ...snapshot, load, clear: clearThumbnail };
}
