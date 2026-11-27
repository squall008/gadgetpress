'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const DEDUPE_MS = 10 * 60 * 1000; // 10 minutes per path per browser tab session

function isTrackablePath(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname === '/' || pathname === '/ranking' || pathname === '/about') return true;
  return /^\/articles\/[1-9]\d{0,8}$/.test(pathname);
}

export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isTrackablePath(pathname)) return;

    const storageKey = `gp_pv:${pathname}`;
    try {
      const lastRecorded = Number(window.sessionStorage.getItem(storageKey) || '0');
      if (Date.now() - lastRecorded < DEDUPE_MS) {
        return;
      }
      window.sessionStorage.setItem(storageKey, String(Date.now()));
    } catch {
      // sessionStorage may be blocked in strict private mode; continue without client dedupe
    }

    fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {
      // Never surface analytics errors to readers
    });
  }, [pathname]);

  return null;
}
