"use client";

import { useState } from "react";

type SceneShellProps = {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  footer?: string;
};

type SceneTab = {
  id: string;
  label: string;
};

function SceneShell({ eyebrow, title, children, footer }: SceneShellProps) {
  return (
    <section className="story-scene">
      <div className="story-scene-top">
        <span className="story-scene-eyebrow">{eyebrow}</span>
        <h3 className="story-scene-title">{title}</h3>
      </div>
      {children}
      {footer ? <p className="story-scene-footer">{footer}</p> : null}
    </section>
  );
}

function SceneTabs({
  tabs,
  value,
  onChange,
}: {
  tabs: SceneTab[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="story-tabs" role="tablist" aria-label="Story scene tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`story-tab${tab.id === value ? " story-tab-active" : ""}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function StoryCard({
  label,
  title,
  children,
  accent = "blue",
}: {
  label: string;
  title: string;
  children: React.ReactNode;
  accent?: "blue" | "gold" | "green" | "pink";
}) {
  return (
    <div className={`story-card story-card-${accent}`}>
      <div className="story-card-label">{label}</div>
      <div className="story-card-title">{title}</div>
      <div className="story-card-body">{children}</div>
    </div>
  );
}

function StoryPill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "good" | "warn" | "accent";
}) {
  return <span className={`story-pill story-pill-${tone}`}>{children}</span>;
}

function MiniWindow({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="story-window">
      <div className="story-window-bar">
        <span className="story-window-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="story-window-title">{title}</span>
      </div>
      <div className="story-window-body">{children}</div>
    </div>
  );
}

export function ClientStoryMeetingScene() {
  const [focus, setFocus] = useState("rough");

  const tabs = [
    { id: "rough", label: "Rough explanation" },
    { id: "clarified", label: "Clarified understanding" },
  ];

  return (
    <SceneShell
      eyebrow="Phase 1"
      title="The first meeting is a conversation, not a polished spec"
      footer="You bring fragments, goals, and examples. I turn them into the first usable shape."
    >
      <SceneTabs tabs={tabs} value={focus} onChange={setFocus} />
      <div className="story-grid story-grid-two">
        <MiniWindow title="Kickoff chat">
          <div className="story-chat">
            <div className="story-bubble story-bubble-client">
              I need a request flow, but I am not sure how to describe it cleanly. I just know
              clients get confused and my team needs to review things before they go live.
            </div>
            <div
              className={`story-bubble story-bubble-you${focus === "clarified" ? " story-bubble-active" : ""}`}
            >
              Got it. So the real need is a simple client submission flow, a review step for your
              team, and enough structure that nothing gets published accidentally.
            </div>
            <div className="story-bubble story-bubble-client story-bubble-muted">
              Yes. That is much closer to what I mean.
            </div>
          </div>
        </MiniWindow>
        <StoryCard label="What I capture" title="Intent behind the rough wording" accent="gold">
          <div className="story-stack">
            <div className={`story-line-item${focus === "rough" ? " story-line-item-active" : ""}`}>
              Problem: clients feel lost while submitting requests.
            </div>
            <div className="story-line-item">Control: internal review must happen before release.</div>
            <div className="story-line-item">Outcome: fewer bad submissions and safer publishing.</div>
            <div className="story-line-item">Unknowns: required fields, approval roles, edge cases.</div>
          </div>
        </StoryCard>
      </div>
    </SceneShell>
  );
}

export function ClientStoryNotesScene() {
  const [view, setView] = useState("capture");

  return (
    <SceneShell
      eyebrow="Phase 2"
      title="The conversation becomes rough notes you can actually react to"
      footer="This is where memory turns into a shared artifact."
    >
      <SceneTabs
        tabs={[
          { id: "capture", label: "Raw capture" },
          { id: "structured", label: "Structured notes" },
        ]}
        value={view}
        onChange={setView}
      />
      <div className="story-grid story-grid-two">
        <MiniWindow title="Meeting notes">
          {view === "capture" ? (
            <div className="story-notes-raw">
              <p>client says submission is messy</p>
              <p>team wants approval before publish</p>
              <p>maybe multiple request types?</p>
              <p>what fields are always required?</p>
              <p>need status visibility?</p>
              <p>important: do not let incomplete requests go live</p>
            </div>
          ) : (
            <div className="story-notion-board">
              <div className="story-notion-col">
                <h4>Goals</h4>
                <span>Reduce confusion</span>
                <span>Protect publishing</span>
              </div>
              <div className="story-notion-col">
                <h4>Users</h4>
                <span>Client submitter</span>
                <span>Internal reviewer</span>
              </div>
              <div className="story-notion-col">
                <h4>Open questions</h4>
                <span>Required fields?</span>
                <span>Approval rules?</span>
              </div>
            </div>
          )}
        </MiniWindow>
        <StoryCard label="What changes here" title="Messy input becomes organized scope" accent="green">
          <div className="story-check-grid">
            <div>
              <StoryPill tone="accent">Goals</StoryPill>
              <p>What success looks like once this exists.</p>
            </div>
            <div>
              <StoryPill tone="accent">Users</StoryPill>
              <p>Who submits, who reviews, who decides.</p>
            </div>
            <div>
              <StoryPill tone="accent">Workflow</StoryPill>
              <p>What happens from first input to approval.</p>
            </div>
            <div>
              <StoryPill tone="accent">Risks</StoryPill>
              <p>Where confusion or accidental publishing could happen.</p>
            </div>
          </div>
        </StoryCard>
      </div>
    </SceneShell>
  );
}

export function ClientStoryRequirementsScene() {
  const [active, setActive] = useState("needs");
  const details: Record<string, string[]> = {
    needs: [
      "Client needs a guided path that does not feel overwhelming.",
      "Reviewer needs a clear queue before anything reaches production.",
    ],
    behavior: [
      "System stores every submission in review status first.",
      "System blocks publishing until approval is recorded.",
    ],
    acceptance: [
      "Client can submit without confusion.",
      "Reviewer can approve or reject with full context.",
    ],
    open: [
      "Who can override a rejection?",
      "Which fields are mandatory for every request type?",
    ],
  };

  return (
    <SceneShell
      eyebrow="Phase 3"
      title="Notes become requirements instead of staying as loose observations"
      footer="This is the point where the feature becomes specific enough to design safely."
    >
      <SceneTabs
        tabs={[
          { id: "needs", label: "User needs" },
          { id: "behavior", label: "Expected behavior" },
          { id: "acceptance", label: "Acceptance" },
          { id: "open", label: "Open decisions" },
        ]}
        value={active}
        onChange={setActive}
      />
      <div className="story-grid story-grid-two">
        <StoryCard label="Requirements map" title="Organized into decision buckets">
          <div className="story-quad-grid">
            {[
              ["needs", "User needs"],
              ["behavior", "Expected behavior"],
              ["acceptance", "Acceptance"],
              ["open", "Open decisions"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`story-panel-btn${active === id ? " story-panel-btn-active" : ""}`}
                onClick={() => setActive(id)}
              >
                <span>{label}</span>
                <small>{details[id].length} items</small>
              </button>
            ))}
          </div>
        </StoryCard>
        <MiniWindow title="Focused requirement detail">
          <div className="story-stack">
            {details[active].map((item) => (
              <div key={item} className="story-detail-row">
                <span className="story-detail-dot" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </MiniWindow>
      </div>
    </SceneShell>
  );
}

export function ClientStoryStoriesScene() {
  const [mode, setMode] = useState("story");

  return (
    <SceneShell
      eyebrow="Phase 4"
      title="I translate rough language into user stories or BDD"
      footer="You do not need to speak in product language for the project to gain structure."
    >
      <SceneTabs
        tabs={[
          { id: "story", label: "User story" },
          { id: "bdd", label: "BDD scenario" },
        ]}
        value={mode}
        onChange={setMode}
      />
      <div className="story-grid story-grid-two">
        <StoryCard label="What you might say" title="Rough wording from the meeting" accent="pink">
          <blockquote className="story-quote">
            I want clients to send requests without getting lost, and I want my team to review
            them before anything goes live.
          </blockquote>
        </StoryCard>
        <MiniWindow title={mode === "story" ? "Translated into user stories" : "Translated into behavior"}>
          {mode === "story" ? (
            <div className="story-stack">
              <div className="story-script-line">
                As a client, I want a guided request flow so I can send the right information
                without confusion.
              </div>
              <div className="story-script-line">
                As an internal reviewer, I want every request to enter a review queue before
                publication so nothing goes live without approval.
              </div>
            </div>
          ) : (
            <pre className="story-script-pre">{`Scenario: A client submits a request for review
Given the client has completed the required information
When the request is submitted
Then the system stores it in a review state
And the internal team can approve it before it goes live`}</pre>
          )}
        </MiniWindow>
      </div>
    </SceneShell>
  );
}

export function ClientStoryFigmaScene() {
  const [screen, setScreen] = useState("submit");

  const screens = {
    submit: {
      title: "Request form",
      lines: ["Project goal", "Request type", "Required files", "Primary CTA: Send for review"],
    },
    review: {
      title: "Internal review",
      lines: ["Submission summary", "Attachments", "Approve", "Request changes"],
    },
    live: {
      title: "Published outcome",
      lines: ["Approved request", "Status timeline", "Live confirmation", "Audit history"],
    },
  };

  return (
    <SceneShell
      eyebrow="Phase 5"
      title="Requirements become visible as UI flow and Figma screens"
      footer="At this point, you are no longer reacting to an abstract idea. You are reacting to a visible flow."
    >
      <SceneTabs
        tabs={[
          { id: "submit", label: "Submission" },
          { id: "review", label: "Review" },
          { id: "live", label: "Release" },
        ]}
        value={screen}
        onChange={setScreen}
      />
      <div className="story-figma-board">
        {Object.entries(screens).map(([id, scene]) => (
          <div key={id} className={`story-phone${screen === id ? " story-phone-active" : ""}`}>
            <div className="story-phone-top">{scene.title}</div>
            <div className="story-phone-body">
              {scene.lines.map((line) => (
                <div key={line} className="story-phone-line">
                  {line}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SceneShell>
  );
}

export function ClientStoryReviewScene() {
  const [comment, setComment] = useState("meaning");
  const comments: Record<string, { title: string; body: string; marker: string }> = {
    meaning: {
      title: "This is not what I meant",
      body: "The client notices the flow is technically correct but misses the real intent.",
      marker: "Intent mismatch",
    },
    confusing: {
      title: "This step feels confusing",
      body: "A review meeting surfaces friction before code gets written.",
      marker: "Flow friction",
    },
    missing: {
      title: "An important case is missing",
      body: "Commenting here is cheaper than discovering the gap after development.",
      marker: "Missing state",
    },
  };

  return (
    <SceneShell
      eyebrow="Phase 6"
      title="The design review is where misunderstandings surface early"
      footer="This checkpoint exists so the client can react to something specific before implementation begins."
    >
      <SceneTabs
        tabs={[
          { id: "meaning", label: "Meaning" },
          { id: "confusing", label: "Confusing step" },
          { id: "missing", label: "Missing case" },
        ]}
        value={comment}
        onChange={setComment}
      />
      <div className="story-grid story-grid-two">
        <MiniWindow title="Design review">
          <div className="story-review-canvas">
            <div className="story-review-frame story-review-frame-primary">
              Submission flow
              <span className="story-review-marker">{comments[comment].marker}</span>
            </div>
            <div className="story-review-frame">Reviewer queue</div>
            <div className="story-review-frame">Approval state</div>
          </div>
        </MiniWindow>
        <StoryCard label="Client feedback" title={comments[comment].title} accent="gold">
          <p>{comments[comment].body}</p>
          <div className="story-comment-thread">
            <div className="story-comment">
              <strong>Client:</strong> {comments[comment].title}
            </div>
            <div className="story-comment story-comment-you">
              <strong>Response:</strong> Good catch. We should fix the meaning here before any
              implementation starts.
            </div>
          </div>
        </StoryCard>
      </div>
    </SceneShell>
  );
}

export function ClientStoryIterationScene() {
  const [version, setVersion] = useState("before");

  return (
    <SceneShell
      eyebrow="Phase 7"
      title="If the design is off, we revise it instead of forcing it forward"
      footer="Iteration is part of the process. The first draft is not the contract."
    >
      <SceneTabs
        tabs={[
          { id: "before", label: "Before feedback" },
          { id: "after", label: "After revision" },
        ]}
        value={version}
        onChange={setVersion}
      />
      <div className="story-grid story-grid-two">
        <StoryCard
          label={version === "before" ? "Version A" : "Version B"}
          title={version === "before" ? "Too much on one screen" : "Cleaner guided flow"}
          accent={version === "before" ? "pink" : "green"}
        >
          <div className="story-wire-stack">
            <div className="story-wire-box" />
            <div className="story-wire-box" />
            <div className={`story-wire-box${version === "after" ? " story-wire-box-short" : ""}`} />
          </div>
        </StoryCard>
        <MiniWindow title="What changed">
          <div className="story-stack">
            {version === "before" ? (
              <>
                <div className="story-detail-row"><span className="story-detail-dot" />Too many decisions in one step</div>
                <div className="story-detail-row"><span className="story-detail-dot" />Review action is visually buried</div>
                <div className="story-detail-row"><span className="story-detail-dot" />Important status is easy to miss</div>
              </>
            ) : (
              <>
                <div className="story-detail-row"><span className="story-detail-dot" />Submission split into cleaner stages</div>
                <div className="story-detail-row"><span className="story-detail-dot" />Review queue is explicit and visible</div>
                <div className="story-detail-row"><span className="story-detail-dot" />Approval status is obvious at every step</div>
              </>
            )}
          </div>
        </MiniWindow>
      </div>
    </SceneShell>
  );
}

export function ClientStoryImplementationScene() {
  const [track, setTrack] = useState("frontend");

  const labels: Record<string, string[]> = {
    frontend: ["Guided form flow", "Validation states", "Reviewer dashboard"],
    backend: ["Submission service", "Approval rules", "Audit logging"],
    data: ["Request table", "Status history", "Attachments metadata"],
    integration: ["Email notification", "Role checks", "Deployment hooks"],
  };

  return (
    <SceneShell
      eyebrow="Phase 8"
      title="Implementation starts after the direction is clear"
      footer="At this stage, coding is execution against aligned requirements, not guessing."
    >
      <SceneTabs
        tabs={[
          { id: "frontend", label: "Frontend" },
          { id: "backend", label: "Backend" },
          { id: "data", label: "Data" },
          { id: "integration", label: "Integration" },
        ]}
        value={track}
        onChange={setTrack}
      />
      <div className="story-grid story-grid-two">
        <div className="story-build-grid">
          {Object.keys(labels).map((id) => (
            <button
              key={id}
              type="button"
              className={`story-build-card${track === id ? " story-build-card-active" : ""}`}
              onClick={() => setTrack(id)}
            >
              <span>{id}</span>
              <small>{labels[id].length} tasks</small>
            </button>
          ))}
        </div>
        <MiniWindow title="Current implementation slice">
          <div className="story-stack">
            {labels[track].map((item) => (
              <div key={item} className="story-detail-row">
                <span className="story-status-dot story-status-dot-working" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </MiniWindow>
      </div>
    </SceneShell>
  );
}

export function ClientStoryTestingScene() {
  const [lane, setLane] = useState("flow");

  const checks: Record<string, string[]> = {
    flow: ["Client can submit successfully", "Reviewer receives the request", "Approval updates status"],
    edge: ["Missing fields are blocked", "Rejected requests stay out of production", "Attachments fail safely"],
    states: ["Empty state is understandable", "Validation state is visible", "Approved state is final and clear"],
  };

  return (
    <SceneShell
      eyebrow="Phase 9"
      title="After the module is built, it has to prove itself in testing"
      footer="The build is not finished because code exists. It is finished when behavior is reliable."
    >
      <SceneTabs
        tabs={[
          { id: "flow", label: "Flow checks" },
          { id: "edge", label: "Edge cases" },
          { id: "states", label: "UI states" },
        ]}
        value={lane}
        onChange={setLane}
      />
      <div className="story-grid story-grid-two">
        <StoryCard label="QA board" title="Validation in progress" accent="blue">
          <div className="story-progress">
            <div className="story-progress-bar" style={{ width: lane === "flow" ? "72%" : lane === "edge" ? "84%" : "91%" }} />
          </div>
          <div className="story-kpi-row">
            <div><strong>12</strong><span>checks passed</span></div>
            <div><strong>3</strong><span>active review items</span></div>
            <div><strong>1</strong><span>blocked state</span></div>
          </div>
        </StoryCard>
        <MiniWindow title="Current verification lane">
          <div className="story-stack">
            {checks[lane].map((item) => (
              <div key={item} className="story-detail-row">
                <span className="story-status-dot story-status-dot-good" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </MiniWindow>
      </div>
    </SceneShell>
  );
}

export function ClientStoryIssuesScene() {
  const [stage, setStage] = useState("found");
  const states: Record<string, { title: string; items: string[] }> = {
    found: {
      title: "Issue discovered",
      items: ["Approval banner is missing after review", "Audit row does not render on mobile"],
    },
    fixing: {
      title: "Fix in progress",
      items: ["Patch approval state component", "Adjust mobile layout and retest affected screens"],
    },
    retest: {
      title: "Retesting",
      items: ["Re-run approval flow", "Check regression around reviewer timeline"],
    },
    done: {
      title: "Resolved",
      items: ["Approval banner confirmed", "Mobile audit row verified"],
    },
  };

  return (
    <SceneShell
      eyebrow="Phase 10"
      title="Issues found in testing are handled in a clear loop"
      footer="Finding bugs here is a sign the quality process is working."
    >
      <SceneTabs
        tabs={[
          { id: "found", label: "Found" },
          { id: "fixing", label: "Fixing" },
          { id: "retest", label: "Retest" },
          { id: "done", label: "Resolved" },
        ]}
        value={stage}
        onChange={setStage}
      />
      <div className="story-grid story-grid-two">
        <div className="story-kanban">
          {Object.entries(states).map(([id, value]) => (
            <div key={id} className={`story-kanban-col${stage === id ? " story-kanban-col-active" : ""}`}>
              <h4>{value.title}</h4>
              {value.items.map((item) => (
                <div key={item} className="story-kanban-card">
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>
        <StoryCard label="Current loop" title={states[stage].title} accent="gold">
          <div className="story-stack">
            {states[stage].items.map((item) => (
              <div key={item} className="story-detail-row">
                <span className="story-detail-dot" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </StoryCard>
      </div>
    </SceneShell>
  );
}

export function ClientStoryLaunchScene() {
  const [view, setView] = useState("deploy");

  return (
    <SceneShell
      eyebrow="Phase 11"
      title="The process ends with a live module, not a pile of drafts"
      footer="The original rough idea has now moved through clarification, design, build, testing, and release."
    >
      <SceneTabs
        tabs={[
          { id: "deploy", label: "Deploy log" },
          { id: "live", label: "Live checks" },
        ]}
        value={view}
        onChange={setView}
      />
      <div className="story-grid story-grid-two">
        <MiniWindow title={view === "deploy" ? "Release pipeline" : "Production confirmation"}>
          {view === "deploy" ? (
            <pre className="story-script-pre">{`build complete
migrations safe
release candidate approved
deploying to production
health checks passing
module status: live`}</pre>
          ) : (
            <div className="story-live-grid">
              <div className="story-live-card">
                <strong>Module</strong>
                <span>Live</span>
              </div>
              <div className="story-live-card">
                <strong>Requests</strong>
                <span>Flowing correctly</span>
              </div>
              <div className="story-live-card">
                <strong>Review queue</strong>
                <span>Receiving new items</span>
              </div>
              <div className="story-live-card">
                <strong>Status</strong>
                <span>Stable after launch</span>
              </div>
            </div>
          )}
        </MiniWindow>
        <StoryCard label="Outcome" title="From rough idea to live module" accent="green">
          <div className="story-stack">
            <div className="story-detail-row">
              <span className="story-status-dot story-status-dot-good" />
              <span>Clarified through meetings and notes</span>
            </div>
            <div className="story-detail-row">
              <span className="story-status-dot story-status-dot-good" />
              <span>Validated through stories, design, and iteration</span>
            </div>
            <div className="story-detail-row">
              <span className="story-status-dot story-status-dot-good" />
              <span>Delivered through implementation, testing, and launch</span>
            </div>
          </div>
        </StoryCard>
      </div>
    </SceneShell>
  );
}
