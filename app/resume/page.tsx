import type { Metadata } from "next";
import { getResume } from "@/lib/resume";

export const metadata: Metadata = {
  title: "Resume",
  description: "Backend engineer — Go, TypeScript, distributed systems.",
};

export default function ResumePage() {
  const resume = getResume();

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 860 }}>
        <div className="reveal">

          {/* Header */}
          <div className="resume-header">
            <h1 className="resume-name">Medhat Mohammed</h1>
            <div className="resume-contact">
              <span>Cairo, Egypt</span>
              <a href="mailto:mdht.muhd@gmail.com">mdht.muhd@gmail.com</a>
              <a href="https://linkedin.com/in/mdht-mohd" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href="https://github.com/standard-librarian" target="_blank" rel="noopener noreferrer">GitHub</a>
            </div>
          </div>

          {/* Work Experience */}
          <div className="resume-section">
            <h2 className="resume-section-title">Work Experience</h2>
            {resume.work.map((job, i) => (
              <div key={i} className="resume-entry">
                <div className="resume-entry-header">
                  <span className="resume-entry-title">{job.title}</span>
                  <span className="resume-entry-period">{job.period}</span>
                </div>
                <div className="resume-entry-sub">
                  {job.org}{job.location ? ` · ${job.location}` : ""}
                </div>
                <ul className="resume-bullets">
                  {job.bullets.map((b, j) => (
                    <li
                      key={j}
                      className="resume-bullet"
                      dangerouslySetInnerHTML={{ __html: b }}
                    />
                  ))}
                </ul>
                {job.skills.length > 0 && (
                  <div className="resume-skills">
                    {job.skills.map((s) => (
                      <span key={s} className="tag">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Projects */}
          <div className="resume-section">
            <h2 className="resume-section-title">Projects</h2>
            {resume.projects.map((p, i) => (
              <div key={i} className="resume-entry">
                <div className="resume-entry-header">
                  <span className="resume-entry-title">{p.name}</span>
                </div>
                <div className="resume-project-tech">{p.tech}</div>
                <ul className="resume-bullets">
                  {p.bullets.map((b, j) => (
                    <li
                      key={j}
                      className="resume-bullet"
                      dangerouslySetInnerHTML={{ __html: b }}
                    />
                  ))}
                </ul>
                {p.link && (
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resume-link"
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
                    </svg>
                    GitHub
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Volunteer */}
          {resume.volunteer.length > 0 && (
            <div className="resume-section">
              <h2 className="resume-section-title">Volunteer Experience</h2>
              {resume.volunteer.map((v, i) => (
                <div key={i} className="resume-entry">
                  <div className="resume-entry-header">
                    <span className="resume-entry-title">{v.title}</span>
                    <span className="resume-entry-period">{v.period}</span>
                  </div>
                  <div className="resume-entry-sub">{v.org}</div>
                  <ul className="resume-bullets">
                    {v.bullets.map((b, j) => (
                      <li
                        key={j}
                        className="resume-bullet"
                        dangerouslySetInnerHTML={{ __html: b }}
                      />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          <div className="resume-section">
            <h2 className="resume-section-title">Education</h2>
            <div className="resume-entry" style={{ borderBottom: "none" }}>
              <div className="resume-entry-header">
                <span className="resume-edu-institution">{resume.education.institution}</span>
                <span className="resume-entry-period">{resume.education.location}</span>
              </div>
              <div className="resume-edu-degree">{resume.education.degree}</div>
            </div>
          </div>

          {/* Scholarship */}
          {resume.scholarship.length > 0 && (
            <div className="resume-section">
              <h2 className="resume-section-title">Training</h2>
              {resume.scholarship.map((s, i) => (
                <div key={i} className="resume-entry" style={i === resume.scholarship.length - 1 ? { borderBottom: "none" } : {}}>
                  <div className="resume-entry-header">
                    <span className="resume-entry-title">{s.title}</span>
                    <span className="resume-entry-period">{s.period}</span>
                  </div>
                  <div className="resume-entry-sub">{s.org}</div>
                  <ul className="resume-bullets">
                    {s.bullets.map((b, j) => (
                      <li
                        key={j}
                        className="resume-bullet"
                        dangerouslySetInnerHTML={{ __html: b }}
                      />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Interests */}
          {resume.interests.length > 0 && (
            <div className="resume-section">
              <h2 className="resume-section-title">Interests</h2>
              <div className="resume-interests">
                {resume.interests.map((item, i) => (
                  <span key={i} className="resume-interest">{item}</span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
