import React, { useState, useEffect } from 'react';
import { Github, Linkedin, Twitter, ArrowDown, Download } from 'lucide-react';
import { getAssetUrl } from '../utils/url.ts';

interface HeroProps {
  settings: {
    name: string;
    title: string;
    bio: string;
    resumeUrl: string;
    githubUrl: string;
    linkedinUrl: string;
    twitterUrl: string;
    avatarUrl: string;
    heroBgUrl: string;
  };
}

export default function Hero({ settings }: HeroProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  const roles = [
    settings.title || 'Full Stack Engineer',
    'System Architect',
    'Open Source Contributor',
    'UI/UX Enthusiast'
  ];

  useEffect(() => {
    const handleTyping = () => {
      const fullText = roles[currentWordIndex];
      
      if (!isDeleting) {
        setCurrentText(fullText.substring(0, currentText.length + 1));
        if (currentText === fullText) {
          // Pause at the complete word
          setIsDeleting(true);
          setTypingSpeed(1500);
        } else {
          setTypingSpeed(100);
        }
      } else {
        setCurrentText(fullText.substring(0, currentText.length - 1));
        if (currentText === '') {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % roles.length);
          // Pause before typing next word
          setTypingSpeed(400);
        } else {
          setTypingSpeed(50);
        }
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex, settings.title]);

  const handleScrollToProjects = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('projects');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="hero">
      <div className="glow-spot" style={{ top: '10%', left: '5%' }}></div>
      <div className="glow-spot" style={{ bottom: '20%', right: '5%' }}></div>
      
      <div className="container">
        <div className="hero-grid">
          <div className="hero-content">
            <span className="hero-tag">Welcome to my space</span>
            <h1 className="hero-title">
              Hi, I'm <br />
              <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {settings.name || 'Alex Morgan'}
              </span>
            </h1>
            <div className="hero-subtitle">
              I am a <span className="typing-caret" style={{ color: 'var(--accent)', fontWeight: 600 }}>{currentText}</span>
            </div>
            <p className="hero-desc">
              {settings.bio || 'I build scalable, modern web applications. Specialized in full-stack architecture, API design, and highly responsive user interfaces.'}
            </p>

            <div className="hero-cta">
              <a href="#projects" className="btn btn-primary" onClick={handleScrollToProjects}>
                View My Work
              </a>
              {settings.resumeUrl ? (
                <a 
                  href={getAssetUrl(settings.resumeUrl)} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-secondary"
                  download
                >
                  <Download size={16} /> Download Resume
                </a>
              ) : (
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); alert('Resume is currently being updated by Admin.'); }} 
                  className="btn btn-secondary"
                >
                  <Download size={16} /> Download Resume
                </a>
              )}
            </div>

            <div className="hero-socials">
              {settings.githubUrl && (
                <a href={settings.githubUrl} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="GitHub">
                  <Github size={20} />
                </a>
              )}
              {settings.linkedinUrl && (
                <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="LinkedIn">
                  <Linkedin size={20} />
                </a>
              )}
              {settings.twitterUrl && (
                <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Twitter">
                  <Twitter size={20} />
                </a>
              )}
            </div>
          </div>

          <div className="hero-image-container">
            <div className="hero-image-wrapper float-item">
              <img 
                src={getAssetUrl(settings.avatarUrl) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'} 
                alt={settings.name || 'Alex Morgan'} 
                className="hero-image"
              />
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
        <a href="#about" onClick={(e) => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', gap: '4px' }}>
          Scroll Down
          <ArrowDown size={14} className="float-item" />
        </a>
      </div>
    </section>
  );
}
