"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import styles from "./HomeLaunchExperience.module.css";

const SPARKS = [
  [45, 44, -56, -34, 0.15], [55, 43, 44, -51, 0.48], [48, 54, -64, 18, 0.82],
  [58, 55, 57, 28, 1.08], [42, 51, -38, 52, 1.34], [53, 48, 31, -62, 1.62],
  [47, 42, -24, -58, 1.91], [59, 49, 66, -8, 2.18], [41, 57, -51, 42, 2.46],
  [51, 58, 15, 68, 2.73], [57, 41, 53, -39, .31], [44, 47, -67, -4, .68],
  [54, 53, 62, 45, 1.19], [49, 46, -18, -69, 1.77],
] as const;

export function HomeLaunchExperience({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [progress, setProgress] = useState(4);

  useEffect(() => {
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    const progressTimer = window.setInterval(() => {
      setProgress((current) => Math.min(100, current + (current < 55 ? 4 : current < 86 ? 2 : 1)));
    }, 72);

    const reveal = window.setTimeout(() => {
      setProgress(100);
      setReady(true);
      document.documentElement.style.overflow = previousOverflow;
    }, 2200);
    const remove = window.setTimeout(() => setShowLoader(false), 2820);

    return () => {
      window.clearInterval(progressTimer);
      window.clearTimeout(reveal);
      window.clearTimeout(remove);
      document.documentElement.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <>
      {showLoader && (
        <div
          className={`${styles.loader} ${ready ? styles.loaderLeaving : ""}`}
          aria-live="polite"
          aria-label="Loading AutoX Parts Store"
        >
          <div className={styles.grid} aria-hidden />
          <div className={styles.vignette} aria-hidden />

          <div className={styles.scene}>
            <div className={styles.ringWrap} aria-hidden="true">
              <div className={styles.ambientGlow} />

              <svg className={styles.ring} viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" fill="none" stroke="#241010" strokeWidth="1.55" />
                <circle className={styles.ringGlow} cx="100" cy="100" r="90" fill="none" stroke="#ED1C24" strokeWidth="2.15" strokeLinecap="round" strokeDasharray="75 42 32 150" />
              </svg>
              <svg className={styles.ringReverse} viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" fill="none" stroke="#5f1014" strokeWidth="1.15" strokeLinecap="round" strokeDasharray="8 16 42 24 18 64" />
              </svg>
              <svg className={styles.ringFine} viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" fill="none" stroke="#ED1C24" strokeWidth=".7" strokeDasharray="2 11" />
              </svg>

              <span className={styles.orbitDot} />
              <span className={`${styles.speedLine} ${styles.speedLineOne}`} />
              <span className={`${styles.speedLine} ${styles.speedLineTwo}`} />
              <span className={`${styles.speedLine} ${styles.speedLineThree}`} />

              <div className={styles.particles}>
                {SPARKS.map(([left, top, dx, dy, delay], index) => (
                  <span
                    key={index}
                    className={styles.spark}
                    style={{
                      left: `${left}%`,
                      top: `${top}%`,
                      animationDelay: `${delay}s`,
                      "--dx": `${dx}px`,
                      "--dy": `${dy}px`,
                    } as CSSProperties}
                  />
                ))}
              </div>

              <div className={styles.bikeHolder}>
                <Image
                  src="/images/ui/loader-ui.webp"
                  alt=""
                  width={1254}
                  height={1254}
                  priority
                  sizes="(max-width: 520px) 70vw, 310px"
                  className={styles.bike}
                />
              </div>
            </div>

            <div className={styles.wordmark}>AUTO<span>X</span></div>
            <div className={styles.tagline}>Performance Parts</div>

            <div className={styles.progressRow} aria-hidden="true">
              <div className={styles.barTrack}><span className={styles.barFill} /></div>
              <span className={styles.percent}>{progress}%</span>
            </div>
            <div className={styles.caption}><span className={styles.captionDot} />Loading your ride</div>
          </div>
        </div>
      )}

      <div className={`${styles.content} ${ready ? styles.contentReady : styles.contentHidden}`}>
        {children}
      </div>
    </>
  );
}
