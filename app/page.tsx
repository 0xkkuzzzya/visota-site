"use client";

import { ChangeEvent, CSSProperties, FormEvent, KeyboardEvent, PointerEvent, useCallback, useEffect, useRef, useState } from "react";

const contactPhone = {
  label: "8 900 208 21 01",
  href: "tel:+79002082101",
};

const heroSlides = ["/assets/ceiling-1.jpg", "/assets/ceiling-2.jpg"];

const plans = [
  {
    name: "Стандарт",
    subtitle: "Приятное решение\nдля любых помещений",
    price: "750",
    features: ["Плёнка ПВХ матовая или сатиновая", "Ширина полотна до 3,6 м", "Обычный профиль", "Установка по периметру комнаты", "Обход труб и коммуникаций", "Гарантия на монтаж 15 лет"],
  },
  {
    name: "Премиум",
    subtitle: "Оптимальное сочетание\nкачества и эстетики",
    price: "850",
    featured: true,
    features: ["Плёнка ПВХ матовая или сатиновая", "Ширина полотна до 3,6 м",  "Теневой и парящий профиль", "Трековые системы и светодиодные ленты","Установка по периметру комнаты", "Обход сложных элементов", "Гарантия на монтаж 15 лет"],
  },
  {
    name: "Широкие",
    subtitle: "Для просторных\nпомещений без швов",
    price: "900",
    features: ["Плёнка ПВХ матовая или сатиновая", "Ширина полотна до 6,0 м", "Теневой и парящий профиль","Установка по периметру комнаты", "Минимум швов на потолке", "Гарантия на монтаж 15 лет"],
  },
];

const projects = [
  { image: "/assets/1%20(1).jpg", address: "Ландау 2", title: "Монтаж полотна в санузел с комбинированным профилем", price: "38 990 ₽", area: "22.5м²", finish: "Белый матовый" },
  { image: "/assets/1%20(2).jpg", address: "Лодыгина 15", title: "Монтаж двухуровневого потолка в кухню с обходом труб", price: "27 450 ₽", area: "16м²", finish: "Белый матовый" },
  { image: "/assets/1%20(3).jpg", address: "Радищева 43", title: "Монтаж полотна на кухне с трековой системой освещения", price: "19 850 ₽", area: "12м²", finish: "Белый матовый" },
  { image: "/assets/1%20(4).jpg", address: "Свердлова, 32", title: "Монтаж полотна в спальню с двойными светильниками и трековой системой освещения", price: "21 900 ₽", area: "14м²", finish: "Белый матовый" },
  { image: "/assets/1%20(5).jpg", address: "Ткачей, 21", title: "Монтаж полотна в коридор с теневым профилем", price: "31 500 ₽", area: "19м²", finish: "Белый матовый" },
  { image: "/assets/1%20(6).jpg", address: "Коттеджный поселок Урман", title: "Монтаж полотна в гостинную с подвесной люстрой и люком", price: "31 500 ₽", area: "19м²", finish: "Белый матовый" },
];

const reviews = [
  { name: "Ирина С.", stars: 5, text: "Заказывали потолки во всей квартире. Всё сделали быстро и аккуратно. Очень довольны!", meta: "18 июля 2025  •  Квартира 65 м²" },
  { name: "Алексей К.", stars: 5, text: "Отличная команда, помогли с выбором, установили в срок. Потолки идеально ровные!", meta: "9 августа 2025  •  Квартира 42 м²" },
  { name: "Мария Л.", stars: 4, text: "Очень понравилось качество работы и отношение к клиентам. Рекомендую!", meta: "27 сентября 2025  •  Спальня 18 м²" },
  { name: "Дмитрий П.", stars: 5, text: "Профессионалы своего дела. Чистый монтаж, без пыли и мусора. Спасибо!", meta: "14 октября 2025  •  Кухня 12 м²" },
  { name: "Екатерина Г.", stars: 4, text: "Сделали красивое освещение на кухне. Получилось даже лучше, чем мы ожидали!", meta: "6 декабря 2025  •  Кухня 14 м²" },
  { name: "Ольга В.", stars: 5, text: "Спасибо за идеальные потолки! Всё ровно, аккуратно и в срок. Будем рекомендовать друзьям.", meta: "22 января 2026  •  Гостиная 24 м²" },
  { name: "Сергей М.", stars: 4, text: "Приехали на замер в тот же день, на следующий день уже был монтаж. Всё быстро и чётко!", meta: "11 февраля 2026  •  Коридор 9 м²" },
  { name: "Наталья Т.", stars: 5, text: "Очень внимательные мастера, учли все наши пожелания. Качество на высоте!", meta: "19 марта 2026  •  Детская 16 м²" },
  { name: "Владимир Н.", stars: 4, text: "Делали потолки в новостройке. Результатом остались довольны. Цена адекватная.", meta: "30 апреля 2026  •  Квартира 70 м²" },
  { name: "Юлия С.", stars: 5, text: "Красиво, стильно и практично. Лёгкий уход и никаких проблем. Спасибо!", meta: "8 июня 2026  •  Ванная 6 м²" },
];

const visualSteps = [
  ["1", "▣", "Делаем фото помещения"],
  ["2", "◉", "Подбираем светильники, линии и ниши"],
  ["3", "✦", "Показываем готовую визуализацию за пару минут"],
];

function formatRussianPhone(input: string) {
  const digits = input.replace(/\D/g, "").slice(0, 11);
  const nationalNumber = digits.startsWith("7") || digits.startsWith("8")
    ? digits.slice(1, 11)
    : digits.slice(0, 10);

  if (!nationalNumber) return "+7 ";

  let result = `+7 (${nationalNumber.slice(0, 3)}`;
  if (nationalNumber.length >= 3) result += ")";
  if (nationalNumber.length > 3) result += ` ${nationalNumber.slice(3, 6)}`;
  if (nationalNumber.length > 6) result += `-${nationalNumber.slice(6, 8)}`;
  if (nationalNumber.length > 8) result += `-${nationalNumber.slice(8, 10)}`;
  return result;
}

function PhoneInput({ id, label }: { id: string; label: string }) {
  const [value, setValue] = useState("+7 ");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const form = inputRef.current?.form;
    const resetMask = () => setValue("+7 ");
    form?.addEventListener("reset", resetMask);
    return () => form?.removeEventListener("reset", resetMask);
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(formatRussianPhone(event.currentTarget.value));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key.length === 1 && !/^\d$/.test(event.key)) event.preventDefault();
  };

  return (
    <input
      ref={inputRef}
      id={id}
      name="phone"
      type="tel"
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      inputMode="numeric"
      autoComplete="tel"
      aria-label={label}
      pattern="\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}"
      title="Введите номер в формате +7 (999) 123-45-67"
      maxLength={18}
      required
    />
  );
}

function PrivacyConsent() {
  return (
    <label className="consent-control">
      <input type="checkbox" name="privacyConsent" value="granted" required />
      <span>
        Я даю согласие на обработку указанных имени и телефона для обработки заявки и обратной связи в соответствии с <a href="/privacy" target="_blank" rel="noreferrer">Политикой конфиденциальности</a>.
      </span>
    </label>
  );
}

type LeadStatus = "idle" | "submitting" | "success" | "error";

const leadStatusText: Record<Exclude<LeadStatus, "idle" | "submitting">, string> = {
  success: "Заявка отправлена. Мы скоро свяжемся с вами.",
  error: "Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.",
};

async function submitLead(
  event: FormEvent<HTMLFormElement>,
  setStatus: (status: LeadStatus) => void,
  tariff: string | null = null,
) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);

  setStatus("submitting");

  try {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(data.get("name") ?? "").trim(),
        phone: String(data.get("phone") ?? "").trim(),
        tariff,
      }),
    });

    if (!response.ok) throw new Error("Lead submission failed");
    form.reset();
    setStatus("success");
  } catch {
    setStatus("error");
  }
}

export default function Home() {
  const [heroSlide, setHeroSlide] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTariff, setSelectedTariff] = useState<string | null>(null);
  const [heroLeadStatus, setHeroLeadStatus] = useState<LeadStatus>("idle");
  const [footerLeadStatus, setFooterLeadStatus] = useState<LeadStatus>("idle");
  const [workPosition, setWorkPosition] = useState(projects.length);
  const [workStep, setWorkStep] = useState(0);
  const [workDragOffset, setWorkDragOffset] = useState(0);
  const [worksAnimated, setWorksAnimated] = useState(true);
  const [split, setSplit] = useState(48);
  const worksViewportRef = useRef<HTMLDivElement>(null);
  const worksTrackRef = useRef<HTMLDivElement>(null);
  const workSwipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const workSwipeAxisRef = useRef<"pending" | "horizontal" | "vertical">("pending");
  const comparisonRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const closeModal = useCallback(() => setModalOpen(false), []);
  const openModal = useCallback((tariff: string | null = null) => {
    setSelectedTariff(tariff);
    setModalOpen(true);
  }, []);

  useEffect(() => {
    const clearHash = () => {
      if (window.location.hash) window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    };
    clearHash();
    window.addEventListener("hashchange", clearHash);
    return () => window.removeEventListener("hashchange", clearHash);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(
      () => setHeroSlide((current) => (current + 1) % heroSlides.length),
      5000,
    );
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const measure = () => {
      const firstCard = worksTrackRef.current?.querySelector<HTMLElement>(".work-card");
      const track = worksTrackRef.current;
      if (!firstCard || !track) return;
      const gap = Number.parseFloat(window.getComputedStyle(track).columnGap || "0");
      setWorksAnimated(false);
      setWorkStep(firstCard.getBoundingClientRect().width + gap);
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => setWorksAnimated(true)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (worksViewportRef.current) observer.observe(worksViewportRef.current);
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const moveWorks = (direction: -1 | 1) => setWorkPosition((current) => current + direction);

  const resetWorks = () => {
    if (workPosition < projects.length || workPosition >= projects.length * 2) {
      const normalizedPosition = projects.length + (((workPosition % projects.length) + projects.length) % projects.length);
      setWorksAnimated(false);
      setWorkPosition(normalizedPosition);
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => setWorksAnimated(true)));
    }
  };

  const startWorksSwipe = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch" || !event.isPrimary) return;
    workSwipeStartRef.current = { x: event.clientX, y: event.clientY };
    workSwipeAxisRef.current = "pending";
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveWorksSwipe = (event: PointerEvent<HTMLDivElement>) => {
    const start = workSwipeStartRef.current;
    if (!start || event.pointerType !== "touch") return;
    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;

    if (workSwipeAxisRef.current === "pending" && Math.max(Math.abs(deltaX), Math.abs(deltaY)) > 8) {
      workSwipeAxisRef.current = Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";
    }
    if (workSwipeAxisRef.current !== "horizontal") return;

    setWorksAnimated(false);
    const dragLimit = Math.max(80, workStep * 0.58);
    setWorkDragOffset(Math.max(-dragLimit, Math.min(dragLimit, deltaX)));
  };

  const finishWorksSwipe = (event: PointerEvent<HTMLDivElement>, cancelled = false) => {
    const start = workSwipeStartRef.current;
    if (!start || event.pointerType !== "touch") return;
    const deltaX = event.clientX - start.x;
    const viewportWidth = worksViewportRef.current?.getBoundingClientRect().width ?? 375;
    const swipeThreshold = Math.min(80, Math.max(44, viewportWidth * 0.12));
    const shouldMove = !cancelled && workSwipeAxisRef.current === "horizontal" && Math.abs(deltaX) >= swipeThreshold;

    setWorksAnimated(true);
    setWorkDragOffset(0);
    if (shouldMove) moveWorks(deltaX < 0 ? 1 : -1);
    workSwipeStartRef.current = null;
    workSwipeAxisRef.current = "pending";
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const updateSplit = (clientX: number) => {
    const rect = comparisonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    setSplit(Math.min(97, Math.max(3, next)));
  };

  const startComparisonDrag = (event: PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateSplit(event.clientX);
  };

  const moveComparisonDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (draggingRef.current) updateSplit(event.clientX);
  };

  const stopComparisonDrag = (event: PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const changeSplitByKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") { event.preventDefault(); setSplit((value) => Math.max(3, value - 3)); }
    if (event.key === "ArrowRight") { event.preventDefault(); setSplit((value) => Math.min(97, value + 3)); }
    if (event.key === "Home") { event.preventDefault(); setSplit(3); }
    if (event.key === "End") { event.preventDefault(); setSplit(97); }
  };

  const activeWork = ((workPosition % projects.length) + projects.length) % projects.length;
  const workLoop = [...projects, ...projects, ...projects];

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <button className="logo-button" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="К началу страницы">
            <img src="/assets/header-logo.svg" alt="Высота — натяжные потолки" />
          </button>
          <div className="header-detail header-address"><span className="header-icon header-icon--pin" aria-hidden="true" /><span>Сыромолотова 28а,<br />офис 3, вход с торца</span></div>
          <div className="header-divider" />
          <div className="header-detail header-hours"><span className="header-icon header-icon--clock" aria-hidden="true" /><span>Пн–Сб<br />с 9:00 до 20:00</span></div>
          <div className="header-phones">
            <a href={contactPhone.href}>{contactPhone.label}</a>
          </div>
          <button className="primary-button header-call" type="button" onClick={() => openModal()}><span>☎</span> Заказать звонок</button>
        </div>
      </header>

      <main>
        <section className="hero-section" id="hero">
          <div className="hero-visual" aria-label="Примеры натяжных потолков">
            <div className="hero-track is-animated" style={{ transform: `translateX(-${heroSlide * 50}%)` }}>
              {heroSlides.map((src, index) => <img src={src} alt="" key={`${src}-${index}`} />)}
            </div>
          </div>
          <div className="hero-copy">
            <div className="hero-copy-inner">
              <h1>Натяжные потолки<br /><span>в Екатеринбурге</span></h1>
              <p className="hero-lead">Производство и комплектующие.<br />Бесплатный замер. Монтаж под ключ.</p>
              <form className="hero-form" onSubmit={(event) => submitLead(event, setHeroLeadStatus)}>
                <div className="form-row">
                  <label><span className="sr-only">Ваше имя</span><input name="name" placeholder="Ваше имя" autoComplete="name" minLength={2} maxLength={100} required /></label>
                  <label htmlFor="hero-phone"><span className="sr-only">Ваш телефон</span><PhoneInput id="hero-phone" label="Ваш телефон" /></label>
                  <button className="primary-button" type="submit" disabled={heroLeadStatus === "submitting"}>{heroLeadStatus === "submitting" ? "Отправляем…" : "Заказать"}</button>
                </div>
                <PrivacyConsent />
                <LeadStatusMessage status={heroLeadStatus} />
              </form>
              <div className="hero-benefits">
                <div><span className="benefit-icon">⌁</span><p><strong>Бесплатный замер</strong><br />и консультация</p></div>
                <div><span className="benefit-icon">▣</span><p><strong>Выезд в день</strong><br />или на следующий день</p></div>
                <div><span className="benefit-icon">15</span><p><strong>Гарантия</strong><br />15 лет</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="pricing-section page-section" id="pricing">
          <div className="section-shell">
            <SectionHeading dark="Цены на" blue="натяжные потолки" />
            <p className="section-subtitle">Стоимость за 1 м² с установкой. Подберём решение под ваш бюджет и задачи.</p>
            <div className="pricing-grid">
              {plans.map((plan) => (
                <article className={`plan-card${plan.featured ? " featured" : ""}`} key={plan.name}>
                  {plan.featured && <span className="popular-badge">Выбор клиентов</span>}
                  <h3>{plan.name}</h3>
                  <p className="plan-subtitle">{plan.subtitle}</p>
                  <p className="plan-price"><strong>{plan.price}</strong> ₽/м²</p>
                  <div className="plan-rule" />
                  <ul className="plan-list">
                    {plan.features.map((feature) => <li key={feature}><span>✓</span>{feature}</li>)}
                  </ul>
                  <button className={`plan-button${plan.featured ? " primary-button" : ""}`} type="button" onClick={() => openModal(plan.name)}>Выбрать тариф</button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="works-section page-section" id="works">
          <div className="section-shell works-heading"><SectionHeading dark="Примеры" blue="установленных потолков" /></div>
          <div
            className="works-viewport"
            ref={worksViewportRef}
            onPointerDown={startWorksSwipe}
            onPointerMove={moveWorksSwipe}
            onPointerUp={(event) => finishWorksSwipe(event)}
            onPointerCancel={(event) => finishWorksSwipe(event, true)}
          >
            <div
              className={`works-track${worksAnimated ? " is-animated" : ""}`}
              ref={worksTrackRef}
              style={{ transform: `translate3d(${(-workPosition * workStep) + workDragOffset}px, 0, 0)` }}
              onTransitionEnd={resetWorks}
            >
              {workLoop.map((project, index) => <ProjectCard project={project} key={`${project.title}-${index}`} />)}
            </div>
          </div>
          <div className="works-controls" aria-label="Навигация по примерам">
            <button type="button" onClick={() => moveWorks(-1)} aria-label="Предыдущий пример">←</button>
            <div className="works-dots" aria-hidden="true">
              {projects.map((project, index) => <span className={activeWork === index ? "active" : ""} key={project.title} />)}
            </div>
            <button type="button" onClick={() => moveWorks(1)} aria-label="Следующий пример">→</button>
          </div>
        </section>

        <section className="reviews-section page-section" id="reviews">
          <div className="section-shell reviews-heading">
            <SectionHeading dark="Отзывы" blue="клиентов" />
            <p className="section-subtitle">Честные отзывы от тех, кто уже доверил нам свой потолок</p>
          </div>
          <ReviewMarquee reviews={reviews.slice(0, 5)} direction="right" />
          <ReviewMarquee reviews={reviews.slice(5)} direction="left" />
        </section>

        <section className="visualization-section page-section" id="visualization">
          <div className="visualization-orbit orbit-one" />
          <div className="visualization-orbit orbit-two" />
          <div className="section-shell visualization-grid">
            <div className="visual-copy">
              <SectionHeading dark="Визуализация потолка" blue="прямо на замере" stacked />
              <p className="visual-lead">Вы увидите, как будет выглядеть потолок<br className="desktop-break" /> до подписания договора. Бесплатно и всего за пару минут.</p>
              <div className="visual-steps">
                {visualSteps.map(([number, icon, label]) => (
                  <div className="visual-step" key={number}><span className="step-number">{number}</span><span className="step-icon">{icon}</span><span>{label}</span></div>
                ))}
              </div>
              <div className="visual-benefits">
                <div><span>♢</span><p><strong>Бесплатно</strong><br />для вас</p></div>
                <div><span>◷</span><p><strong>За 2–3 минуты</strong><br />быстро и удобно</p></div>
                <div><span>▤</span><p><strong>До подписания</strong><br />договора</p></div>
              </div>
              <button className="primary-button visual-cta" type="button" onClick={() => openModal()}>▣&nbsp;&nbsp; Записаться на бесплатный замер</button>
            </div>

            <div className="compare-column">
              <div
                className="comparison-stage"
                ref={comparisonRef}
                role="slider"
                tabIndex={0}
                aria-label="Сравнение потолка до и после"
                aria-valuemin={3}
                aria-valuemax={97}
                aria-valuenow={Math.round(split)}
                aria-valuetext={`${Math.round(split)}% «До», ${100 - Math.round(split)}% «После»`}
                onPointerDown={startComparisonDrag}
                onPointerMove={moveComparisonDrag}
                onPointerUp={stopComparisonDrag}
                onPointerCancel={stopComparisonDrag}
                onKeyDown={changeSplitByKeyboard}
                style={{ "--split": `${split}%` } as CSSProperties}
              >
                <img className="compare-image before-image" src="/assets/ceiling-2-before.jpg" alt="Помещение до установки натяжного потолка" draggable={false} />
                <div className="after-layer" style={{ clipPath: `inset(0 0 0 ${split}%)` }}>
                  <img className="compare-image" src="/assets/ceiling-2.jpg" alt="" draggable={false} />
                </div>
                <span className="compare-label before-label">До</span>
                <span className="compare-label after-label">После</span>
                <span className="compare-divider" aria-hidden="true" />
                <span className="compare-handle" aria-hidden="true">‹ ›</span>
              </div>
              <div className="lighting-options" aria-label="Варианты освещения">
                <div><img src="/assets/ceiling-2.jpg" alt="" /><span>Световые<br />линии</span></div>
                <div><img src="/assets/ceiling-2.jpg" alt="" /><span>Трековое<br />освещение</span></div>
                <div><img src="/assets/ceiling-1.jpg" alt="" /><span>Ниша под<br />карниз</span></div>
                <div><img src="/assets/ceiling-1.jpg" alt="" /><span>Точечные<br />светильники</span></div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact">
        <div className="footer-lead-wrap">
          <form className="footer-lead section-shell" onSubmit={(event) => submitLead(event, setFooterLeadStatus)}>
            <div className="footer-lead-copy"><h2>Остались вопросы?</h2><p>Оставьте заявку и мы свяжемся с вами<br />удобным способом</p></div>
            <label><span className="sr-only">Ваше имя</span><input name="name" placeholder="Ваше имя" autoComplete="name" minLength={2} maxLength={100} required /></label>
            <label htmlFor="footer-phone"><span className="sr-only">Телефон</span><PhoneInput id="footer-phone" label="Телефон" /></label>
            <button className="primary-button" type="submit" disabled={footerLeadStatus === "submitting"}>{footerLeadStatus === "submitting" ? "Отправляем…" : "Отправить заявку"}</button>
            <PrivacyConsent />
            <LeadStatusMessage status={footerLeadStatus} />
          </form>
        </div>
        <div className="footer-dark">
          <div className="section-shell footer-grid">
            <div className="footer-brand">
              <img src="/assets/logo-original.png" alt="Высота" />
              <p>Качественные натяжные потолки<br />с гарантией до 15 лет.<br />Замер бесплатно. Заключаем договор.</p>
              <div className="socials" aria-label="Социальные сети"><span>VK</span><span>◎</span><span>◉</span></div>
            </div>
            <div className="footer-column"><h3>Услуги</h3><span>Матовые потолки</span><span>Глянцевые потолки</span><span>Сатиновые потолки</span><span>Световые линии</span><span>Теневые потолки</span><span>Двухуровневые потолки</span><span>Фотопечать на потолках</span></div>
            <div className="footer-column"><h3>Компания</h3><span>О нас</span><button type="button" onClick={() => scrollToSection("works")}>Наши работы</button><button type="button" onClick={() => scrollToSection("reviews")}>Отзывы</button><span>Гарантия</span><span>Доставка и оплата</span><button type="button" onClick={() => scrollToSection("contact")}>Контакты</button></div>
            <div className="footer-column footer-contacts"><h3>Контакты</h3><p><b>⌖</b><span>Сыромолотова 28а,<br />офис 3, вход с торца</span></p><p><b>◷</b><span>Пн–Сб с 9:00 до 20:00</span></p><p><b>☎</b><span><a href={contactPhone.href}>{contactPhone.label}</a></span></p></div>
            <div className="footer-map-column"><h3>Мы на карте</h3><div className="map-preview" aria-label="Сыромолотова 28а на карте"><span>●</span></div></div>
          </div>
          <div className="section-shell footer-bottom"><span>© 2024 Высота. Все права защищены</span><a href="/privacy">Политика конфиденциальности</a></div>
        </div>
      </footer>

      <OrderModal key={`${modalOpen}-${selectedTariff ?? ""}`} open={modalOpen} onClose={closeModal} tariff={selectedTariff} />
    </>
  );
}

function SectionHeading({ dark, blue, stacked = false }: { dark: string; blue: string; stacked?: boolean }) {
  return <h2 className={`section-heading${stacked ? " stacked" : ""}`}><span>{dark}</span> <em>{blue}</em></h2>;
}

function ProjectCard({ project }: { project: (typeof projects)[number] }) {
  return (
    <article className="work-card">
      <img className="work-image" src={project.image} alt={project.title} />
      <div className="work-card-content">
        <h3>{project.title}</h3>
        <div className="work-price-row"><strong>{project.price}</strong><span>⌖ {project.address}</span></div>
        <div className="work-rule" />
        <div className="work-details"><span>⌗ {project.area}</span><span>□ {project.finish}</span><span>◷ 1 день</span></div>
      </div>
    </article>
  );
}

function ReviewCard({ review }: { review: (typeof reviews)[number] }) {
  return (
    <article className="review-card">
      <div className="review-stars" aria-label={`${review.stars} из 5`}>
        {Array.from({ length: 5 }, (_, index) => <span className={index < review.stars ? "filled" : ""} key={index}>★</span>)}
      </div>
      <h3>{review.name}</h3>
      <p>{review.text}</p>
      <small>{review.meta}</small>
    </article>
  );
}

function ReviewMarquee({ reviews: rowReviews, direction }: { reviews: typeof reviews; direction: "left" | "right" }) {
  return (
    <div className={`review-row ${direction}`}>
      <div className="review-track">
        <div className="review-set">{rowReviews.map((review) => <ReviewCard review={review} key={review.name} />)}</div>
        <div className="review-set" aria-hidden="true">{rowReviews.map((review) => <ReviewCard review={review} key={`${review.name}-copy`} />)}</div>
      </div>
    </div>
  );
}

function LeadStatusMessage({ status }: { status: LeadStatus }) {
  if (status === "idle" || status === "submitting") return null;
  return <p className={`form-status ${status}`} role="status" aria-live="polite">{leadStatusText[status]}</p>;
}

function OrderModal({ open, onClose, tariff }: { open: boolean; onClose: () => void; tariff: string | null }) {
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [leadStatus, setLeadStatus] = useState<LeadStatus>("idle");

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => firstFieldRef.current?.focus(), 50);
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") { onClose(); return; }
      if (event.key !== "Tab") return;
      const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])") ?? []);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="order-modal" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Закрыть">×</button>
        <span className="modal-eyebrow">Бесплатный замер</span>
        <h2 id="modal-title">Закажите выезд замерщика</h2>
        <p>Оставьте контакты — согласуем удобное время и бесплатно подготовим точный расчёт.</p>
        {tariff && <p className="modal-tariff">Выбранный тариф: <strong>{tariff}</strong></p>}
        <form onSubmit={(event) => submitLead(event, setLeadStatus, tariff)}>
          <label><span className="sr-only">Ваше имя</span><input ref={firstFieldRef} name="name" placeholder="Ваше имя" autoComplete="name" minLength={2} maxLength={100} required /></label>
          <label htmlFor="modal-phone"><span className="sr-only">Ваш телефон</span><PhoneInput id="modal-phone" label="Ваш телефон" /></label>
          <PrivacyConsent />
          <button className="primary-button" type="submit" disabled={leadStatus === "submitting"}>{leadStatus === "submitting" ? "Отправляем…" : "Заказать замерщика"}</button>
        </form>
        <LeadStatusMessage status={leadStatus} />
        <div className="modal-contacts"><span>Или позвоните нам:</span><a href={contactPhone.href}>{contactPhone.label}</a></div>
      </div>
    </div>
  );
}
