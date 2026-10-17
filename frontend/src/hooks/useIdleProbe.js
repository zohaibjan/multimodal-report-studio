import { useEffect, useRef, useState } from "react";

export function useIdleProbe({
  enabled,
  idleMs = 60_000,
  warnMs = 15_000,
  label = "IdleProbe",
  onActive,
  onWarning,
  onLogoutDue,
}) {
  const [status, setStatus] = useState("DISABLED");

  const lastActivityRef = useRef(Date.now());
  const statusRef = useRef("DISABLED");
  const warnedRef = useRef(false);
  const timerRef = useRef(null);
  const enabledPrevRef = useRef(false);

  // callback refs
  const onActiveRef = useRef(onActive);
  const onWarningRef = useRef(onWarning);
  const onLogoutDueRef = useRef(onLogoutDue);

  useEffect(() => { onActiveRef.current = onActive; }, [onActive]);
  useEffect(() => { onWarningRef.current = onWarning; }, [onWarning]);
  useEffect(() => { onLogoutDueRef.current = onLogoutDue; }, [onLogoutDue]);

  const setStatusOnce = (next, payload) => {
    if (statusRef.current !== next) {
      statusRef.current = next;
      setStatus(next);
      console.log(`[${label}] status -> ${next}`, payload || "");
    }
  };

  useEffect(() => {
    const warnAt = Math.max(0, idleMs - warnMs);

    // 🔎 lifecycle log
    console.log(`[${label}] effect run`, { enabled, idleMs, warnMs, warnAt });

    if (!enabled) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      warnedRef.current = false;
      enabledPrevRef.current = false;
      setStatusOnce("DISABLED");
      return;
    }

    // already enabled; do not re-init
    if (enabledPrevRef.current === true) return;

    enabledPrevRef.current = true;
    lastActivityRef.current = Date.now();
    warnedRef.current = false;
    setStatusOnce("ACTIVE", { reason: "enabled" });

    // only intentional activity
    const events = ["pointerdown", "keydown", "touchstart"];

    const onActivity = (e) => {
      lastActivityRef.current = Date.now();

      if (warnedRef.current) {
        warnedRef.current = false;
        setStatusOnce("ACTIVE", { event: e.type });
        onActiveRef.current?.();
      }
    };

    events.forEach((ev) =>
      document.addEventListener(ev, onActivity, { passive: true })
    );

    timerRef.current = setInterval(() => {
      const idleFor = Date.now() - lastActivityRef.current;

      if (!warnedRef.current && idleFor >= warnAt && idleFor < idleMs) {
        warnedRef.current = true;
        const secondsUntilLogout = Math.ceil((idleMs - idleFor) / 1000);
        setStatusOnce("IDLE_WARNING", { secondsUntilLogout });
        onWarningRef.current?.(secondsUntilLogout);
      }

      if (idleFor >= idleMs) {
        setStatusOnce("LOGOUT_DUE", { idleForSeconds: Math.floor(idleFor / 1000) });
        clearInterval(timerRef.current);
        timerRef.current = null;
        onLogoutDueRef.current?.();
      }
    }, 250);

    return () => {
      // 🔎 lifecycle log
      console.log(`[${label}] cleanup`, { enabled, idleMs, warnMs });

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      events.forEach((ev) => document.removeEventListener(ev, onActivity));
      enabledPrevRef.current = false;
      warnedRef.current = false;
    };
  }, [enabled, idleMs, warnMs, label]);

  return status;
}