import React, { useState } from 'react';
import { Mail, Phone, MapPin, Copy, Check, Send } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface ContactProps {
  settings: {
    email: string;
    phone: string;
    address: string;
  };
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export default function Contact({ settings }: ContactProps) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const validate = () => {
    const tempErrors: FormErrors = {};
    if (!formData.name.trim()) {
      tempErrors.name = 'Name is required.';
    } else if (formData.name.trim().length < 2) {
      tempErrors.name = 'Name must be at least 2 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      tempErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.message.trim()) {
      tempErrors.message = 'Message is required.';
    } else if (formData.message.trim().length < 10) {
      tempErrors.message = 'Message must be at least 10 characters.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for field as user types
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('submitting');
    try {
      const response = await fetch(`${API_BASE}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus('success');
        setStatusMessage(result.message || 'Thank you! Your message was delivered.');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
        setStatusMessage(result.error || 'Failed to submit form. Please try again.');
      }
    } catch (err) {
      setStatus('error');
      setStatusMessage('Network error. Check connection and retry.');
    }
  };

  const handleCopyEmail = () => {
    const emailToCopy = settings.email || 'alex.morgan@example.com';
    navigator.clipboard.writeText(emailToCopy);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <section id="contact" className="contact">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Get In Touch</h2>
          <p className="section-subtitle">
            Have a question, project proposal, or just want to connect? Send a message directly.
          </p>
        </div>

        <div className="contact-grid">
          <div className="contact-info">
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>
              Let's Talk Info
            </h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
              Feel free to reach out via the form or contact coordinates below. I typically respond within 24 hours.
            </p>

            <div className="contact-item">
              <div className="contact-icon-wrapper">
                <Mail size={20} />
              </div>
              <div>
                <div className="contact-label">Email Me</div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="contact-value">{settings.email || 'alex.morgan@example.com'}</span>
                  <button 
                    className="contact-copy-btn" 
                    onClick={handleCopyEmail}
                    title="Copy to clipboard"
                    aria-label="Copy Email"
                  >
                    {copied ? <Check size={16} style={{ color: '#10b981' }} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {settings.phone && (
              <div className="contact-item">
                <div className="contact-icon-wrapper">
                  <Phone size={20} />
                </div>
                <div>
                  <div className="contact-label">Call Me</div>
                  <div className="contact-value">{settings.phone}</div>
                </div>
              </div>
            )}

            {settings.address && (
              <div className="contact-item">
                <div className="contact-icon-wrapper">
                  <MapPin size={20} />
                </div>
                <div>
                  <div className="contact-label">Location</div>
                  <div className="contact-value">{settings.address}</div>
                </div>
              </div>
            )}
          </div>

          <div className="contact-card-box">
            <form onSubmit={handleSubmit}>
              {status === 'success' && (
                <div className="form-status form-status-success">{statusMessage}</div>
              )}
              {status === 'error' && (
                <div className="form-status form-status-error">{statusMessage}</div>
              )}

              <div className="form-group">
                <label htmlFor="name" className="form-label">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="input-field"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={status === 'submitting'}
                />
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="input-field"
                  placeholder="johndoe@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={status === 'submitting'}
                />
                {errors.email && <div className="form-error">{errors.email}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="message" className="form-label">Your Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className="input-field"
                  placeholder="Write your message details..."
                  style={{ resize: 'vertical' }}
                  value={formData.message}
                  onChange={handleInputChange}
                  disabled={status === 'submitting'}
                ></textarea>
                {errors.message && <div className="form-error">{errors.message}</div>}
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '8px' }}
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? (
                  <>Sending Message...</>
                ) : (
                  <>
                    <Send size={16} /> Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
