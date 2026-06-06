import React, { useEffect, useState } from 'react';
import { Layers, Server, Terminal, Database, Cloud, Star } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  level: number;
  category: string;
}

interface SkillsProps {
  skills: Skill[];
}

export default function Skills({ skills }: SkillsProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger progress animation on mount
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Group skills by category
  const groupedSkills = skills.reduce((acc, skill) => {
    const cat = skill.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'frontend':
        return <Layers size={18} />;
      case 'backend':
        return <Server size={18} />;
      case 'languages':
        return <Terminal size={18} />;
      case 'database':
      case 'databases':
        return <Database size={18} />;
      case 'devops':
      case 'cloud':
        return <Cloud size={18} />;
      default:
        return <Star size={18} />;
    }
  };

  return (
    <section id="skills" className="skills">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Professional Skills</h2>
          <p className="section-subtitle">
            A comprehensive overview of my technical capabilities and proficiency across various domains.
          </p>
        </div>

        <div className="skills-categories">
          {Object.entries(groupedSkills).map(([category, skillList]) => (
            <div key={category} className="skills-card">
              <h3 className="skills-card-title">
                {getCategoryIcon(category)}
                <span>{category}</span>
              </h3>
              
              <div className="skills-list">
                {skillList.map((skill) => (
                  <div key={skill.id} className="skill-item">
                    <div className="skill-info">
                      <span>{skill.name}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{skill.level}%</span>
                    </div>
                    <div className="skill-bar-bg">
                      <div 
                        className="skill-bar-fill"
                        style={{ width: animate ? `${skill.level}%` : '0%' }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
