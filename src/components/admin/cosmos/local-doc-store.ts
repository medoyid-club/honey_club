"use client";

import { useSyncExternalStore } from "react";

type Listener = () => void;

export function createLocalDocStore<T>(storageKey: string, getDefault: () => T) {
  let cached: T | null = null;
  let serverSnapshot: T | undefined;
  const listeners = new Set<Listener>();

  function getSnapshot(): T {
    if (cached === null) {
      try {
        const raw = window.localStorage.getItem(storageKey);
        cached = raw ? (JSON.parse(raw) as T) : getDefault();
      } catch {
        cached = getDefault();
      }
    }
    return cached;
  }

  /** Стабильная ссылка для SSR — иначе useSyncExternalStore зацикливается. */
  function getServerSnapshot(): T {
    if (serverSnapshot === undefined) {
      serverSnapshot = getDefault();
    }
    return serverSnapshot;
  }

  function subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function persist(next: T): void {
    cached = next;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // localStorage недоступен
    }
    listeners.forEach((l) => l());
  }

  function set(updater: (current: T) => T): void {
    persist(updater(getSnapshot()));
  }

  function reset(): void {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
    cached = null;
    listeners.forEach((l) => l());
  }

  function useDoc(): [T, typeof set, typeof reset] {
    const doc = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    return [doc, set, reset];
  }

  return { useDoc, reset, getSnapshot };
}
