import React, { useState } from 'react';
import { Github, ExternalLink } from 'lucide-react';
import { getAssetUrl } from '../utils/url.ts';

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  technologies: string;
  github: string;
  demo: string;
  category: string;
}

interface ProjectsProps {
  projects: Project[];
}

export default function Projects({ projects }: ProjectsProps) {
  const [activeCategory, setActiveCategory] = useState('All');

  // Dynamically extract distinct categories
  const categories = ['All', ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))];

  // Filter projects by selected category
  const filteredProjects = activeCategory === 'All' 
    ? projects 
    : projects.filter((p) => p.category === activeCategory);

  return (
    <section id="projects" className="projects" style={{ background: 'var(--bg-tertiary)' }}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Featured Projects</h2>
          <p className="section-subtitle">
            A curated showcase of applications and libraries I have built, displaying the technologies used.
          </p>
        </div>

        {/* Categories Filter Tabs */}
        {categories.length > 1 && (
          <div className="projects-filter">
            {categories.map((category) => (
              <button
                key={category}
                className={`filter-btn ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Projects Grid */}
        <div className="projects-grid">
          {filteredProjects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-img-wrapper">
                <img 
                  src={getAssetUrl(project.image) || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800'} 
                  alt={project.title} 
                  className="project-img"
                />
                <span className="project-badge">{project.category || 'Development'}</span>
              </div>

              <div className="project-content">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-desc">{project.description}</p>
                <div className="project-tech">
                  {project.technologies.split(',').map((tech) => (
                    <span 
                      key={tech} 
                      style={{ 
                        display: 'inline-block', 
                        padding: '4px 10px', 
                        fontSize: '0.75rem', 
                        background: 'var(--bg-tertiary)', 
                        color: 'var(--text-secondary)',
                        borderRadius: 'var(--border-radius-sm)',
                        marginRight: '6px',
                        marginBottom: '6px',
                        fontWeight: 500
                      }}
                    >
                      {tech.trim()}
                    </span>
                  ))}
                </div>

                <div className="project-links">
                  {project.github && (
                    <a 
                      href={project.github} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="project-link-btn"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}
                    >
                      <Github size={16} /> Code
                    </a>
                  )}
                  {project.demo && (
                    <a 
                      href={project.demo} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="project-link-btn"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)' }}
                    >
                      <ExternalLink size={16} /> Live Demo
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredProjects.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No projects found in this category.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
