import React from 'react';
import { GraduationCap } from 'lucide-react';

interface EducationEntry {
  id: string;
  degree: string;
  institution: string;
  duration: string;
  description: string;
}

interface EducationProps {
  education: EducationEntry[];
}

export default function Education({ education }: EducationProps) {
  return (
    <section id="education" className="education">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Education & Credentials</h2>
          <p className="section-subtitle">
            An overview of my academic history and engineering foundations.
          </p>
        </div>

        <div className="timeline">
          {education.map((edu, index) => (
            <div key={edu.id} className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-card">
                <span className="timeline-duration">{edu.duration}</span>
                <h3 className="timeline-degree">
                  {edu.degree}
                </h3>
                <h4 className="timeline-inst">
                  {edu.institution}
                </h4>
                <p className="timeline-desc">{edu.description}</p>
              </div>
            </div>
          ))}

          {education.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No education credentials listed.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
