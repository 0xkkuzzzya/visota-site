"use client";

import { useEffect, useState } from "react";

const YANDEX_METRIKA_ID = 111044986;
const NOTICE_STORAGE_KEY = "vysota-cookie-notice-v1";

type MetrikaFunction = {
  (...args: unknown[]): void;
  a?: unknown[][];
  l?: number;
};

declare global {
  interface Window {
    ym?: MetrikaFunction;
    __vysotaMetrikaInitialized?: boolean;
  }
}

function isNoticeAcknowledged() {
  try {
    return window.localStorage.getItem(NOTICE_STORAGE_KEY) === "acknowledged";
  } catch {
    return false;
  }
}

function saveNoticeAcknowledgement() {
  try {
    window.localStorage.setItem(NOTICE_STORAGE_KEY, "acknowledged");
  } catch {
    // The notice still closes for the current page when storage is unavailable.
  }
}

function initializeYandexMetrika() {
  if (window.__vysotaMetrikaInitialized) return;

  if (!window.ym) {
    const ym: MetrikaFunction = (...args: unknown[]) => {
      (ym.a ??= []).push(args);
    };
    ym.l = Date.now();
    window.ym = ym;
  }

  if (!document.querySelector("script[data-yandex-metrika]")) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://mc.yandex.ru/metrika/tag.js?id=${YANDEX_METRIKA_ID}`;
    script.dataset.yandexMetrika = String(YANDEX_METRIKA_ID);
    document.head.appendChild(script);
  }

  window.ym(YANDEX_METRIKA_ID, "init", {
    ssr: true,
    webvisor: true,
    clickmap: true,
    ecommerce: "dataLayer",
    referrer: document.referrer,
    url: window.location.href,
    accurateTrackBounce: true,
    trackLinks: true,
  });
  window.__vysotaMetrikaInitialized = true;
}

export function reachMetrikaGoal(goal: string) {
  if (typeof window === "undefined" || !window.__vysotaMetrikaInitialized) return;
  window.ym?.(YANDEX_METRIKA_ID, "reachGoal", goal);
}

export default function CookieConsent() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    initializeYandexMetrika();
    const frame = window.requestAnimationFrame(() => setIsOpen(!isNoticeAcknowledged()));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const acknowledgeNotice = () => {
    saveNoticeAcknowledgement();
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <aside className="cookie-banner" aria-label="Уведомление об использовании файлов cookie">
      <div className="cookie-banner__copy">
        <strong>На сайте используются cookie</strong>
        <p>
          Мы используем Яндекс Метрику и Вебвизор, чтобы понимать, как посетители пользуются сайтом, и улучшать его. Продолжая использовать сайт, вы соглашаетесь с обработкой cookie. <a href="/privacy#cookies">Подробнее</a>
        </p>
      </div>
      <div className="cookie-banner__actions">
        <button className="cookie-button cookie-button--primary" type="button" onClick={acknowledgeNotice}>Понятно</button>
      </div>
    </aside>
  );
}
