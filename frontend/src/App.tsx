import React, { useState, useEffect } from 'react';
import { ArrowUp, User } from 'lucide-react';
import confetti from 'canvas-confetti';

import LoadingScreen from './components/LoadingScreen.tsx';
import Navbar from './components/Navbar.tsx';
import Hero from './components/Hero.tsx';
import About from './components/About.tsx';
import Skills from './components/Skills.tsx';
import Projects from './components/Projects.tsx';
import Education from './components/Education.tsx';
import Testimonials from './components/Testimonials.tsx';
import Blog from './components/Blog.tsx';
import Contact from './components/Contact.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import { processHtmlContent } from './utils/url.ts';

const API_BASE = import.meta.env.VITE_API_URL || 'https://my-portfolio-7zd9.onrender.com';

// Global Data Schemas
interface PortfolioData {
  settings: {
    name: string;
    title: string;
    bio: string;
    email: string;
    phone: string;
    address: string;
    resumeUrl: string;
    githubUrl: string;
    linkedinUrl: string;
    twitterUrl: string;
    avatarUrl: string;
    heroBgUrl: string;
    showAbout?: boolean;
    showSkills?: boolean;
    showProjects?: boolean;
    showEducation?: boolean;
    showTestimonials?: boolean;
    showBlog?: boolean;
    showContact?: boolean;
    sectionOrder?: string[];
  };
  projects: any[];
  skills: any[];
  education: any[];
  testimonials: any[];
  blogs: any[];
  customSections: any[];
  visitorCount: number;
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Unified Portfolio Data State
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    settings: {
      name: 'Alex Morgan',
      title: 'Senior Full Stack Engineer',
      bio: '',
      email: '',
      phone: '',
      address: '',
      resumeUrl: '',
      githubUrl: '',
      linkedinUrl: '',
      twitterUrl: '',
      avatarUrl: '',
      heroBgUrl: '',
      showAbout: true,
      showSkills: true,
      showProjects: true,
      showEducation: true,
      showTestimonials: true,
      showBlog: true,
      showContact: true,
    },
    projects: [],
    skills: [],
    education: [],
    testimonials: [],
    blogs: [],
    customSections: [],
    visitorCount: 0,
  });

  // Fetch all public listings
  const fetchData = async () => {
    try {
      const cacheBust = `?t=${Date.now()}`;
      const [settingsRes, projectsRes, skillsRes, eduRes, testRes, blogRes, visitorRes, customRes] = await Promise.all([
        fetch(`${API_BASE}/api/settings${cacheBust}`),
        fetch(`${API_BASE}/api/projects${cacheBust}`),
        fetch(`${API_BASE}/api/skills${cacheBust}`),
        fetch(`${API_BASE}/api/education${cacheBust}`),
        fetch(`${API_BASE}/api/testimonials${cacheBust}`),
        fetch(`${API_BASE}/api/blog${cacheBust}`),
        fetch(`${API_BASE}/api/visitor${cacheBust}`),
        fetch(`${API_BASE}/api/custom-sections${cacheBust}`),
      ]);

      const data: Partial<PortfolioData> = {};
      if (settingsRes.ok) data.settings = await settingsRes.json();
      if (projectsRes.ok) data.projects = await projectsRes.json();
      if (skillsRes.ok) data.skills = await skillsRes.json();
      if (eduRes.ok) data.education = await eduRes.json();
      if (testRes.ok) data.testimonials = await testRes.json();
      if (blogRes.ok) data.blogs = await blogRes.json();
      if (customRes.ok) data.customSections = await customRes.json();
      if (visitorRes.ok) {
        const v = await visitorRes.json();
        data.visitorCount = v.count;
      }

      setPortfolioData((prev) => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Failed to load portfolio database assets', error);
    }
  };

  // 1. Theme and session check on init
  useEffect(() => {
    // Theme Initialisation
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);

    // Verify Session Token
    const verifySession = async () => {
      if (token) {
        try {
          const res = await fetch(`${API_BASE}/api/auth/verify`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!res.ok) {
            handleLogout();
          }
        } catch {
          handleLogout();
        }
      }
    };
    verifySession();

    // Listen to hash change for admin panel route
    const handleHashChange = () => {
      setIsAdminMode(window.location.hash === '#admin');
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // check on mount

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 1b. Fetch fresh data when admin mode is exited or on mount
  useEffect(() => {
    if (!isAdminMode) {
      fetchData();
    }
  }, [isAdminMode]);

  // 2. Increment visitor count (once per session)
  useEffect(() => {
    const incrementVisitor = async () => {
      const alreadyVisited = sessionStorage.getItem('visited');
      if (!alreadyVisited) {
        try {
          const res = await fetch(`${API_BASE}/api/visitor/increment`, { method: 'POST' });
          if (res.ok) {
            const data = await res.json();
            setPortfolioData((prev) => ({ ...prev, visitorCount: data.count }));
            sessionStorage.setItem('visited', 'true');
          }
        } catch (error) {
          console.error('Failed to update visitor counter', error);
        }
      }
    };
    
    // Only run after loader clears
    if (!isLoading) {
      incrementVisitor();
    }
  }, [isLoading]);

  // 3. Scroll Listener for Back to Top Button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 4. Scroll Animations (AOS replacement)
  useEffect(() => {
    if (isLoading || isAdminMode) return;

    // Intersection observer for fading/sliding in elements on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    // Make sections and elements animate
    const animElements = document.querySelectorAll(
      'section, .project-card, .skills-card, .timeline-item, .blog-card, .contact-info, .contact-card-box'
    );

    animElements.forEach((el) => {
      el.classList.add('fade-up-element');
      observer.observe(el);
    });

    return () => {
      animElements.forEach((el) => observer.unobserve(el));
    };
  }, [isLoading, isAdminMode, portfolioData]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  const handleLogin = (newToken: string) => {
    localStorage.setItem('adminToken', newToken);
    setToken(newToken);
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    setIsAdminMode(false);
    window.location.hash = '';
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {isLoading ? (
        <LoadingScreen onComplete={() => setIsLoading(false)} />
      ) : (
        <>
          <Navbar 
            theme={theme}
            toggleTheme={toggleTheme}
            isAdminMode={isAdminMode}
            setIsAdminMode={setIsAdminMode}
            isAuthenticated={!!token}
            onLogout={handleLogout}
            portfolioName={portfolioData.settings.name}
            settings={portfolioData.settings}
            customSections={portfolioData.customSections}
          />

          {!isAdminMode ? (
            <>
              <Hero settings={portfolioData.settings} />
              
              {(portfolioData.settings.sectionOrder || ['about', 'skills', 'projects', 'education', 'testimonials', 'blog', 'contact']).map((sectionId) => {
                if (sectionId === 'about' && portfolioData.settings.showAbout !== false) {
                  return (
                    <About 
                      key="about"
                      settings={portfolioData.settings} 
                      projectsCount={portfolioData.projects.length}
                      blogsCount={portfolioData.blogs.length}
                    />
                  );
                }
                if (sectionId === 'skills' && portfolioData.settings.showSkills !== false) {
                  return <Skills key="skills" skills={portfolioData.skills} />;
                }
                if (sectionId === 'projects' && portfolioData.settings.showProjects !== false) {
                  return <Projects key="projects" projects={portfolioData.projects} />;
                }
                if (sectionId === 'education' && portfolioData.settings.showEducation !== false) {
                  return <Education key="education" education={portfolioData.education} />;
                }
                if (sectionId === 'testimonials' && portfolioData.settings.showTestimonials !== false) {
                  return <Testimonials key="testimonials" testimonials={portfolioData.testimonials} />;
                }
                if (sectionId === 'blog' && portfolioData.settings.showBlog !== false) {
                  return <Blog key="blog" posts={portfolioData.blogs} />;
                }
                if (sectionId === 'contact' && portfolioData.settings.showContact !== false) {
                  return <Contact key="contact" settings={portfolioData.settings} />;
                }
                
                if (sectionId.startsWith('custom_')) {
                  const customSec = portfolioData.customSections.find(cs => cs.id === sectionId);
                  if (customSec && customSec.show !== false) {
                    return (
                      <section key={customSec.id} id={customSec.id} className="custom-section">
                        <div className="container">
                          <div className="section-header">
                            <h2 className="section-title">{customSec.title}</h2>
                          </div>
                          <div 
                            className="glass"
                            style={{ 
                              padding: '40px', 
                              borderRadius: 'var(--border-radius-md)', 
                              lineHeight: 1.8, 
                              fontSize: '1.05rem', 
                              color: 'var(--text-secondary)'
                            }}
                            dangerouslySetInnerHTML={{ __html: processHtmlContent(customSec.content) }}
                          />
                        </div>
                      </section>
                    );
                  }
                }
                return null;
              })}

              <footer className="footer">
                <div className="footer-container">
                  <div className="footer-copy">
                    &copy; {new Date().getFullYear()} {portfolioData.settings.name}. All rights reserved.
                  </div>
                  <div className="visitor-badge">
                    <User size={14} /> Visitors: <strong>{portfolioData.visitorCount}</strong>
                  </div>
                </div>
              </footer>
            </>
          ) : (
            <AdminDashboard 
              token={token} 
              onLogin={handleLogin}
              refetchData={fetchData}
            />
          )}

          {/* Floating Action Elements */}
          <button 
            className={`back-to-top glass ${showBackToTop ? 'visible' : ''}`}
            onClick={handleScrollToTop}
            aria-label="Back to Top"
          >
            <ArrowUp size={20} />
          </button>
        </>
      )}
    </>
  );
}
