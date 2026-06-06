import React, { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon, LayoutDashboard, User } from 'lucide-react';

interface NavbarProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  isAdminMode: boolean;
  setIsAdminMode: (mode: boolean) => void;
  isAuthenticated: boolean;
  onLogout: () => void;
  portfolioName: string;
  settings: {
    showAbout?: boolean;
    showSkills?: boolean;
    showProjects?: boolean;
    showEducation?: boolean;
    showTestimonials?: boolean;
    showBlog?: boolean;
    showContact?: boolean;
    sectionOrder?: string[];
  };
  customSections?: any[];
}

export default function Navbar({
  theme,
  toggleTheme,
  isAdminMode,
  setIsAdminMode,
  isAuthenticated,
  onLogout,
  portfolioName,
  settings,
  customSections = []
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Section tracker for active nav-link highlighting
      if (!isAdminMode) {
        const order = settings.sectionOrder || ['about', 'skills', 'projects', 'education', 'testimonials', 'blog', 'contact'];
        const sections = ['home', ...order];
        const scrollPosition = window.scrollY + 200;

        for (const section of sections) {
          const el = document.getElementById(section);
          if (el) {
            const top = el.offsetTop;
            const height = el.offsetHeight;
            if (scrollPosition >= top && scrollPosition < top + height) {
              setActiveSection(section);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAdminMode]);

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    setIsAdminMode(false);
    
    // Smooth scrolling navigation
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0] || 'Portfolio';
  };

  return (
    <nav className={`navbar glass ${scrolled ? 'scrolled' : ''} ${mobileMenuOpen ? 'menu-open' : ''}`}>
      <div className="navbar-container">
        <a href="#" className="navbar-logo" onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}>
          <span>&lt;</span>{getFirstName(portfolioName)} <span>/&gt;</span>
        </a>

        {/* Desktop Links */}
        {!isAdminMode ? (
          <ul className="navbar-links">
            <li><a href="#home" className={`nav-link ${activeSection === 'home' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}>Home</a></li>
            {(settings.sectionOrder || ['about', 'skills', 'projects', 'education', 'testimonials', 'blog', 'contact']).map((sectionId) => {
              if (sectionId === 'about' && settings.showAbout !== false) {
                return <li key="about"><a href="#about" className={`nav-link ${activeSection === 'about' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); handleNavClick('about'); }}>About</a></li>;
              }
              if (sectionId === 'skills' && settings.showSkills !== false) {
                return <li key="skills"><a href="#skills" className={`nav-link ${activeSection === 'skills' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); handleNavClick('skills'); }}>Skills</a></li>;
              }
              if (sectionId === 'projects' && settings.showProjects !== false) {
                return <li key="projects"><a href="#projects" className={`nav-link ${activeSection === 'projects' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); handleNavClick('projects'); }}>Projects</a></li>;
              }
              if (sectionId === 'education' && settings.showEducation !== false) {
                return <li key="education"><a href="#education" className={`nav-link ${activeSection === 'education' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); handleNavClick('education'); }}>Education</a></li>;
              }
              if (sectionId === 'blog' && settings.showBlog !== false) {
                return <li key="blog"><a href="#blog" className={`nav-link ${activeSection === 'blog' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); handleNavClick('blog'); }}>Blog</a></li>;
              }
              if (sectionId === 'contact' && settings.showContact !== false) {
                return <li key="contact"><a href="#contact" className={`nav-link ${activeSection === 'contact' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); handleNavClick('contact'); }}>Contact</a></li>;
              }
              if (sectionId.startsWith('custom_')) {
                const customSec = customSections.find(cs => cs.id === sectionId);
                if (customSec && customSec.show !== false) {
                  return (
                    <li key={customSec.id}>
                      <a 
                        href={`#${customSec.id}`} 
                        className={`nav-link ${activeSection === customSec.id ? 'active' : ''}`} 
                        onClick={(e) => { e.preventDefault(); handleNavClick(customSec.id); }}
                      >
                        {customSec.title}
                      </a>
                    </li>
                  );
                }
              }
              return null;
            })}
          </ul>
        ) : (
          <ul className="navbar-links">
            <li><a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); setIsAdminMode(false); }}>&larr; Back to Portfolio</a></li>
          </ul>
        )}

        <div className="navbar-actions">
          {/* Theme Toggle */}
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Admin Dashboard Actions */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                onClick={() => setIsAdminMode(!isAdminMode)}
              >
                {isAdminMode ? <User size={14} /> : <LayoutDashboard size={14} />}
                <span style={{ marginLeft: '4px' }}>{isAdminMode ? 'View Site' : 'Dashboard'}</span>
              </button>
              <button 
                className="btn btn-primary" 
                style={{ padding: '8px 16px', fontSize: '0.85rem', background: '#ef4444' }}
                onClick={onLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              className="btn btn-secondary" 
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              onClick={() => setIsAdminMode(true)}
            >
              <LayoutDashboard size={14} />
              <span style={{ marginLeft: '4px' }}>Admin</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
