import React from 'react';
import { 
  Award, Briefcase, GraduationCap, Code, Heart, Smile, 
  Globe, Coffee, Terminal, Zap, BookOpen, Users, 
  CheckCircle, Calendar, Cpu, FileText, Star 
} from 'lucide-react';
import { getAssetUrl, processHtmlContent } from '../utils/url.ts';

interface AboutProps {
  settings: {
    name: string;
    bio: string;
    avatarUrl: string;
    aboutContent?: string;
    aboutStats?: Array<{
      id: string;
      icon: string;
      value: string;
      label: string;
      show?: boolean;
    }>;
  };
  projectsCount: number;
  blogsCount: number;
}

const IconMap: { [key: string]: React.ComponentType<any> } = {
  Award,
  Briefcase,
  GraduationCap,
  Code,
  Heart,
  Smile,
  Globe,
  Coffee,
  Terminal,
  Zap,
  BookOpen,
  Users,
  CheckCircle,
  Calendar,
  Cpu,
  FileText,
  Star
};

export default function About({ settings, projectsCount, blogsCount }: AboutProps) {
  return (
    <section id="about" className="about" style={{ background: 'var(--bg-tertiary)' }}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">About Me</h2>
          <p className="section-subtitle">
            Get to know my background, experience, and the drive behind my code.
          </p>
        </div>

        <div className="about-grid">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div 
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '380px',
                aspectRatio: '1',
                borderRadius: 'var(--border-radius-md)',
                overflow: 'hidden',
                boxShadow: 'var(--card-shadow)',
                border: '1px solid var(--border)'
              }}
            >
              <img 
                src={getAssetUrl(settings.avatarUrl) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'} 
                alt={settings.name || 'Alex Morgan'} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.4))'
                }}
              ></div>
            </div>
          </div>

          <div className="about-details">
            {settings.aboutContent ? (
              <div 
                className="about-rich-text"
                style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem' }}
                dangerouslySetInnerHTML={{ __html: processHtmlContent(settings.aboutContent) }}
              />
            ) : (
              <>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '20px' }}>
                  Engineering Scalable & Highly Interactive Web Architectures
                </h3>
                <p>
                  {settings.bio || "I'm a passionate Full Stack Software Engineer. I specialize in crafting clean, high-performance web applications using modern methodologies. I believe that writing code is not just about solving logical problems, but also about building premium user experiences that feel fluid, responsive, and intuitive."}
                </p>
                <p>
                  Throughout my engineering journey, I have worked across front-end systems, databases, and microservices. I enjoy streamlining developer pipelines, architecting resilient cloud infrastructure, and writing reusable components.
                </p>
              </>
            )}

            <div className="about-stats">
              {(settings.aboutStats || [
                { id: 'stat_1', icon: 'Award', value: '5+', label: 'Years Experience', show: true },
                { id: 'stat_2', icon: 'Briefcase', value: '{projectsCount}+', label: 'Projects Completed', show: true },
                { id: 'stat_3', icon: 'GraduationCap', value: '{blogsCount}+', label: 'Articles Published', show: true }
              ])
                .filter(s => s.show !== false)
                .map((s) => {
                  const IconComponent = IconMap[s.icon] || Award;
                  
                  let displayValue = s.value;
                  if (typeof displayValue === 'string') {
                    displayValue = displayValue
                      .replace(/\{projectsCount\}/g, String(projectsCount))
                      .replace(/\{blogsCount\}/g, String(blogsCount));
                  }

                  return (
                    <div key={s.id} className="stat-card">
                      <IconComponent className="stat-icon" style={{ color: 'var(--accent)', margin: '0 auto 12px auto' }} />
                      <div className="stat-number">{displayValue}</div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
