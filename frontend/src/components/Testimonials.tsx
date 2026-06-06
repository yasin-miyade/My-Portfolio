import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { getAssetUrl } from '../utils/url.ts';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  message: string;
  avatar: string;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    if (testimonials.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (testimonials.length === 0) return;
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const current = testimonials[currentIndex];

  return (
    <section id="testimonials" className="testimonials" style={{ background: 'var(--bg-tertiary)' }}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Client Testimonials</h2>
          <p className="section-subtitle">
            Feedback and recommendations from product managers, engineering leads, and clients I have worked with.
          </p>
        </div>

        {testimonials.length > 0 ? (
          <div className="testimonials-slider">
            <div className="testimonials-container">
              <div className="testimonial-card">
                <Quote 
                  size={48} 
                  style={{ 
                    color: 'rgba(var(--accent-rgb), 0.1)', 
                    position: 'absolute', 
                    top: '20px', 
                    left: '20px', 
                    zIndex: 0 
                  }} 
                />
                
                <p className="testimonial-quote" style={{ position: 'relative', zIndex: 1 }}>
                  "{current.message}"
                </p>

                <div className="testimonial-author">
                  <img 
                    src={getAssetUrl(current.avatar) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'} 
                    alt={current.name} 
                    className="testimonial-avatar"
                  />
                  <div style={{ textAlign: 'left' }}>
                    <div className="testimonial-name">{current.name}</div>
                    <div className="testimonial-role">
                      {current.role} {current.company && `at ${current.company}`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {testimonials.length > 1 && (
              <div className="testimonials-controls">
                <button 
                  className="slider-btn" 
                  onClick={handlePrev} 
                  aria-label="Previous Testimonial"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  className="slider-btn" 
                  onClick={handleNext} 
                  aria-label="Next Testimonial"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No testimonials added yet.
          </div>
        )}
      </div>
    </section>
  );
}
