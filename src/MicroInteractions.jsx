import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';

gsap.registerPlugin(ScrollTrigger, MorphSVGPlugin);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function MicroInteractions() {
  return (
    <div className="page">
      <header className="hero">
        <span className="eyebrow">Interactions / Micro</span>
        <h1 className="title">Micro-interactions</h1>
        <p className="lede">
          Five small motion patterns built on GSAP. Each runs on hover, click, or
          scroll-into-view, falls back gracefully on touch and reduced-motion,
          and reuses the existing TR tokens. No new colors, no flash.
        </p>
      </header>

      <Demo num="01" name="Glass Shimmer Sweep" hint="Hover the card.">
        <GlassShimmer />
      </Demo>

      <Demo num="02" name="Liquid CTA Wash" hint="Hover the button.">
        <LiquidWash />
      </Demo>

      <Demo num="03" name="Icon Morph" hint="Click to save and unsave.">
        <IconMorph />
      </Demo>

      <Demo num="04" name="Stat Counter" hint="Scroll into view, or hit Replay.">
        <StatCounter />
      </Demo>

      <Demo num="05" name="Price Ticker" hint="Scroll into view, or hit Replay.">
        <PriceTicker />
      </Demo>

      <footer className="foot">
        <div>
          <em>GSAP 3.15</em> · ScrollTrigger · MorphSVGPlugin
        </div>
        <div>Respects <code>prefers-reduced-motion</code> and coarse pointers.</div>
      </footer>
    </div>
  );
}

function Demo({ num, name, hint, children }) {
  return (
    <section className="demo">
      <header className="demo-head">
        <span className="demo-num">{num}</span>
        <h2 className="demo-name">{name}</h2>
        <span className="demo-hint">{hint}</span>
      </header>
      <div className="demo-stage">{children}</div>
    </section>
  );
}

/* ============================================================
   01 · Glass Shimmer Sweep
   On mouseenter, a diagonal highlight strip pans across the
   card from -120% to 120% over 0.6s. Re-arms after each pass.
   ============================================================ */
function GlassShimmer() {
  const cardRef = useRef(null);
  const stripRef = useRef(null);
  const playing = useRef(false);

  useEffect(() => {
    const card = cardRef.current;
    const strip = stripRef.current;
    if (!card || !strip) return;

    gsap.set(strip, { xPercent: -120, opacity: 0 });

    const sweep = () => {
      if (playing.current || prefersReducedMotion()) return;
      playing.current = true;
      gsap.fromTo(
        strip,
        { xPercent: -120, opacity: 0 },
        {
          xPercent: 220,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.inOut',
          onComplete: () => {
            gsap.set(strip, { xPercent: -120, opacity: 0 });
            playing.current = false;
          },
        }
      );
    };

    card.addEventListener('mouseenter', sweep);
    card.addEventListener('click', sweep);
    return () => {
      card.removeEventListener('mouseenter', sweep);
      card.removeEventListener('click', sweep);
    };
  }, []);

  return (
    <div className="shimmer-card" ref={cardRef}>
      <div className="shimmer-strip" ref={stripRef} aria-hidden="true" />
      <div className="shimmer-badge">Course</div>
      <h3>SOAP Notes Mastery</h3>
      <p>3-hour course · 12 lessons · earn CE credit</p>
      <div className="shimmer-row">
        <span className="shimmer-price">$37</span>
        <span className="shimmer-cta">Enroll →</span>
      </div>
    </div>
  );
}

/* ============================================================
   02 · Liquid CTA Wash
   The CTA's gradient is 300% wide. On hover, GSAP eases
   backgroundPosition from 0% to 100%; on leave, it reverses.
   Paused tween + play()/reverse() = symmetrical, interruptible.
   ============================================================ */
function LiquidWash() {
  const btnRef = useRef(null);

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;

    gsap.set(btn, { backgroundPosition: '0% 50%' });

    if (prefersReducedMotion()) return;

    const tween = gsap.to(btn, {
      backgroundPosition: '100% 50%',
      duration: 0.8,
      ease: 'power2.inOut',
      paused: true,
    });

    const onEnter = () => tween.play();
    const onLeave = () => tween.reverse();

    btn.addEventListener('mouseenter', onEnter);
    btn.addEventListener('mouseleave', onLeave);
    return () => {
      btn.removeEventListener('mouseenter', onEnter);
      btn.removeEventListener('mouseleave', onLeave);
      tween.kill();
    };
  }, []);

  return (
    <button ref={btnRef} className="liquid-cta" type="button">
      Start the course
    </button>
  );
}

/* ============================================================
   03 · Icon Morph
   Bookmark path morphs into a checkmark on click using
   MorphSVGPlugin. Click again to morph back. Label crossfades
   between Save / Saved.
   ============================================================ */
const PATH_BOOKMARK = 'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z';
const PATH_CHECK = 'M20 6L9 17l-5-5';

function IconMorph() {
  const pathRef = useRef(null);
  const labelRef = useRef(null);
  const [saved, setSaved] = useState(false);

  const toggle = () => {
    const next = !saved;
    const targetPath = next ? PATH_CHECK : PATH_BOOKMARK;

    if (prefersReducedMotion()) {
      gsap.set(pathRef.current, { attr: { d: targetPath } });
    } else {
      gsap.to(pathRef.current, {
        morphSVG: { shape: targetPath, type: 'rotational' },
        duration: 0.45,
        ease: 'power2.inOut',
      });
      gsap.fromTo(
        labelRef.current,
        { y: 4, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.25, delay: 0.1, ease: 'power2.out' }
      );
    }
    setSaved(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`icon-morph-btn ${saved ? 'is-saved' : ''}`}
      aria-pressed={saved}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path ref={pathRef} d={PATH_BOOKMARK} />
      </svg>
      <span ref={labelRef}>{saved ? 'Saved' : 'Save'}</span>
    </button>
  );
}

/* ============================================================
   04 · Stat Counter
   Three stats. ScrollTrigger fires on top 85%. Each value
   tweens an internal counter object, and onUpdate writes the
   formatted number to the DOM. Replay button re-runs.
   ============================================================ */
const STATS = [
  { value: 1234, label: 'Therapists trained', suffix: '+' },
  { value: 98, label: 'Completion rate', suffix: '%' },
  { value: 4.9, label: 'Average rating', suffix: '★', decimals: 1 },
];

function StatCounter() {
  const wrapRef = useRef(null);
  const numRefs = useRef([]);

  const playOnce = () => {
    STATS.forEach((s, i) => {
      const el = numRefs.current[i];
      if (!el) return;

      if (prefersReducedMotion()) {
        const final = s.decimals ? s.value.toFixed(s.decimals) : s.value.toLocaleString();
        el.textContent = final + s.suffix;
        return;
      }

      const obj = { val: 0 };
      gsap.to(obj, {
        val: s.value,
        duration: 1.4,
        ease: 'power2.out',
        snap: s.decimals ? { val: 0.1 } : { val: 1 },
        onUpdate: () => {
          const num = s.decimals
            ? obj.val.toFixed(s.decimals)
            : Math.round(obj.val).toLocaleString();
          el.textContent = num + s.suffix;
        },
      });
    });
  };

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: wrapRef.current,
      start: 'top 85%',
      onEnter: playOnce,
    });
    return () => st.kill();
  }, []);

  return (
    <>
      <div className="stat-row" ref={wrapRef}>
        {STATS.map((s, i) => (
          <div className="stat-cell" key={s.label}>
            <div
              className="stat-value"
              ref={(el) => (numRefs.current[i] = el)}
            >
              0{s.suffix}
            </div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      <button type="button" className="replay-btn" onClick={playOnce}>
        ↻ Replay
      </button>
    </>
  );
}

/* ============================================================
   05 · Price Ticker
   Each digit is a vertical column [0..9]. The wrapper clips
   to one digit-height. GSAP rolls the column up to the target
   digit's row with a small per-digit stagger. ScrollTrigger
   fires on enter; Replay re-runs.
   ============================================================ */
const TICKER_DIGITS = [3, 7];
const DIGIT_HEIGHT = 64;

function PriceTicker() {
  const wrapRef = useRef(null);
  const colRefs = useRef([]);

  const playOnce = () => {
    TICKER_DIGITS.forEach((d, i) => {
      const el = colRefs.current[i];
      if (!el) return;

      if (prefersReducedMotion()) {
        gsap.set(el, { y: -d * DIGIT_HEIGHT });
        return;
      }

      gsap.fromTo(
        el,
        { y: 0 },
        {
          y: -d * DIGIT_HEIGHT,
          duration: 1.0,
          delay: i * 0.08,
          ease: 'power3.out',
        }
      );
    });
  };

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: wrapRef.current,
      start: 'top 85%',
      onEnter: playOnce,
    });
    return () => st.kill();
  }, []);

  return (
    <>
      <div className="price-card" ref={wrapRef}>
        <div className="price-display" aria-label={`$${TICKER_DIGITS.join('')}`}>
          <span className="price-currency">$</span>
          {TICKER_DIGITS.map((d, i) => (
            <span className="price-digit-wrap" key={i} aria-hidden="true">
              <span
                className="price-digit-col"
                ref={(el) => (colRefs.current[i] = el)}
              >
                {Array.from({ length: 10 }, (_, n) => (
                  <span className="price-digit" key={n}>
                    {n}
                  </span>
                ))}
              </span>
            </span>
          ))}
        </div>
        <div className="price-meta">One-time. Lifetime access.</div>
      </div>
      <button type="button" className="replay-btn" onClick={playOnce}>
        ↻ Replay
      </button>
    </>
  );
}
