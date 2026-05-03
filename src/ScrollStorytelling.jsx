import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function ScrollStorytelling() {
  return (
    <div className="page">
      <header className="hero">
        <span className="eyebrow">Interactions / Scroll</span>
        <h1 className="title">Scroll storytelling</h1>
        <p className="lede">
          Five scroll-driven patterns. Each one ties motion to scroll position
          (or scroll-into-view), uses the existing TR tokens, and respects
          reduced-motion. Scroll the page to trigger each demo.
        </p>
      </header>

      <Demo num="01" name="SplitText Hero Reveal" hint="Words rise on scroll-into-view.">
        <SplitTextReveal />
      </Demo>

      <Demo num="02" name="Pinned Section + Parallax Orbs" hint="Scroll past this card to drive the orbs.">
        <PinnedParallax />
      </Demo>

      <Demo num="03" name="Card Stagger Reveal" hint="Resource cards stagger in.">
        <CardStagger />
      </Demo>

      <Demo num="04" name="Gradient Headline Draw" hint="Wash gradient wipes in left-to-right.">
        <HeadlineDraw />
      </Demo>

      <Demo num="05" name="Brand Mark Draw" hint="Scrub-linked. Scroll past to draw the leaves.">
        <BrandMarkDraw />
      </Demo>

      <footer className="foot">
        <div>
          <em>GSAP 3.15</em> · ScrollTrigger · SplitText · DrawSVGPlugin
        </div>
        <div>Respects <code>prefers-reduced-motion</code>.</div>
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
   01 · SplitText Hero Reveal
   Two-line headline split into words. Each word rises 30px
   and fades in with a 40ms stagger when the headline scrolls
   into view. Replay re-runs the whole thing.
   ============================================================ */
function SplitTextReveal() {
  const headlineRef = useRef(null);
  const animationRef = useRef(null);
  const splitRef = useRef(null);

  const buildAnimation = () => {
    // Tear down any prior run before re-splitting
    if (animationRef.current) {
      animationRef.current.scrollTrigger?.kill();
      animationRef.current.kill();
    }
    if (splitRef.current) splitRef.current.revert();

    splitRef.current = SplitText.create(headlineRef.current, {
      type: 'words',
      wordsClass: 'split-word',
    });

    if (prefersReducedMotion()) {
      gsap.set(splitRef.current.words, { opacity: 1, y: 0 });
      return;
    }

    animationRef.current = gsap.from(splitRef.current.words, {
      y: 32,
      opacity: 0,
      duration: 0.7,
      stagger: 0.04,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: headlineRef.current,
        start: 'top 80%',
        once: true,
      },
    });
  };

  useEffect(() => {
    buildAnimation();
    return () => {
      animationRef.current?.scrollTrigger?.kill();
      animationRef.current?.kill();
      splitRef.current?.revert();
    };
  }, []);

  const replay = () => buildAnimation();

  return (
    <div className="split-stage">
      <h3 className="split-headline" ref={headlineRef}>
        <span className="split-line-1">Smart tools for modern therapists.</span>
        <span className="split-line-2">Built by a clinician, for clinicians.</span>
      </h3>
      <p className="split-sub">
        Forty millisecond stagger, 700ms per word, soft up-fade.
        The two-tone gradient is a brand signature.
      </p>
      <button type="button" className="replay-btn" onClick={replay}>↻ Replay</button>
    </div>
  );
}

/* ============================================================
   02 · Pinned Section + Parallax Orbs
   The card pins to the top of the viewport while the user
   scrolls. Three blur orbs scrub-translate at different speeds
   while pinned. Pin extension = 600px of scroll.
   ============================================================ */
function PinnedParallax() {
  const stageRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = prefersReducedMotion();

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stageRef.current,
          start: 'top 20%',
          end: '+=600',
          pin: true,
          pinSpacing: true,
          scrub: reduce ? false : 0.8,
          onUpdate: (self) => {
            if (progressRef.current) {
              progressRef.current.textContent = `${Math.round(self.progress * 100)}%`;
            }
          },
        },
      });

      if (!reduce) {
        tl.to('.orb-1', { y: -60, x: 40, ease: 'none' }, 0);
        tl.to('.orb-2', { y: -180, x: -50, ease: 'none' }, 0);
        tl.to('.orb-3', { y: -100, x: 30, ease: 'none' }, 0);
      }
    }, stageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="pin-spacer">
      <div className="pin-stage" ref={stageRef}>
        <div className="orb orb-1" aria-hidden="true" />
        <div className="orb orb-2" aria-hidden="true" />
        <div className="orb orb-3" aria-hidden="true" />
        <div className="pin-content">
          <h3>Three orbs, three speeds.</h3>
          <p>
            The card stays pinned while the orbs drift at different rates
            against the scroll. Calm depth, no theme park.
          </p>
        </div>
        <div className="pin-progress">
          PIN PROGRESS · <span ref={progressRef}>0%</span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   03 · Card Stagger Reveal
   Six resource cards in a 3-col grid. On scroll-into-view,
   each card translates up 40px and fades in with a 60ms
   stagger. Replay re-runs.
   ============================================================ */
const STAGGER_CARDS = [
  { eyebrow: 'Course', title: 'SOAP Notes Mastery', body: '12 lessons · 3 hours · CE eligible.', price: '$37' },
  { eyebrow: 'Worksheet', title: 'Intake Audit Sheet', body: 'Print and run during your next intake.', price: '$9' },
  { eyebrow: 'Course', title: 'Treatment Plans 101', body: 'Golden-thread documentation, line by line.', price: '$47' },
  { eyebrow: 'Article', title: 'AI in the Note Loop', body: 'Where ChatGPT helps and where it does not.', price: 'Free' },
  { eyebrow: 'Bundle', title: 'Write it Right', body: 'All four documentation courses, one price.', price: '$129' },
  { eyebrow: 'Article', title: 'Discharge Done Right', body: 'A short, audit-ready closing template.', price: 'Free' },
];

function CardStagger() {
  const gridRef = useRef(null);
  const animationRef = useRef(null);

  const buildAnimation = () => {
    if (animationRef.current) {
      animationRef.current.scrollTrigger?.kill();
      animationRef.current.kill();
    }
    const cards = gridRef.current.querySelectorAll('.stagger-card');

    if (prefersReducedMotion()) {
      gsap.set(cards, { opacity: 1, y: 0 });
      return;
    }

    animationRef.current = gsap.from(cards, {
      y: 40,
      opacity: 0,
      duration: 0.6,
      stagger: 0.06,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: gridRef.current,
        start: 'top 80%',
        once: true,
      },
    });
  };

  useEffect(() => {
    buildAnimation();
    return () => {
      animationRef.current?.scrollTrigger?.kill();
      animationRef.current?.kill();
    };
  }, []);

  return (
    <>
      <div className="stagger-grid" ref={gridRef}>
        {STAGGER_CARDS.map((c, i) => (
          <div className="stagger-card" key={i}>
            <span className="stagger-card-eyebrow">{c.eyebrow}</span>
            <h3>{c.title}</h3>
            <p>{c.body}</p>
            <div className="stagger-card-foot">
              <span className="stagger-card-price">{c.price}</span>
              <span className="stagger-card-cta">View →</span>
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="replay-btn" onClick={buildAnimation}>↻ Replay</button>
    </>
  );
}

/* ============================================================
   04 · Gradient Headline Draw
   Two stacked H2s. Each headline reveals via clip-path (left
   to right) when it scrolls into view. Reads like the wash is
   being painted on. Replay re-runs both.
   ============================================================ */
const DRAW_HEADLINES = [
  {
    h: 'Documentation that survives an audit.',
    p: 'Plain-language framing, evidence-first structure, and a golden thread you can point to on page one.',
  },
  {
    h: 'Built by a clinician, not a content farm.',
    p: 'Every template comes from a real caseload. Every example is one you could defend in a chart review tomorrow.',
  },
];

function HeadlineDraw() {
  const wrapRef = useRef(null);
  const tweensRef = useRef([]);

  const buildAnimations = () => {
    tweensRef.current.forEach((t) => {
      t.scrollTrigger?.kill();
      t.kill();
    });
    tweensRef.current = [];

    const headlines = wrapRef.current.querySelectorAll('.draw-h2');

    if (prefersReducedMotion()) {
      gsap.set(headlines, { clipPath: 'inset(0 0% 0 0)' });
      return;
    }

    headlines.forEach((el, i) => {
      const t = gsap.fromTo(
        el,
        { clipPath: 'inset(0 100% 0 0)' },
        {
          clipPath: 'inset(0 0% 0 0)',
          duration: 1.0,
          ease: 'power3.out',
          delay: i * 0.1,
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            once: true,
          },
        }
      );
      tweensRef.current.push(t);
    });
  };

  useEffect(() => {
    buildAnimations();
    return () => {
      tweensRef.current.forEach((t) => {
        t.scrollTrigger?.kill();
        t.kill();
      });
    };
  }, []);

  return (
    <>
      <div className="draw-stage" ref={wrapRef}>
        {DRAW_HEADLINES.map((d, i) => (
          <div className="draw-block" key={i}>
            <h2 className="draw-h2">{d.h}</h2>
            <p>{d.p}</p>
          </div>
        ))}
      </div>
      <button type="button" className="replay-btn" onClick={buildAnimations}>↻ Replay</button>
    </>
  );
}

/* ============================================================
   05 · Scrub-Driven Brand Mark Draw
   Stylized tree-of-leaves. Each stroke draws on as the user
   scrubs through the section. ease: "none" so progress is
   linear with scroll. Reduced-motion users get the full mark.
   ============================================================ */
function BrandMarkDraw() {
  const stageRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const strokes = svgRef.current.querySelectorAll('.leaf-stroke');

      if (prefersReducedMotion()) {
        gsap.set(strokes, { drawSVG: '0% 100%' });
        return;
      }

      gsap.set(strokes, { drawSVG: '0% 0%' });

      gsap.to(strokes, {
        drawSVG: '0% 100%',
        ease: 'none',
        stagger: 0.08,
        scrollTrigger: {
          trigger: stageRef.current,
          start: 'top 75%',
          end: 'bottom 25%',
          scrub: 0.5,
        },
      });
    }, stageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="mark-stage" ref={stageRef}>
      <svg
        ref={svgRef}
        className="mark-svg"
        viewBox="0 0 280 320"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Trunk first */}
        <path
          className="leaf-stroke"
          stroke="#001C3F"
          d="M 140 320 Q 130 280 140 240 Q 150 200 140 160"
        />
        {/* 6 leaves radiating from the trunk top */}
        <path
          className="leaf-stroke"
          stroke="#9F90C9"
          d="M 140 160 C 100 150 70 110 90 80 C 110 70 130 110 140 160 Z"
        />
        <path
          className="leaf-stroke"
          stroke="#0276B5"
          d="M 140 160 C 130 110 140 70 165 60 C 180 75 165 110 140 160 Z"
        />
        <path
          className="leaf-stroke"
          stroke="#05B4DD"
          d="M 140 160 C 165 130 205 110 225 130 C 220 155 180 165 140 160 Z"
        />
        <path
          className="leaf-stroke"
          stroke="#64C5C9"
          d="M 140 160 C 110 130 70 130 55 150 C 70 175 105 170 140 160 Z"
        />
        <path
          className="leaf-stroke"
          stroke="#0183C4"
          d="M 140 160 C 165 165 205 175 220 200 C 205 220 165 200 140 160 Z"
        />
        <path
          className="leaf-stroke"
          stroke="#9F90C9"
          d="M 140 160 C 115 165 80 180 65 205 C 85 225 115 200 140 160 Z"
        />
      </svg>
      <div className="mark-caption">
        <h3>Scroll to draw the mark</h3>
        <p>
          Each stroke is tied to scroll position with <em>scrub: 0.5</em>.
          Scroll back up to redraw in reverse. Logo here is a stylized
          stand-in. Pop the real leaf paths in via DrawSVG when ready.
        </p>
      </div>
    </div>
  );
}
