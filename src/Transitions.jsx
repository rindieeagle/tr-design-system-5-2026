import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(Flip);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isCoarsePointer = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(pointer: coarse)').matches;

export default function Transitions() {
  return (
    <div className="page">
      <header className="hero">
        <span className="eyebrow">Interactions / State</span>
        <h1 className="title">Transitions and ambient</h1>
        <p className="lede">
          Four state transitions and one ambient effect. Each one replaces a
          CSS-only motion with a GSAP timeline so we get sequenced eases,
          interruptibility, and synced parts. Drawer, sheet, and modal demos
          are scoped inside their cards so the page stays calm.
        </p>
      </header>

      <Demo num="01" name="Tab Indicator Slide" hint="Click a tab. Indicator morphs via Flip.">
        <TabIndicator />
      </Demo>

      <Demo num="02" name="Drawer Timeline" hint="Tap the menu icon. Tap scrim to close.">
        <DrawerDemo />
      </Demo>

      <Demo num="03" name="Bottom Sheet Timeline" hint="Tap Sort to open. Tap scrim to dismiss.">
        <BottomSheetDemo />
      </Demo>

      <Demo num="04" name="Modal Open / Close" hint="Scrim fades, then card scales with spring.">
        <ModalDemo />
      </Demo>

      <Demo num="05" name="Cursor-Aware Orb Parallax" hint="Move your cursor. Disabled on touch.">
        <CursorOrbs />
      </Demo>

      <footer className="foot">
        <div>
          <em>GSAP 3.15</em> · Flip · Timelines · Pointer events
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
   01 · Tab Indicator Slide (Flip)
   Indicator is positioned absolutely under the active tab via
   inline left/width. On click, Flip.getState() captures the
   current rect, we update the position, and Flip.from() animates
   the morph (slide + width change).
   ============================================================ */
const TABS = [
  { label: 'Course', title: 'SOAP Notes Mastery', body: '12 lessons. Chart-ready templates and CE-eligible audit walk-throughs.' },
  { label: 'Workbook', title: 'Treatment Plan Workbook', body: 'Print-ready exercises that build the golden thread, page by page.' },
  { label: 'Cheat Sheet', title: 'Intake Audit Cheat Sheet', body: 'One page. Run it during the next intake. Finish with a defensible chart.' },
  { label: 'Article', title: 'AI in the Note Loop', body: 'Where ChatGPT helps, where it hurts, and the confidentiality boundary.' },
];

function TabIndicator() {
  const barRef = useRef(null);
  const [active, setActive] = useState(0);

  // Always pass the target index explicitly to avoid stale-closure bugs
  // around React state batching + rAF.
  const positionIndicator = (idx) => {
    const bar = barRef.current;
    if (!bar) return;
    const indicator = bar.querySelector('.tab-indicator');
    const tabs = bar.querySelectorAll('.tab');
    const target = tabs[idx];
    if (!indicator || !target) return;
    const tabRect = target.getBoundingClientRect();
    const barRect = bar.getBoundingClientRect();
    indicator.style.left = `${tabRect.left - barRect.left}px`;
    indicator.style.width = `${tabRect.width}px`;
  };

  useLayoutEffect(() => {
    positionIndicator(active);
    const onResize = () => positionIndicator(active);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // active intentionally not a dep — handleClick re-positions on click
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = (i) => {
    if (i === active) return;
    const indicator = barRef.current.querySelector('.tab-indicator');

    if (prefersReducedMotion()) {
      positionIndicator(i);
      setActive(i);
      return;
    }

    // FLIP: capture current rect, snap to new position, animate the difference.
    const state = Flip.getState(indicator);
    positionIndicator(i);
    Flip.from(state, {
      duration: 0.5,
      ease: 'power3.inOut',
    });
    setActive(i);
  };

  return (
    <div className="tab-bar-wrap">
      <div ref={barRef} className="tab-bar" role="tablist">
        {TABS.map((t, i) => (
          <button
            key={t.label}
            type="button"
            role="tab"
            aria-selected={active === i}
            className={`tab ${active === i ? 'is-active' : ''}`}
            onClick={() => handleClick(i)}
          >
            {t.label}
          </button>
        ))}
        <div className="tab-indicator" aria-hidden="true" />
      </div>
      <div className="tab-panel" key={active}>
        <h3>{TABS[active].title}</h3>
        <p>{TABS[active].body}</p>
      </div>
    </div>
  );
}

/* ============================================================
   02 · Drawer Timeline
   A scoped phone-frame chrome contains a drawer that slides
   in from the left while the scrim fades in. One paused
   timeline; play/reverse on open/close. Everything stays
   inside the demo card (position: absolute, not fixed).
   ============================================================ */
function DrawerDemo() {
  const chromeRef = useRef(null);
  const drawerRef = useRef(null);
  const scrimRef = useRef(null);
  const tlRef = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const reduce = prefersReducedMotion();
    gsap.set(drawerRef.current, { x: '-100%' });
    gsap.set(scrimRef.current, { opacity: 0 });

    const tl = gsap.timeline({ paused: true });
    if (reduce) {
      tl.to(scrimRef.current, { opacity: 1, duration: 0 }, 0);
      tl.to(drawerRef.current, { x: '0%', duration: 0 }, 0);
    } else {
      tl.to(scrimRef.current, { opacity: 1, duration: 0.32, ease: 'power2.out' }, 0);
      tl.to(drawerRef.current, { x: '0%', duration: 0.42, ease: 'power3.out' }, 0);
    }
    tlRef.current = tl;
    return () => tl.kill();
  }, []);

  const openDrawer = () => {
    if (open) return;
    setOpen(true);
    tlRef.current.play();
  };
  const closeDrawer = () => {
    if (!open) return;
    setOpen(false);
    tlRef.current.reverse();
  };

  return (
    <div className="scoped-chrome" ref={chromeRef}>
      <header className="sc-topbar">
        <button type="button" className="sc-iconbtn" onClick={openDrawer} aria-label="Open menu">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
        </button>
        <span className="sc-brand">Therapist Resources</span>
        <span style={{ width: 36 }} />
      </header>
      <div className="sc-body">
        <div className="sc-card">
          <h4>Today's note queue</h4>
          <p style={{ margin: '4px 0 0', fontSize: 13 }}>3 SOAPs to write before 5pm.</p>
        </div>
      </div>

      <div
        ref={scrimRef}
        className={`scoped-scrim ${open ? 'is-active' : ''}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />
      <aside ref={drawerRef} className="scoped-drawer" aria-hidden={!open}>
        <div className="scoped-drawer-head">Menu</div>
        <a className="scoped-drawer-link" href="#" onClick={(e) => { e.preventDefault(); closeDrawer(); }}>Courses</a>
        <a className="scoped-drawer-link" href="#" onClick={(e) => { e.preventDefault(); closeDrawer(); }}>Worksheets</a>
        <a className="scoped-drawer-link" href="#" onClick={(e) => { e.preventDefault(); closeDrawer(); }}>Articles</a>
        <a className="scoped-drawer-link" href="#" onClick={(e) => { e.preventDefault(); closeDrawer(); }}>Account</a>
      </aside>
    </div>
  );
}

/* ============================================================
   03 · Bottom Sheet Timeline
   Slides up from the bottom of the scoped chrome with a
   slightly slower, more cushioned ease than the drawer.
   ============================================================ */
const SHEET_OPTIONS = ['Newest first', 'Most popular', 'Price: low to high', 'Price: high to low'];

function BottomSheetDemo() {
  const sheetRef = useRef(null);
  const scrimRef = useRef(null);
  const tlRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const reduce = prefersReducedMotion();
    gsap.set(sheetRef.current, { y: '100%' });
    gsap.set(scrimRef.current, { opacity: 0 });

    const tl = gsap.timeline({ paused: true });
    if (reduce) {
      tl.to(scrimRef.current, { opacity: 1, duration: 0 }, 0);
      tl.to(sheetRef.current, { y: '0%', duration: 0 }, 0);
    } else {
      tl.to(scrimRef.current, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0);
      tl.to(sheetRef.current, { y: '0%', duration: 0.5, ease: 'power3.out' }, 0.05);
    }
    tlRef.current = tl;
    return () => tl.kill();
  }, []);

  const openSheet = () => {
    if (open) return;
    setOpen(true);
    tlRef.current.play();
  };
  const closeSheet = () => {
    if (!open) return;
    setOpen(false);
    tlRef.current.reverse();
  };

  return (
    <div className="scoped-chrome">
      <header className="sc-topbar">
        <span className="sc-brand">Browse · Resources</span>
        <button type="button" className="sc-iconbtn" onClick={openSheet} aria-label="Open sort options">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M6 12h12M10 18h4"/></svg>
        </button>
      </header>
      <div className="sc-body">
        <div className="sc-card">
          <h4>Sort: {SHEET_OPTIONS[selected]}</h4>
          <p style={{ margin: '4px 0 0', fontSize: 13 }}>Tap the sort icon to change.</p>
        </div>
      </div>

      <div
        ref={scrimRef}
        className={`scoped-scrim ${open ? 'is-active' : ''}`}
        onClick={closeSheet}
        aria-hidden="true"
      />
      <div ref={sheetRef} className="scoped-sheet" aria-hidden={!open}>
        <div className="scoped-sheet-handle" />
        <div className="scoped-sheet-title">Sort by</div>
        <ul className="scoped-sheet-list">
          {SHEET_OPTIONS.map((opt, i) => (
            <li key={opt} onClick={() => { setSelected(i); closeSheet(); }}>
              <span>{opt}</span>
              {i === selected && (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--tr-text-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ============================================================
   04 · Modal Open/Close Timeline
   Scrim fades first (0.25s), then the card scales from 0.96
   with a back.out(1.4) for a tiny spring. Reverse cleans up
   in 0.3s. Scoped to its stage (position: absolute, not fixed).
   ============================================================ */
function ModalDemo() {
  const stageRef = useRef(null);
  const scrimRef = useRef(null);
  const modalRef = useRef(null);
  const tlRef = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const reduce = prefersReducedMotion();
    gsap.set(scrimRef.current, { opacity: 0 });
    // xPercent/yPercent translate by -50% of the element's OWN width/height,
    // so the modal centers on its top:50% / left:50% anchor without fighting CSS.
    gsap.set(modalRef.current, {
      opacity: 0,
      scale: 0.96,
      xPercent: -50,
      yPercent: -50,
    });

    const tl = gsap.timeline({ paused: true });
    if (reduce) {
      tl.to(scrimRef.current, { opacity: 1, duration: 0 }, 0);
      tl.to(modalRef.current, { opacity: 1, scale: 1, duration: 0 }, 0);
    } else {
      tl.to(scrimRef.current, { opacity: 1, duration: 0.25, ease: 'power2.out' }, 0);
      tl.to(
        modalRef.current,
        { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.4)' },
        0.1
      );
    }
    tlRef.current = tl;
    return () => tl.kill();
  }, []);

  const openModal = () => {
    if (open) return;
    setOpen(true);
    tlRef.current.timeScale(1).play();
  };
  const closeModal = () => {
    if (!open) return;
    setOpen(false);
    tlRef.current.timeScale(1.4).reverse();
  };

  return (
    <div className="scoped-modal-stage" ref={stageRef}>
      <div className="modal-trigger-wrap">
        <button type="button" className="modal-trigger" onClick={openModal}>
          Confirm enrollment
        </button>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--tr-text-60)' }}>
          Click the button to open the modal.
        </p>
      </div>

      <div
        ref={scrimRef}
        className={`scoped-scrim ${open ? 'is-active' : ''}`}
        onClick={closeModal}
        aria-hidden="true"
      />
      <div ref={modalRef} className="scoped-modal" role="dialog" aria-modal="true" aria-hidden={!open}>
        <h3>Enroll in SOAP Notes Mastery</h3>
        <p>
          You'll get instant access to all 12 lessons, the audit-ready template
          pack, and the Q&amp;A community. One-time payment, lifetime access.
        </p>
        <div className="scoped-modal-foot">
          <button type="button" className="modal-btn" onClick={closeModal}>Cancel</button>
          <button type="button" className="modal-btn modal-btn--primary" onClick={closeModal}>Confirm · $37</button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   05 · Cursor-Aware Orb Parallax
   Three blur orbs drift toward / away from the cursor at low
   intensity. Different speeds + alternating directions create
   a sense of depth. Disabled entirely on coarse pointers and
   on prefers-reduced-motion.
   ============================================================ */
function CursorOrbs() {
  const stageRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion() || isCoarsePointer()) return;

    const stage = stageRef.current;
    const orbs = Array.from(stage.querySelectorAll('.amb-orb'));

    // Orbs drift toward (positive) or away (negative) at varying intensity
    const config = [
      { intensity: 18, sign: 1 },   // foreground orb, follows
      { intensity: 32, sign: -1 },  // mid orb, drifts away
      { intensity: 24, sign: 1 },   // background, follows softly
    ];

    const onMove = (e) => {
      // Re-read rect every move so scroll position can't desync it.
      // getBoundingClientRect is fast enough here — no measurable jank.
      const rect = stage.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5..0.5
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      orbs.forEach((orb, i) => {
        const { intensity, sign } = config[i] || config[0];
        gsap.to(orb, {
          x: nx * intensity * sign,
          y: ny * intensity * sign,
          duration: 0.9,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      });
    };

    const onLeave = () => {
      orbs.forEach((orb) => {
        gsap.to(orb, { x: 0, y: 0, duration: 1.2, ease: 'power3.out', overwrite: 'auto' });
      });
    };

    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerleave', onLeave);
    return () => {
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div className="amb-stage" ref={stageRef}>
      <div className="amb-orb amb-orb-1" aria-hidden="true" />
      <div className="amb-orb amb-orb-2" aria-hidden="true" />
      <div className="amb-orb amb-orb-3" aria-hidden="true" />
      <div className="amb-content">
        <h3>Quiet depth.</h3>
        <p>
          Three orbs follow your cursor at three intensities. The middle one
          drifts the opposite way for parallax.
        </p>
      </div>
      {isCoarsePointer() && (
        <div className="amb-touch-note">Touch device · parallax disabled</div>
      )}
    </div>
  );
}
