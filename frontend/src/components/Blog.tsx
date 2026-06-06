import React, { useState } from 'react';
import { Calendar, Clock, ArrowRight, X } from 'lucide-react';
import { getAssetUrl } from '../utils/url.ts';

interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  readTime: string;
  date: string;
  image: string;
  tags: string;
}

interface BlogProps {
  posts: BlogPost[];
}

export default function Blog({ posts }: BlogProps) {
  const [activePost, setActivePost] = useState<BlogPost | null>(null);

  return (
    <section id="blog" className="blog">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Technical Blog</h2>
          <p className="section-subtitle">
            Insights, tutorials, and articles on frontend optimization, backend system designs, and clean software engineering.
          </p>
        </div>

        <div className="blog-grid">
          {posts.map((post) => (
            <article key={post.id} className="blog-card">
              <div className="blog-img-wrapper">
                <img 
                  src={getAssetUrl(post.image) || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=800'} 
                  alt={post.title} 
                  className="blog-img"
                />
              </div>

              <div className="blog-content">
                <div className="blog-meta">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> {post.date}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {post.readTime}
                  </span>
                </div>

                <h3 className="blog-title">
                  <a href="#" onClick={(e) => { e.preventDefault(); setActivePost(post); }}>
                    {post.title}
                  </a>
                </h3>
                
                <p className="blog-summary">{post.summary}</p>
                
                <div className="blog-footer">
                  <span className="blog-category">{post.category}</span>
                  <a 
                    href="#" 
                    className="blog-readmore" 
                    onClick={(e) => { e.preventDefault(); setActivePost(post); }}
                    style={{ color: 'var(--accent)' }}
                  >
                    Read More <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </article>
          ))}

          {posts.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No blog posts published yet.
            </div>
          )}
        </div>
      </div>

      {/* Blog Post Reader Overlay Modal */}
      {activePost && (
        <div className="admin-modal-overlay" onClick={() => setActivePost(null)}>
          <div 
            className="admin-modal glass" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '800px', width: '90%' }}
          >
            <div className="admin-modal-header" style={{ marginBottom: '16px' }}>
              <span className="blog-category" style={{ fontSize: '0.9rem' }}>
                {activePost.category}
              </span>
              <button onClick={() => setActivePost(null)} aria-label="Close Reader">
                <X size={24} />
              </button>
            </div>

            <h2 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '16px' }}>
              {activePost.title}
            </h2>

            <div className="blog-meta" style={{ marginBottom: '24px', fontSize: '0.9rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} /> {activePost.date}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} /> {activePost.readTime}
              </span>
              {activePost.tags && (
                <span style={{ color: 'var(--text-muted)' }}>
                  • Tags: {activePost.tags}
                </span>
              )}
            </div>

            {activePost.image && (
              <img 
                src={getAssetUrl(activePost.image)} 
                alt={activePost.title} 
                style={{ 
                  width: '100%', 
                  maxHeight: '400px', 
                  objectFit: 'cover', 
                  borderRadius: 'var(--border-radius-md)', 
                  marginBottom: '32px' 
                }}
              />
            )}

            <div 
              style={{ 
                fontSize: '1.05rem', 
                lineHeight: 1.8, 
                color: 'var(--text-secondary)', 
                whiteSpace: 'pre-line' 
              }}
            >
              {activePost.content}
            </div>

            <div className="admin-modal-footer" style={{ marginTop: '40px' }}>
              <button className="btn btn-secondary" onClick={() => setActivePost(null)}>
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
