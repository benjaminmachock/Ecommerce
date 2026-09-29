"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { COLORS, Tee } from "@/lib/artwork";

export type Slide = {
  eyebrow: string;
  title: string;
  body: string;
  cta: { href: string; label: string };
  artwork: string;
  color: string;
  bg: string;
};

export function HeroCarousel({ slides }: { slides: Slide[] }) {
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((i: number) => {
    const el = track.current;
    if (!el) return;
    const n = (i + slides.length) % slides.length;
    el.scrollTo({ left: n * el.clientWidth, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [slides.length]);

  // Keep the active dot in sync with native scroll-snap (swipe, keyboard, buttons).
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => setIndex(Math.round(el.scrollLeft / el.clientWidth));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (paused || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => go(index + 1), 6000);
    return () => clearInterval(t);
  }, [paused, index, go]);

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label="Featured collections"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <ul className="hero-track" ref={track} tabIndex={0} aria-live={paused ? "polite" : "off"}>
        {slides.map((s, i) => (
          <li
            key={s.title}
            className="hero-slide"
            style={{ "--slide-bg": s.bg, "--slide-tee": COLORS[s.color] } as React.CSSProperties}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
            data-active={i === index}
          >
            <div className="blob blob-a" aria-hidden="true" />
            <div className="blob blob-b" aria-hidden="true" />
            <div className="wrap hero-inner">
              <div className="hero-copy">
                <p className="eyebrow">{s.eyebrow}</p>
                <h1 className="hero-title">{s.title}</h1>
                <p className="hero-body">{s.body}</p>
                <Link href={s.cta.href} className="btn btn-dark" tabIndex={i === index ? 0 : -1}>{s.cta.label} <span aria-hidden="true">→</span></Link>
              </div>
              <div className="hero-art">
                <Tee artwork={s.artwork} color={s.color} className="hero-tee" label={`${s.title} shirt`} />
                <svg className="hero-confetti" viewBox="0 0 200 200" aria-hidden="true">
                  <circle cx="30" cy="40" r="7" /><rect x="160" y="30" width="14" height="14" rx="3" /><path d="M20 150l14 14M34 150l-14 14" /><circle cx="170" cy="150" r="5" /><path d="M100 10l6 12h-12z" />
                </svg>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="hero-controls">
        <button className="ctl" onClick={() => go(index - 1)} aria-label="Previous slide">←</button>
        <div className="dots" role="group" aria-label="Choose slide">
          {slides.map((s, i) => (
            <button key={s.title} className="dot" aria-label={`Go to slide ${i + 1}`} aria-current={i === index} onClick={() => go(i)} />
          ))}
        </div>
        <button className="ctl" onClick={() => go(index + 1)} aria-label="Next slide">→</button>
      </div>
    </section>
  );
}
