import React, { useEffect, useRef, useState } from "react";
import Section from "@/components/Section";
import SectionHeader from "@/components/SectionHeader";
import "./mosaic.css";

export default function Benefits() {
  const [entranceRun, setEntranceRun] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReduced) return;

    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          observer.disconnect();
          setEntranceRun(true);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Section id="benefits">
      <div ref={sectionRef} className="py-6 sm:py-10 flex flex-col items-center">
        {/* Section Header */}
        <SectionHeader className="mb-8">
          <SectionHeader.Label>Capabilities</SectionHeader.Label>
          <SectionHeader.Title>
            The complete distance learning ecosystem
          </SectionHeader.Title>
          <SectionHeader.Description>
            Discover our purpose-built features for students, instructors, and institutions.
          </SectionHeader.Description>
        </SectionHeader>

        <div
          className={`mosaic-wrapper ${entranceRun ? "entrance-run" : ""}`}
        >
          <div className="mosaic-scaler">
            <div className="stage" role="main" aria-label="Product feature overview">
          {/* 1. NOTIFICATION CARD */}
          <article className="card notif" aria-label="Credential notification">
            <div className="toast-wrap">
              <div className="toast-ledge" />
              <div className="toast">
                <svg
                  className="sparkle-ico"
                  width="27"
                  height="27"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle cx="12" cy="12" r="12" fill="#0d0d0d" />
                  <path
                    d="M12 4C12 8.418 8.418 12 4 12C8.418 12 12 15.582 12 20C12 15.582 15.582 12 20 12C15.582 12 12 8.418 12 4Z"
                    fill="#ffffff"
                  />
                </svg>
                <div className="toast-body">
                  <div className="toast-title">Certificate Issued!</div>
                  <div className="toast-sub">
                    Tamper-proof credential generated for Full-Stack Systems
                  </div>
                </div>
                <div className="toast-time">Just now</div>
              </div>
            </div>
          </article>

          {/* 2. CONNECT YOUR TOOLS CARD */}
          <article className="card connect" aria-label="Integrations">
            <h2>
              Connect your
              <br />
              Campus Stack.
            </h2>
            <p className="sub">120+ developer & learning tools</p>

            <div className="chips-container">
              {/* Row 1 */}
              <div className="chip-row r1">
                <div className="chip">
                  <span>Microsoft Teams</span>
                  <svg width="21" height="21" viewBox="0 0 24 24">
                    <path
                      d="M19.5 7.5A2.25 2.25 0 1 0 19.5 3a2.25 2.25 0 0 0 0 4.5zM15.75 8.25h4.5A2.25 2.25 0 0 1 22.5 10.5v3.75a.75.75 0 0 1-1.5 0V10.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0-.75.75v6a.75.75 0 0 0 .75.75h1.5a.75.75 0 0 1 0 1.5h-1.5a2.25 2.25 0 0 1-2.25-2.25v-6a2.25 2.25 0 0 1 2.25-2.25z"
                      fill="#5059C9"
                    />
                    <path
                      d="M11.25 6A2.625 2.625 0 1 0 11.25.75a2.625 2.625 0 0 0 0 5.25zm-3.375 1.5h6.75A2.625 2.625 0 0 1 17.25 10.125v7.5A2.625 2.625 0 0 1 14.625 20.25H7.875A2.625 2.625 0 0 1 5.25 17.625v-7.5A2.625 2.625 0 0 1 7.875 7.5z"
                      fill="#7B83EB"
                    />
                    <rect
                      x="1.5"
                      y="7.5"
                      width="9"
                      height="9"
                      rx="1.5"
                      fill="#4B53BC"
                    />
                    <path
                      d="M6.75 10.125h-2.25v3.75H3v-3.75H1.5V9h5.25v1.125z"
                      fill="#ffffff"
                    />
                  </svg>
                </div>
              </div>

              {/* Row 2 */}
              <div className="chip-row r2">
                <div className="chip">
                  <span>Notion</span>
                  <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="2"
                      y="2"
                      width="20"
                      height="20"
                      rx="4"
                      fill="#ffffff"
                      stroke="#000000"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M7 6.5L14.5 17.5M14.5 6.5V17.5M7 6.5H9.5M7 17.5H9.5M14.5 6.5H17"
                      stroke="#000000"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="chip">
                  <span>GitHub</span>
                  <svg width="21" height="21" viewBox="0 0 24 24" fill="#0d0d0d">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                </div>
              </div>

              {/* Row 3 */}
              <div className="chip-row r3">
                <div className="chip">
                  <span>Google Drive</span>
                  <svg width="21" height="21" viewBox="0 0 87.3 78">
                    <path
                      d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z"
                      fill="#0066da"
                    />
                    <path
                      d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z"
                      fill="#00ac47"
                    />
                    <path
                      d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z"
                      fill="#ea4335"
                    />
                    <path
                      d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z"
                      fill="#00832d"
                    />
                    <path
                      d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z"
                      fill="#2684fc"
                    />
                    <path
                      d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z"
                      fill="#ffba00"
                    />
                  </svg>
                </div>
                <div className="chip">
                  <span>Figma</span>
                  <svg width="21" height="21" viewBox="0 0 38 57">
                    <path
                      d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z"
                      fill="#1ABCFE"
                    />
                    <path
                      d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z"
                      fill="#0ACF83"
                    />
                    <path
                      d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z"
                      fill="#FF7262"
                    />
                    <path
                      d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z"
                      fill="#F24E1E"
                    />
                    <path
                      d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z"
                      fill="#A259FF"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Floating Slack Chip */}
            <div className="chip chip-slack">
              <span>Slack</span>
              <svg width="21" height="21" viewBox="0 0 122.8 122.8">
                <path
                  d="M25.8 77.6a12.9 12.9 0 1 1-12.9-12.9h12.9v12.9zm6.5 0a12.9 12.9 0 1 1 25.8 0v32.3a12.9 12.9 0 1 1-25.8 0V77.6z"
                  fill="#E01E5A"
                />
                <path
                  d="M45.2 25.8a12.9 12.9 0 1 1 12.9-12.9v12.9H45.2zm0 6.5a12.9 12.9 0 1 1 0 25.8H12.9a12.9 12.9 0 1 1 0-25.8h32.3z"
                  fill="#36C5F0"
                />
                <path
                  d="M97 45.2a12.9 12.9 0 1 1 12.9 12.9H97V45.2zm-6.5 0a12.9 12.9 0 1 1-25.8 0V12.9a12.9 12.9 0 1 1 25.8 0v32.3z"
                  fill="#2EB67D"
                />
                <path
                  d="M77.6 97a12.9 12.9 0 1 1-12.9 12.9V97h12.9zm0-6.5a12.9 12.9 0 1 1 0-25.8h32.3a12.9 12.9 0 1 1 0 25.8H77.6z"
                  fill="#ECB22E"
                />
              </svg>
            </div>
          </article>

          {/* 3. HERO AUTOMATE CARD */}
          <article className="card automate" aria-label="Master modern code">
            <div className="copy-pad">
              <h2>
                <span className="g">Master</span> modern code.
                <br />
                Learn on your schedule.
              </h2>
              <p className="sub">
                Audited video lectures, browser code labs, and verified credentials.
              </p>
            </div>

            {/* Illustration Layer */}
            <div className="illo" aria-hidden="true">
              {/* Back Window */}
              <div className="win-back">
                <div className="titlebar">
                  <div className="tdot" />
                  <div className="tdot" />
                  <div className="tdot" />
                </div>
                <div className="win-body">
                  <div className="strip" />
                </div>
              </div>

              {/* Front Window */}
              <div className="win-front">
                <div className="titlebar">
                  <div className="tdot" />
                  <div className="tdot" />
                  <div className="tdot" />
                </div>
                <div className="win-body">
                  <div className="strip" />
                </div>
              </div>

              {/* Workflow Automated Pill */}
              <div className="pill-wf">
                <div className="tick-disc">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2.5 6L5 8.5L9.5 3.5"
                      stroke="#161616"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span>Assessment Verified</span>
              </div>

              {/* AI Sparkle Pill */}
              <div className="pill-ai">
                <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z"
                    fill="#eff4e6"
                    stroke="#4f7433"
                    strokeWidth="2.2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19 16L19.9 18.1L22 19L19.9 19.9L19 22L18.1 19.9L16 19L18.1 18.1L19 16Z"
                    fill="#eff4e6"
                    stroke="#4f7433"
                    strokeWidth="2.25"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="skel-wrap">
                  <div className="skel-line" style={{ width: "65px" }} />
                  <div className="skel-line" style={{ width: "45px" }} />
                </div>
              </div>

              {/* Cursor */}
              <svg
                className="cursor"
                width="30"
                height="35"
                viewBox="0 0 24 28"
                fill="none"
              >
                <path
                  d="M5.5 2.5L18.5 15.5H11.5L9.5 24.5L5.5 2.5Z"
                  fill="#ffffff"
                  stroke="#2b2b2b"
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </article>

          {/* 4. PRODUCTIVITY INSIGHTS CARD */}
          <article className="card insights" aria-label="Study Telemetry">
            <div className="tag">Study Telemetry</div>
            <h2>48 hours</h2>
            <p className="sub">of verified study this week!</p>

            <div
              className="chart"
              aria-label="Hours studied per day: Monday 2, Tuesday 6, Wednesday 12, Thursday 20, Friday 31, Saturday 40, Sunday 48"
            >
              {/* MON */}
              <div className="bar-col">
                <div className="bar" style={{ height: "43.2px" }}>
                  <span className="lbl">2h</span>
                </div>
                <div className="day">MON</div>
              </div>

              {/* TUE */}
              <div className="bar-col">
                <div className="bar" style={{ height: "80.9px" }}>
                  <span className="lbl">6h</span>
                </div>
                <div className="day">TUE</div>
              </div>

              {/* WED */}
              <div className="bar-col">
                <div className="bar" style={{ height: "131.7px" }}>
                  <span className="lbl">12h</span>
                </div>
                <div className="day">WED</div>
              </div>

              {/* THU */}
              <div className="bar-col">
                <div className="bar" style={{ height: "165.5px" }}>
                  <span className="lbl">20h</span>
                </div>
                <div className="day">THU</div>
              </div>

              {/* FRI */}
              <div className="bar-col">
                <div className="bar" style={{ height: "203.2px" }}>
                  <span className="lbl">31h</span>
                </div>
                <div className="day">FRI</div>
              </div>

              {/* SAT */}
              <div className="bar-col">
                <div className="bar" style={{ height: "235.2px" }}>
                  <span className="lbl">40h</span>
                </div>
                <div className="day">SAT</div>
              </div>

              {/* SUN (Hero Gold Bar) */}
              <div className="bar-col">
                <div className="bar bar-sun" style={{ height: "265px" }}>
                  <span className="lbl-sun">48h</span>
                </div>
                <div className="day">SUN</div>
              </div>
            </div>
          </article>

          {/* 5. SEARCH CARD */}
          <article className="card search" aria-label="Search">
            <h2>
              Find anything
              <br />
              instantly
            </h2>

            <div className="bar-search">
              <div className="mag-wrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="11"
                    cy="11"
                    r="7.1"
                    stroke="#121212"
                    strokeWidth="2.2"
                  />
                  <path
                    d="M16.5 16.5L21.5 21.5"
                    stroke="#121212"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="placeholder">
                Search courses, lessons, code labs, quizzes...
              </span>
              <div className="mic-wrap">
                <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                  <rect
                    x="4.5"
                    y="1.5"
                    width="7"
                    height="11"
                    rx="3.5"
                    fill="#141414"
                  />
                  <path
                    d="M2 8.5C2 12.0899 4.91015 15 8.5 15C12.0899 15 15 12.0899 15 8.5"
                    stroke="#141414"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M8.5 15V18.5M5.5 18.5H11.5"
                    stroke="#141414"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </article>
        </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
