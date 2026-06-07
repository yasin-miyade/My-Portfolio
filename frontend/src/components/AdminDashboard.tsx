import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, FolderGit, Award, GraduationCap, 
  MessageSquare, BookOpen, Eye, Edit, Trash2, Plus, X, Upload, CheckCircle, Check, Info
} from 'lucide-react';
import RichTextEditor from './RichTextEditor.tsx';
import { getAssetUrl } from '../utils/url.ts';

const API_BASE = import.meta.env.VITE_API_URL || 'https://my-portfolio-7zd9.onrender.com';

// Local fetch wrapper that shadows global fetch to prefix API endpoints
const fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' && input.startsWith('/api') 
    ? `${API_BASE}${input}` 
    : input;
  return window.fetch(url, init);
};

interface AdminDashboardProps {
  token: string | null;
  onLogin: (token: string) => void;
  refetchData: () => void;
}

export default function AdminDashboard({ token, onLogin, refetchData }: AdminDashboardProps) {
  // Toast Notification States
  interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Login States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dashboard Stats & Lists States
  const [activeTab, setActiveTab] = useState<'settings' | 'projects' | 'skills' | 'education' | 'testimonials' | 'blogs' | 'messages' | 'custom-sections'>('settings');
  const [settings, setSettings] = useState<any>({});
  const [projects, setProjects] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [customSections, setCustomSections] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [visitorCount, setVisitorCount] = useState(0);

  // Editor Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Forms States
  const [settingsForm, setSettingsForm] = useState<any>({});
  const [settingsUsername, setSettingsUsername] = useState('');
  const [settingsPassword, setSettingsPassword] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [projectForm, setProjectForm] = useState({ title: '', description: '', image: '', technologies: '', github: '', demo: '', category: 'Full Stack' });
  const [skillForm, setSkillForm] = useState({ name: '', level: 50, category: 'Frontend' });
  const [eduForm, setEduForm] = useState({ degree: '', institution: '', duration: '', description: '' });
  const [testimonialForm, setTestimonialForm] = useState({ name: '', role: '', company: '', message: '', avatar: '' });
  const [blogForm, setBlogForm] = useState({ title: '', summary: '', content: '', category: '', readTime: '', image: '', tags: '' });
  const [customSectionForm, setCustomSectionForm] = useState({ title: '', content: '', show: true });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const order = [...(settingsForm.sectionOrder || ['about', 'skills', 'projects', 'education', 'testimonials', 'blog', 'contact'])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= order.length) return;
    
    const temp = order[index];
    order[index] = order[targetIndex];
    order[targetIndex] = temp;
    
    setSettingsForm({ ...settingsForm, sectionOrder: order });
  };

  // Load dashboard lists when token changes or actions complete
  useEffect(() => {
    if (!token) return;

    const fetchAllData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        const cacheBust = `?t=${Date.now()}`;

        // Fetch Stats
        const visRes = await fetch(`/api/visitor${cacheBust}`);
        if (visRes.ok) {
          const vData = await visRes.json();
          setVisitorCount(vData.count);
        }

        // Fetch Settings
        const setRes = await fetch(`/api/settings${cacheBust}`);
        if (setRes.ok) {
          const sData = await setRes.json();
          if (!sData.aboutStats) {
            sData.aboutStats = [
              { id: 'stat_1', icon: 'Award', value: '5+', label: 'Years Experience', show: true },
              { id: 'stat_2', icon: 'Briefcase', value: '{projectsCount}+', label: 'Projects Completed', show: true },
              { id: 'stat_3', icon: 'GraduationCap', value: '{blogsCount}+', label: 'Articles Published', show: true }
            ];
          }
          setSettings(sData);
          setSettingsForm(sData);
        }

        // Fetch Projects
        const projRes = await fetch(`/api/projects${cacheBust}`);
        if (projRes.ok) setProjects(await projRes.json());

        // Fetch Skills
        const skillRes = await fetch(`/api/skills${cacheBust}`);
        if (skillRes.ok) setSkills(await skillRes.json());

        // Fetch Education
        const eduRes = await fetch(`/api/education${cacheBust}`);
        if (eduRes.ok) setEducation(await eduRes.json());

        // Fetch Testimonials
        const testRes = await fetch(`/api/testimonials${cacheBust}`);
        if (testRes.ok) setTestimonials(await testRes.json());

        // Fetch Blogs
        const blogRes = await fetch(`/api/blog${cacheBust}`);
        if (blogRes.ok) setBlogs(await blogRes.json());

        // Fetch Custom Sections
        const customRes = await fetch(`/api/custom-sections${cacheBust}`);
        if (customRes.ok) setCustomSections(await customRes.json());

        // Fetch Messages
        const msgRes = await fetch(`/api/messages${cacheBust}`, { headers });
        if (msgRes.ok) setMessages(await msgRes.json());
      } catch (err) {
        console.error('Failed to load admin panel dashboard lists', err);
      }
    };

    fetchAllData();
  }, [token, activeTab, refreshTrigger]);

  // Auth Submit Handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        onLogin(data.token);
        showToast('Login successful! Welcome to the Admin Console.', 'success');
      } else {
        setLoginError(data.error || 'Invalid credentials.');
        showToast(data.error || 'Invalid credentials.', 'error');
      }
    } catch (err) {
      setLoginError('Server network connection error.');
      showToast('Server connection network error.', 'error');
    }
  };

  // File Upload Helper
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, targetFieldSetter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        targetFieldSetter(data.url);
        showToast('File uploaded successfully!', 'success');
      } else {
        showToast('File upload failed. (Max 5MB).', 'error');
      }
    } catch (err) {
      showToast('Network upload error.', 'error');
    }
  };

  // --- CRUD API SUBMISSIONS ---

  // Stats Helper Handlers
  const handleStatChange = (index: number, field: string, val: any) => {
    setSettingsForm((prev: any) => {
      const stats = [...(prev.aboutStats || [])];
      stats[index] = { ...stats[index], [field]: val };
      return { ...prev, aboutStats: stats };
    });
  };

  const handleStatAdd = () => {
    setSettingsForm((prev: any) => {
      const stats = [...(prev.aboutStats || [])];
      stats.push({
        id: `stat_${Date.now()}`,
        icon: 'Award',
        value: '10+',
        label: 'New Statistic',
        show: true
      });
      return { ...prev, aboutStats: stats };
    });
  };

  const handleStatDelete = (index: number) => {
    setSettingsForm((prev: any) => {
      const stats = (prev.aboutStats || []).filter((_: any, i: number) => i !== index);
      return { ...prev, aboutStats: stats };
    });
  };

  const handleStatMove = (index: number, direction: 'up' | 'down') => {
    setSettingsForm((prev: any) => {
      const stats = [...(prev.aboutStats || [])];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= stats.length) return prev;
      
      const temp = stats[index];
      stats[index] = stats[targetIndex];
      stats[targetIndex] = temp;
      
      return { ...prev, aboutStats: stats };
    });
  };

  // Settings Save
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);
    
    const updateBody: any = { ...settingsForm };
    if (settingsUsername) updateBody.username = settingsUsername;
    if (settingsPassword) updateBody.password = settingsPassword;

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateBody),
      });

      if (response.ok) {
        setSaveSuccess(true);
        setSettingsPassword('');
        setSettingsUsername('');
        refetchData();
        setRefreshTrigger(prev => prev + 1);
        showToast('Settings and configuration updated successfully!', 'success');
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        showToast('Failed to save settings configurations.', 'error');
      }
    } catch (err) {
      showToast('Error saving settings configurations.', 'error');
    }
  };

  // Projects CRUD
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = modalMode === 'add' ? '/api/projects' : `/api/projects/${selectedItem.id}`;
    const method = modalMode === 'add' ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(projectForm),
      });

      if (response.ok) {
        setShowModal(false);
        refetchData();
        setRefreshTrigger(prev => prev + 1);
        showToast(modalMode === 'add' ? 'Project created successfully!' : 'Project updated successfully!', 'success');
      } else {
        showToast('Failed to save project.', 'error');
      }
    } catch (err) {
      showToast('Error saving project.', 'error');
    }
  };

  const handleProjectDelete = async (id: string) => {
    if (!window.confirm('Delete this project forever?')) return;

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        refetchData();
        setRefreshTrigger(prev => prev + 1);
        showToast('Project deleted successfully.', 'success');
      } else {
        showToast('Failed to delete project.', 'error');
      }
    } catch (err) {
      showToast('Error deleting project.', 'error');
    }
  };

  // Skills CRUD
  const handleSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = modalMode === 'add' ? '/api/skills' : `/api/skills/${selectedItem.id}`;
    const method = modalMode === 'add' ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(skillForm),
      });

      if (response.ok) {
        setShowModal(false);
        refetchData();
        setRefreshTrigger(prev => prev + 1);
        showToast(modalMode === 'add' ? 'Skill added successfully!' : 'Skill updated successfully!', 'success');
      } else {
        showToast('Failed to save skill.', 'error');
      }
    } catch (err) {
      showToast('Error saving skill.', 'error');
    }
  };

  const handleSkillDelete = async (id: string) => {
    if (!window.confirm('Delete this skill?')) return;
    try {
      const response = await fetch(`/api/skills/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        refetchData();
        setRefreshTrigger(prev => prev + 1);
        showToast('Skill deleted successfully.', 'success');
      } else {
        showToast('Failed to delete skill.', 'error');
      }
    } catch (err) {
      showToast('Error deleting skill.', 'error');
    }
  };

  // Education CRUD
  const handleEduSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = modalMode === 'add' ? '/api/education' : `/api/education/${selectedItem.id}`;
    const method = modalMode === 'add' ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(eduForm),
      });

      if (response.ok) {
        setShowModal(false);
        refetchData();
        setRefreshTrigger(prev => prev + 1);
        showToast(modalMode === 'add' ? 'Education record added successfully!' : 'Education record updated successfully!', 'success');
      } else {
        showToast('Failed to save education record.', 'error');
      }
    } catch (err) {
      showToast('Error saving education record.', 'error');
    }
  };

  const handleEduDelete = async (id: string) => {
    if (!window.confirm('Delete this education entry?')) return;
    try {
      const response = await fetch(`/api/education/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        refetchData();
        setRefreshTrigger(prev => prev + 1);
        showToast('Education record deleted successfully.', 'success');
      } else {
        showToast('Failed to delete education record.', 'error');
      }
    } catch (err) {
      showToast('Error deleting education record.', 'error');
    }
  };

  // Testimonials CRUD
  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = modalMode === 'add' ? '/api/testimonials' : `/api/testimonials/${selectedItem.id}`;
    const method = modalMode === 'add' ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(testimonialForm),
      });

      if (response.ok) {
        setShowModal(false);
        refetchData();
        setRefreshTrigger(prev => prev + 1);
        showToast(modalMode === 'add' ? 'Testimonial added successfully!' : 'Testimonial updated successfully!', 'success');
      } else {
        showToast('Failed to save testimonial.', 'error');
      }
    } catch (err) {
      showToast('Error saving testimonial.', 'error');
    }
  };

  const handleTestimonialDelete = async (id: string) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        refetchData();
        setRefreshTrigger(prev => prev + 1);
        showToast('Testimonial deleted successfully.', 'success');
      } else {
        showToast('Failed to delete testimonial.', 'error');
      }
    } catch (err) {
      showToast('Error deleting testimonial.', 'error');
    }
  };

  // Blog CRUD
  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = modalMode === 'add' ? '/api/blog' : `/api/blog/${selectedItem.id}`;
    const method = modalMode === 'add' ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(blogForm),
      });

      if (response.ok) {
        setShowModal(false);
        refetchData();
        setRefreshTrigger(prev => prev + 1);
        showToast(modalMode === 'add' ? 'Blog post written successfully!' : 'Blog post updated successfully!', 'success');
      } else {
        showToast('Failed to save blog post.', 'error');
      }
    } catch (err) {
      showToast('Error saving blog post.', 'error');
    }
  };

  const handleBlogDelete = async (id: string) => {
    if (!window.confirm('Delete this blog post?')) return;
    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        refetchData();
        setRefreshTrigger(prev => prev + 1);
        showToast('Blog post deleted successfully.', 'success');
      } else {
        showToast('Failed to delete blog post.', 'error');
      }
    } catch (err) {
      showToast('Error deleting blog post.', 'error');
    }
  };

  // Message Delete
  const handleMessageDelete = async (id: string) => {
    if (!window.confirm('Delete this user message?')) return;
    try {
      const response = await fetch(`/api/messages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        refetchData();
        setRefreshTrigger(prev => prev + 1);
        showToast('Message deleted successfully.', 'success');
      } else {
        showToast('Failed to delete message.', 'error');
      }
    } catch (err) {
      showToast('Error deleting message.', 'error');
    }
  };

  const handleMessageMarkRead = async (id: string) => {
    try {
      const response = await fetch(`/api/messages/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        refetchData();
        setRefreshTrigger(prev => prev + 1);
        showToast('Message marked as read.', 'success');
      } else {
        showToast('Failed to mark message as read.', 'error');
      }
    } catch (err) {
      showToast('Error marking message as read.', 'error');
    }
  };

  // Custom Section CRUD
  const handleCustomSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = modalMode === 'add' ? '/api/custom-sections' : `/api/custom-sections/${selectedItem.id}`;
    const method = modalMode === 'add' ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(customSectionForm),
      });

      if (response.ok) {
        setShowModal(false);
        refetchData();
        setRefreshTrigger(prev => prev + 1);
        showToast(modalMode === 'add' ? 'Custom section created successfully!' : 'Custom section updated successfully!', 'success');
      } else {
        showToast('Failed to save custom section.', 'error');
      }
    } catch (err) {
      showToast('Error saving custom section.', 'error');
    }
  };

  const handleCustomSectionDelete = async (id: string) => {
    if (!window.confirm('Delete this custom section? It will be removed from your portfolio.')) return;
    try {
      const response = await fetch(`/api/custom-sections/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        refetchData();
        setRefreshTrigger(prev => prev + 1);
        showToast('Custom section deleted successfully.', 'success');
      } else {
        showToast('Failed to delete custom section.', 'error');
      }
    } catch (err) {
      showToast('Error deleting custom section.', 'error');
    }
  };

  // --- MODAL TRIGGER HELPERS ---
  const triggerAdd = (type: typeof activeTab) => {
    setModalMode('add');
    setSelectedItem(null);
    if (type === 'projects') setProjectForm({ title: '', description: '', image: '', technologies: '', github: '', demo: '', category: 'Full Stack' });
    if (type === 'skills') setSkillForm({ name: '', level: 50, category: 'Frontend' });
    if (type === 'education') setEduForm({ degree: '', institution: '', duration: '', description: '' });
    if (type === 'testimonials') setTestimonialForm({ name: '', role: '', company: '', message: '', avatar: '' });
    if (type === 'blogs') setBlogForm({ title: '', summary: '', content: '', category: '', readTime: '', image: '', tags: '' });
    if (type === 'custom-sections') setCustomSectionForm({ title: '', content: '', show: true });
    setShowModal(true);
  };

  const triggerEdit = (type: typeof activeTab, item: any) => {
    setModalMode('edit');
    setSelectedItem(item);
    if (type === 'projects') setProjectForm({ title: item.title, description: item.description, image: item.image, technologies: item.technologies, github: item.github, demo: item.demo, category: item.category });
    if (type === 'skills') setSkillForm({ name: item.name, level: item.level, category: item.category });
    if (type === 'education') setEduForm({ degree: item.degree, institution: item.institution, duration: item.duration, description: item.description });
    if (type === 'testimonials') setTestimonialForm({ name: item.name, role: item.role, company: item.company, message: item.message, avatar: item.avatar });
    if (type === 'blogs') setBlogForm({ title: item.title, summary: item.summary, content: item.content, category: item.category, readTime: item.readTime, image: item.image, tags: item.tags });
    if (type === 'custom-sections') setCustomSectionForm({ title: item.title, content: item.content, show: item.show !== false });
    setShowModal(true);
  };

  const triggerView = (item: any) => {
    setModalMode('view');
    setSelectedItem(item);
    setShowModal(true);
    if (activeTab === 'messages' && !item.read) {
      handleMessageMarkRead(item.id);
    }
  };

  // --- RENDERING LOGIN VIEW IF NOT LOGGED IN ---
  if (!token) {
    return (
      <div className="container" style={{ paddingTop: '80px' }}>
        <div className="admin-login-card glass">
          <h2 className="admin-login-title">Admin Console</h2>
          <p className="admin-login-subtitle">Authenticate to manage portfolio listings</p>

          <form onSubmit={handleLoginSubmit}>
            {loginError && (
              <div className="form-status form-status-error" style={{ fontSize: '0.85rem' }}>
                {loginError}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                className="input-field"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
              Sign In
            </button>
          </form>

          {/* <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Default Credential: <strong>admin</strong> / <strong>admin123</strong>
          </div> */}
        </div>

        {/* Toast Container for Login Screen */}
        <div className="toast-container">
          {toasts.map((t) => (
            <div key={t.id} className={`toast-card toast-${t.type} glass`}>
              <span className="toast-icon">
                {t.type === 'success' && <CheckCircle size={18} />}
                {t.type === 'error' && <X size={18} />}
                {t.type === 'info' && <Info size={18} />}
              </span>
              <span className="toast-message">{t.message}</span>
              <button className="toast-close" onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- RENDERING SIGNED-IN DASHBOARD VIEW ---
  return (
    <div className="container admin-container">
      <div className="section-header" style={{ marginBottom: '32px', textAlign: 'left' }}>
        <h1 className="section-title">Admin Dashboard</h1>
        <p className="section-subtitle" style={{ margin: 0 }}>
          Manage all content pages, view visitor traffic metrics, and review contact messages.
        </p>
      </div>

      {/* Visitor Counter Metrics */}
      <div className="admin-stats-overview">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <Eye size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Total Visitors</div>
            <div className="admin-stat-val">{visitorCount}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <FolderGit size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Active Projects</div>
            <div className="admin-stat-val">{projects.length}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <MessageSquare size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Unread Messages</div>
            <div className="admin-stat-val">{messages.filter(m => !m.read).length}</div>
          </div>
        </div>
      </div>

      <div className="admin-layout">
        {/* Mobile Dropdown Navigation */}
        <div className="admin-mobile-nav">
          <label htmlFor="admin-tab-select" className="form-label" style={{ marginBottom: '6px', fontWeight: 600 }}>
            Dashboard Section
          </label>
          <select 
            id="admin-tab-select"
            className="input-field" 
            value={activeTab} 
            onChange={(e) => setActiveTab(e.target.value as any)}
            style={{ appearance: 'auto', padding: '12px' }}
          >
            <option value="settings">Portfolio Info & Credentials</option>
            <option value="projects">Projects ({projects.length})</option>
            <option value="skills">Skills ({skills.length})</option>
            <option value="education">Education ({education.length})</option>
            <option value="testimonials">Reviews ({testimonials.length})</option>
            <option value="blogs">Tech Blog ({blogs.length})</option>
            <option value="messages">Messages ({messages.length})</option>
            <option value="custom-sections">Custom Sections ({customSections.length})</option>
          </select>
        </div>

        {/* Sidebar Navigation */}
        <aside className="admin-sidebar glass">
          <button className={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <SettingsIcon size={16} /> Portfolio Info
          </button>
          <button className={`admin-tab-btn ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>
            <FolderGit size={16} /> Projects ({projects.length})
          </button>
          <button className={`admin-tab-btn ${activeTab === 'skills' ? 'active' : ''}`} onClick={() => setActiveTab('skills')}>
            <Award size={16} /> Skills ({skills.length})
          </button>
          <button className={`admin-tab-btn ${activeTab === 'education' ? 'active' : ''}`} onClick={() => setActiveTab('education')}>
            <GraduationCap size={16} /> Education ({education.length})
          </button>
          <button className={`admin-tab-btn ${activeTab === 'testimonials' ? 'active' : ''}`} onClick={() => setActiveTab('testimonials')}>
            <MessageSquare size={16} /> Reviews ({testimonials.length})
          </button>
          <button className={`admin-tab-btn ${activeTab === 'blogs' ? 'active' : ''}`} onClick={() => setActiveTab('blogs')}>
            <BookOpen size={16} /> Tech Blog ({blogs.length})
          </button>
          <button className={`admin-tab-btn ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>
            <MessageSquare size={16} /> Messages ({messages.length})
          </button>
          <button className={`admin-tab-btn ${activeTab === 'custom-sections' ? 'active' : ''}`} onClick={() => setActiveTab('custom-sections')}>
            <Award size={16} /> Custom Sections ({customSections.length})
          </button>
        </aside>

        {/* Content Box Panels */}
        <main className="admin-content-box glass">
          
          {/* TAB 1: SETTINGS EDIT */}
          {activeTab === 'settings' && (
            <div>
              <div className="admin-header">
                <h2 className="admin-title-h2">Portfolio Settings</h2>
                {saveSuccess && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '0.9rem', fontWeight: 500 }}>
                    <CheckCircle size={16} /> Saved Successfully
                  </span>
                )}
              </div>

              <form onSubmit={handleSettingsSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="settingsName">Developer Name</label>
                    <input
                      type="text"
                      id="settingsName"
                      className="input-field"
                      value={settingsForm.name || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="settingsTitle">Professional Title</label>
                    <input
                      type="text"
                      id="settingsTitle"
                      className="input-field"
                      value={settingsForm.title || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="settingsEmail">Contact Email</label>
                    <input
                      type="email"
                      id="settingsEmail"
                      className="input-field"
                      value={settingsForm.email || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="settingsPhone">Phone Number</label>
                    <input
                      type="text"
                      id="settingsPhone"
                      className="input-field"
                      value={settingsForm.phone || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="settingsAddress">Location</label>
                    <input
                      type="text"
                      id="settingsAddress"
                      className="input-field"
                      value={settingsForm.address || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Profile Picture 
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px' }}>(URL or Upload)</span>
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        className="input-field"
                        value={settingsForm.avatarUrl || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, avatarUrl: e.target.value })}
                      />
                      <label className="btn btn-secondary" style={{ padding: '0 14px', flexShrink: 0 }}>
                        <Upload size={16} />
                        <input 
                          type="file" 
                          style={{ display: 'none' }} 
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, (url) => setSettingsForm((prev: any) => ({ ...prev, avatarUrl: url })))}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      CV/Resume Document 
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px' }}>(URL or Upload)</span>
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        className="input-field"
                        value={settingsForm.resumeUrl || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, resumeUrl: e.target.value })}
                      />
                      <label className="btn btn-secondary" style={{ padding: '0 14px', flexShrink: 0 }}>
                        <Upload size={16} />
                        <input 
                          type="file" 
                          style={{ display: 'none' }} 
                          onChange={(e) => handleFileChange(e, (url) => setSettingsForm((prev: any) => ({ ...prev, resumeUrl: url })))}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="settingsGithub">GitHub Profile Link</label>
                    <input
                      type="text"
                      id="settingsGithub"
                      className="input-field"
                      value={settingsForm.githubUrl || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, githubUrl: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="settingsLinkedin">LinkedIn Profile Link</label>
                    <input
                      type="text"
                      id="settingsLinkedin"
                      className="input-field"
                      value={settingsForm.linkedinUrl || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, linkedinUrl: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="settingsTwitter">Twitter Link</label>
                    <input
                      type="text"
                      id="settingsTwitter"
                      className="input-field"
                      value={settingsForm.twitterUrl || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, twitterUrl: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '20px' }}>
                  <label className="form-label" htmlFor="settingsBio">Detailed Bio Narrative</label>
                  <textarea
                    id="settingsBio"
                    rows={4}
                    className="input-field"
                    value={settingsForm.bio || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, bio: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="form-group" style={{ marginTop: '20px' }}>
                  <label className="form-label">About Me Content Section (Word Editor)</label>
                  <RichTextEditor
                    value={settingsForm.aboutContent || ''}
                    onChange={(html) => setSettingsForm((prev: any) => ({ ...prev, aboutContent: html }))}
                    placeholder="Write detailed biography paragraphs, list certifications, insert images/files..."
                    token={token}
                  />
                </div>

                {/* Manage About Me Statistics */}
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '40px 0 20px 0', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                  Manage About Me Statistics
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
                  Customize the quick statistics card grid shown in the About section. Tip: use <code>{'{projectsCount}'}</code> or <code>{'{blogsCount}'}</code> to dynamically render the current total number of projects or blog articles.
                </p>

                <div className="admin-table-container" style={{ marginBottom: '24px' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Icon</th>
                        <th>Value</th>
                        <th>Label</th>
                        <th>Visible</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(settingsForm.aboutStats || [
                        { id: 'stat_1', icon: 'Award', value: '5+', label: 'Years Experience', show: true },
                        { id: 'stat_2', icon: 'Briefcase', value: '{projectsCount}+', label: 'Projects Completed', show: true },
                        { id: 'stat_3', icon: 'GraduationCap', value: '{blogsCount}+', label: 'Articles Published', show: true }
                      ]).map((s: any, idx: number, arr: any[]) => (
                        <tr key={s.id}>
                          <td>
                            <select
                              className="input-field"
                              style={{ padding: '8px', width: '150px' }}
                              value={s.icon}
                              onChange={(e) => handleStatChange(idx, 'icon', e.target.value)}
                            >
                              <option value="Award">Award</option>
                              <option value="Briefcase">Briefcase</option>
                              <option value="GraduationCap">GraduationCap</option>
                              <option value="Code">Code</option>
                              <option value="Heart">Heart</option>
                              <option value="Smile">Smile</option>
                              <option value="Globe">Globe</option>
                              <option value="Coffee">Coffee</option>
                              <option value="Terminal">Terminal</option>
                              <option value="Zap">Zap</option>
                              <option value="BookOpen">BookOpen</option>
                              <option value="Users">Users</option>
                              <option value="CheckCircle">CheckCircle</option>
                              <option value="Calendar">Calendar</option>
                              <option value="Cpu">Cpu</option>
                              <option value="FileText">FileText</option>
                              <option value="Star">Star</option>
                            </select>
                          </td>
                          <td>
                            <input
                              type="text"
                              className="input-field"
                              style={{ padding: '8px', width: '120px' }}
                              value={s.value}
                              onChange={(e) => handleStatChange(idx, 'value', e.target.value)}
                              placeholder="e.g. 5+ or {projectsCount}"
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="input-field"
                              style={{ padding: '8px' }}
                              value={s.label}
                              onChange={(e) => handleStatChange(idx, 'label', e.target.value)}
                              placeholder="e.g. Years Experience"
                              required
                            />
                          </td>
                          <td>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={s.show !== false}
                                onChange={(e) => handleStatChange(idx, 'show', e.target.checked)}
                              />
                              Show
                            </label>
                          </td>
                          <td>
                            <div className="admin-actions">
                              <button
                                type="button"
                                className="admin-action-btn"
                                disabled={idx === 0}
                                onClick={() => handleStatMove(idx, 'up')}
                                title="Move Up"
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                className="admin-action-btn"
                                disabled={idx === arr.length - 1}
                                onClick={() => handleStatMove(idx, 'down')}
                                title="Move Down"
                              >
                                ↓
                              </button>
                              <button
                                type="button"
                                className="admin-action-btn admin-action-btn-delete"
                                onClick={() => handleStatDelete(idx)}
                                title="Delete Stat"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {(!settingsForm.aboutStats || settingsForm.aboutStats.length === 0) && (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '16px' }}>
                            No statistics cards added.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleStatAdd}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Plus size={16} /> Add New Stat
                  </button>
                </div>

                {/* Manage Section Ordering & Visibility */}
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '40px 0 20px 0', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                  Manage Section Order & Visibility
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
                  Reposition sections using the up/down arrows. Click "Save Configuration" at the bottom to apply the order.
                </p>
                <div className="admin-table-container" style={{ marginBottom: '24px' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Section Name</th>
                        <th>Visibility</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(settingsForm.sectionOrder || ['about', 'skills', 'projects', 'education', 'testimonials', 'blog', 'contact']).map((sectionId: string, index: number, arr: string[]) => {
                        const getFriendlyName = (id: string) => {
                          if (id === 'about') return 'About Me';
                          if (id === 'skills') return 'Skills / Proficiencies';
                          if (id === 'projects') return 'Featured Projects';
                          if (id === 'education') return 'Education & Timeline';
                          if (id === 'testimonials') return 'Client Reviews';
                          if (id === 'blog') return 'Technical Blog';
                          if (id === 'contact') return 'Contact Form';
                          if (id.startsWith('custom_')) {
                            const cs = customSections.find(c => c.id === id);
                            return `[Custom] ${cs?.title || 'Untitled Custom Section'}`;
                          }
                          return id;
                        };

                        const getVisibility = (id: string) => {
                          if (id === 'about') return settingsForm.showAbout !== false;
                          if (id === 'skills') return settingsForm.showSkills !== false;
                          if (id === 'projects') return settingsForm.showProjects !== false;
                          if (id === 'education') return settingsForm.showEducation !== false;
                          if (id === 'testimonials') return settingsForm.showTestimonials !== false;
                          if (id === 'blog') return settingsForm.showBlog !== false;
                          if (id === 'contact') return settingsForm.showContact !== false;
                          if (id.startsWith('custom_')) {
                            const cs = customSections.find(c => c.id === id);
                            return cs?.show !== false;
                          }
                          return true;
                        };

                        const toggleVisibility = (id: string, checked: boolean) => {
                          if (id === 'about') setSettingsForm({ ...settingsForm, showAbout: checked });
                          if (id === 'skills') setSettingsForm({ ...settingsForm, showSkills: checked });
                          if (id === 'projects') setSettingsForm({ ...settingsForm, showProjects: checked });
                          if (id === 'education') setSettingsForm({ ...settingsForm, showEducation: checked });
                          if (id === 'testimonials') setSettingsForm({ ...settingsForm, showTestimonials: checked });
                          if (id === 'blog') setSettingsForm({ ...settingsForm, showBlog: checked });
                          if (id === 'contact') setSettingsForm({ ...settingsForm, showContact: checked });
                          if (id.startsWith('custom_')) {
                            const updated = customSections.map(cs => cs.id === id ? { ...cs, show: checked } : cs);
                            setCustomSections(updated);
                            const cs = customSections.find(c => c.id === id);
                            if (cs) {
                              fetch(`/api/custom-sections/${id}`, {
                                method: 'PUT',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({ ...cs, show: checked })
                              }).then(() => refetchData());
                            }
                          }
                        };

                        return (
                          <tr key={sectionId}>
                            <td style={{ fontWeight: 600 }}>{getFriendlyName(sectionId)}</td>
                            <td>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={getVisibility(sectionId)}
                                  onChange={(e) => toggleVisibility(sectionId, e.target.checked)}
                                />
                                Show
                              </label>
                            </td>
                            <td>
                              <div className="admin-actions">
                                <button
                                  type="button"
                                  className="admin-action-btn"
                                  disabled={index === 0}
                                  onClick={() => moveSection(index, 'up')}
                                  style={{ opacity: index === 0 ? 0.3 : 1, cursor: index === 0 ? 'default' : 'pointer', padding: '4px 8px' }}
                                  aria-label="Move Section Up"
                                >
                                  &uarr; Up
                                </button>
                                <button
                                  type="button"
                                  className="admin-action-btn"
                                  disabled={index === arr.length - 1}
                                  onClick={() => moveSection(index, 'down')}
                                  style={{ opacity: index === arr.length - 1 ? 0.3 : 1, cursor: index === arr.length - 1 ? 'default' : 'pointer', padding: '4px 8px' }}
                                  aria-label="Move Section Down"
                                >
                                  &darr; Down
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Change admin credentials block */}
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '40px 0 20px 0', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                  Change Console Credentials
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="settingsUser">Change Username</label>
                    <input
                      type="text"
                      id="settingsUser"
                      className="input-field"
                      placeholder="Leave blank to keep same"
                      value={settingsUsername}
                      onChange={(e) => setSettingsUsername(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="settingsPass">New Password</label>
                    <input
                      type="password"
                      id="settingsPass"
                      className="input-field"
                      placeholder="Leave blank to keep same"
                      value={settingsPassword}
                      onChange={(e) => setSettingsPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '24px' }}>
                  Save Configuration
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: PROJECTS */}
          {activeTab === 'projects' && (
            <div>
              <div className="admin-header">
                <h2 className="admin-title-h2">Manage Projects</h2>
                <button className="btn btn-primary" onClick={() => triggerAdd('projects')}>
                  <Plus size={16} /> Add Project
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Technologies</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <img src={getAssetUrl(p.image)} alt={p.title} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                        </td>
                        <td style={{ fontWeight: 600 }}>{p.title}</td>
                        <td>{p.category}</td>
                        <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.technologies}</td>
                        <td>
                          <div className="admin-actions">
                            <button className="admin-action-btn admin-action-btn-edit" onClick={() => triggerEdit('projects', p)} aria-label="Edit Project">
                              <Edit size={14} />
                            </button>
                            <button className="admin-action-btn admin-action-btn-delete" onClick={() => handleProjectDelete(p.id)} aria-label="Delete Project">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {projects.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                          No projects recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SKILLS */}
          {activeTab === 'skills' && (
            <div>
              <div className="admin-header">
                <h2 className="admin-title-h2">Manage Skills</h2>
                <button className="btn btn-primary" onClick={() => triggerAdd('skills')}>
                  <Plus size={16} /> Add Skill
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Skill Name</th>
                      <th>Level (%)</th>
                      <th>Category</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skills.map((s) => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600 }}>{s.name}</td>
                        <td>{s.level}%</td>
                        <td>{s.category}</td>
                        <td>
                          <div className="admin-actions">
                            <button className="admin-action-btn admin-action-btn-edit" onClick={() => triggerEdit('skills', s)} aria-label="Edit Skill">
                              <Edit size={14} />
                            </button>
                            <button className="admin-action-btn admin-action-btn-delete" onClick={() => handleSkillDelete(s.id)} aria-label="Delete Skill">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {skills.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                          No skills listed.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: EDUCATION */}
          {activeTab === 'education' && (
            <div>
              <div className="admin-header">
                <h2 className="admin-title-h2">Education Timeline</h2>
                <button className="btn btn-primary" onClick={() => triggerAdd('education')}>
                  <Plus size={16} /> Add Education
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Degree / Certificate</th>
                      <th>Institution</th>
                      <th>Duration</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {education.map((e) => (
                      <tr key={e.id}>
                        <td style={{ fontWeight: 600 }}>{e.degree}</td>
                        <td>{e.institution}</td>
                        <td>{e.duration}</td>
                        <td>
                          <div className="admin-actions">
                            <button className="admin-action-btn admin-action-btn-edit" onClick={() => triggerEdit('education', e)} aria-label="Edit Education">
                              <Edit size={14} />
                            </button>
                            <button className="admin-action-btn admin-action-btn-delete" onClick={() => handleEduDelete(e.id)} aria-label="Delete Education">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {education.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                          No education nodes recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: TESTIMONIALS */}
          {activeTab === 'testimonials' && (
            <div>
              <div className="admin-header">
                <h2 className="admin-title-h2">Client Reviews</h2>
                <button className="btn btn-primary" onClick={() => triggerAdd('testimonials')}>
                  <Plus size={16} /> Add Testimonial
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Avatar</th>
                      <th>Reviewer</th>
                      <th>Company</th>
                      <th>Quote Preview</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testimonials.map((t) => (
                      <tr key={t.id}>
                        <td>
                          <img src={getAssetUrl(t.avatar)} alt={t.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }} />
                        </td>
                        <td style={{ fontWeight: 600 }}>{t.name}</td>
                        <td>{t.role} {t.company && `at ${t.company}`}</td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.message}</td>
                        <td>
                          <div className="admin-actions">
                            <button className="admin-action-btn admin-action-btn-edit" onClick={() => triggerEdit('testimonials', t)} aria-label="Edit Testimonial">
                              <Edit size={14} />
                            </button>
                            <button className="admin-action-btn admin-action-btn-delete" onClick={() => handleTestimonialDelete(t.id)} aria-label="Delete Testimonial">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {testimonials.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                          No testimonials listed.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: BLOG */}
          {activeTab === 'blogs' && (
            <div>
              <div className="admin-header">
                <h2 className="admin-title-h2">Tech Blog Posts</h2>
                <button className="btn btn-primary" onClick={() => triggerAdd('blogs')}>
                  <Plus size={16} /> Write Post
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blogs.map((b) => (
                      <tr key={b.id}>
                        <td>
                          <img src={getAssetUrl(b.image)} alt={b.title} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                        </td>
                        <td style={{ fontWeight: 600 }}>{b.title}</td>
                        <td>{b.category}</td>
                        <td>{b.date}</td>
                        <td>
                          <div className="admin-actions">
                            <button className="admin-action-btn admin-action-btn-edit" onClick={() => triggerEdit('blogs', b)} aria-label="Edit Blog Post">
                              <Edit size={14} />
                            </button>
                            <button className="admin-action-btn admin-action-btn-delete" onClick={() => handleBlogDelete(b.id)} aria-label="Delete Blog Post">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {blogs.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                          No blogs posted yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: MESSAGES */}
          {activeTab === 'messages' && (
            <div>
              <div className="admin-header">
                <h2 className="admin-title-h2">Inbox Messages</h2>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Sender</th>
                      <th>Email</th>
                      <th>Date</th>
                      <th>Message Preview</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map((m) => (
                      <tr key={m.id} style={!m.read ? { backgroundColor: 'rgba(var(--accent-rgb), 0.04)' } : undefined}>
                        <td style={{ fontWeight: m.read ? 500 : 700, color: m.read ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                          {m.name}
                          {!m.read && (
                            <span style={{ 
                              marginLeft: '8px', 
                              padding: '2px 6px', 
                              fontSize: '0.7rem', 
                              fontWeight: 600, 
                              borderRadius: 'var(--border-radius-sm)', 
                              background: 'rgba(var(--accent-rgb), 0.1)', 
                              color: 'var(--accent)'
                            }}>
                              New
                            </span>
                          )}
                        </td>
                        <td style={{ color: m.read ? 'var(--text-muted)' : 'var(--text-secondary)' }}>{m.email}</td>
                        <td style={{ color: m.read ? 'var(--text-muted)' : 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{m.date}</td>
                        <td style={{ 
                          maxWidth: '220px', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap',
                          color: m.read ? 'var(--text-muted)' : 'var(--text-secondary)',
                          fontWeight: m.read ? 400 : 500
                        }}>{m.message}</td>
                        <td>
                          <div className="admin-actions">
                            {!m.read && (
                              <button 
                                className="admin-action-btn admin-action-btn-read" 
                                onClick={() => handleMessageMarkRead(m.id)} 
                                aria-label="Mark as Read"
                                title="Mark as Read"
                              >
                                <Check size={14} />
                              </button>
                            )}
                            <button className="admin-action-btn admin-action-btn-edit" onClick={() => triggerView(m)} aria-label="View Message" title="View Details">
                              <Eye size={14} />
                            </button>
                            <button className="admin-action-btn admin-action-btn-delete" onClick={() => handleMessageDelete(m.id)} aria-label="Delete Message" title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {messages.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                          Your inbox is empty.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: CUSTOM SECTIONS */}
          {activeTab === 'custom-sections' && (
            <div>
              <div className="admin-header">
                <h2 className="admin-title-h2">Manage Custom Sections</h2>
                <button className="btn btn-primary" onClick={() => triggerAdd('custom-sections')}>
                  <Plus size={16} /> Add Custom Section
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Section Title</th>
                      <th>ID</th>
                      <th>Visible</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customSections.map((cs) => (
                      <tr key={cs.id}>
                        <td style={{ fontWeight: 600 }}>{cs.title}</td>
                        <td><code>{cs.id}</code></td>
                        <td>{cs.show !== false ? 'Yes' : 'No'}</td>
                        <td>
                          <div className="admin-actions">
                            <button className="admin-action-btn admin-action-btn-edit" onClick={() => triggerEdit('custom-sections', cs)} aria-label="Edit Custom Section">
                              <Edit size={14} />
                            </button>
                            <button className="admin-action-btn admin-action-btn-delete" onClick={() => handleCustomSectionDelete(cs.id)} aria-label="Delete Custom Section">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {customSections.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                          No custom sections added yet. Click "Add Custom Section" to create one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* --- FORM DIALOG EDIT MODAL OVERLAY --- */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal glass" onClick={(e) => e.stopPropagation()}>
            
            <div className="admin-modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {modalMode === 'add' ? 'Add New' : modalMode === 'edit' ? 'Edit Details' : 'Message Details'}
              </h3>
              <button onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            {/* A: PROJECTS FORM */}
            {activeTab === 'projects' && modalMode !== 'view' && (
              <form onSubmit={handleProjectSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="projTitle">Title</label>
                  <input
                    type="text"
                    id="projTitle"
                    className="input-field"
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="projCat">Category</label>
                  <select
                    id="projCat"
                    className="input-field"
                    style={{ appearance: 'auto' }}
                    value={projectForm.category}
                    onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                  >
                    <option value="Full Stack">Full Stack</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="AI / Machine Learning">AI / Machine Learning</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Screenshot Image 
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px' }}>(URL or Upload)</span>
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="input-field"
                      value={projectForm.image}
                      onChange={(e) => setProjectForm({ ...projectForm, image: e.target.value })}
                    />
                    <label className="btn btn-secondary" style={{ padding: '0 14px', flexShrink: 0 }}>
                      <Upload size={16} />
                      <input 
                        type="file" 
                        style={{ display: 'none' }} 
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, (url) => setProjectForm((prev: any) => ({ ...prev, image: url })))}
                      />
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="projTech">Technologies (comma separated)</label>
                  <input
                    type="text"
                    id="projTech"
                    className="input-field"
                    placeholder="React, TypeScript, CSS Grid"
                    value={projectForm.technologies}
                    onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="projCode">GitHub Repo URL</label>
                  <input
                    type="text"
                    id="projCode"
                    className="input-field"
                    value={projectForm.github}
                    onChange={(e) => setProjectForm({ ...projectForm, github: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="projLive">Live Demo URL</label>
                  <input
                    type="text"
                    id="projLive"
                    className="input-field"
                    value={projectForm.demo}
                    onChange={(e) => setProjectForm({ ...projectForm, demo: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="projDesc">Description</label>
                  <textarea
                    id="projDesc"
                    rows={3}
                    className="input-field"
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    required
                  ></textarea>
                </div>
                <div className="admin-modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Project</button>
                </div>
              </form>
            )}

            {/* B: SKILLS FORM */}
            {activeTab === 'skills' && modalMode !== 'view' && (
              <form onSubmit={handleSkillSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="skName">Skill Name</label>
                  <input
                    type="text"
                    id="skName"
                    className="input-field"
                    placeholder="React"
                    value={skillForm.name}
                    onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="skLevel">Level (%) ({skillForm.level}%)</label>
                  <input
                    type="range"
                    id="skLevel"
                    min="0"
                    max="100"
                    style={{ width: '100%' }}
                    value={skillForm.level}
                    onChange={(e) => setSkillForm({ ...skillForm, level: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="skCat">Category</label>
                  <select
                    id="skCat"
                    className="input-field"
                    style={{ appearance: 'auto' }}
                    value={skillForm.category}
                    onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                  >
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Languages">Languages</option>
                    <option value="Database">Database</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="admin-modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Skill</button>
                </div>
              </form>
            )}

            {/* C: EDUCATION FORM */}
            {activeTab === 'education' && modalMode !== 'view' && (
              <form onSubmit={handleEduSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="edDegree">Degree / Credential</label>
                  <input
                    type="text"
                    id="edDegree"
                    className="input-field"
                    placeholder="B.S. in Computer Science"
                    value={eduForm.degree}
                    onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="edInst">Institution</label>
                  <input
                    type="text"
                    id="edInst"
                    className="input-field"
                    placeholder="MIT"
                    value={eduForm.institution}
                    onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="edDur">Duration / Year Range</label>
                  <input
                    type="text"
                    id="edDur"
                    className="input-field"
                    placeholder="2020 - 2024"
                    value={eduForm.duration}
                    onChange={(e) => setEduForm({ ...eduForm, duration: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="edDesc">Description Summary</label>
                  <textarea
                    id="edDesc"
                    rows={3}
                    className="input-field"
                    value={eduForm.description}
                    onChange={(e) => setEduForm({ ...eduForm, description: e.target.value })}
                    required
                  ></textarea>
                </div>
                <div className="admin-modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Entry</button>
                </div>
              </form>
            )}

            {/* D: TESTIMONIALS FORM */}
            {activeTab === 'testimonials' && modalMode !== 'view' && (
              <form onSubmit={handleTestimonialSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="testName">Reviewer Name</label>
                  <input
                    type="text"
                    id="testName"
                    className="input-field"
                    value={testimonialForm.name}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="testRole">Role Title</label>
                  <input
                    type="text"
                    id="testRole"
                    className="input-field"
                    placeholder="Director of Engineering"
                    value={testimonialForm.role}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, role: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="testComp">Company / Organization</label>
                  <input
                    type="text"
                    id="testComp"
                    className="input-field"
                    value={testimonialForm.company}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, company: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Reviewer Avatar 
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px' }}>(URL or Upload)</span>
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="input-field"
                      value={testimonialForm.avatar}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, avatar: e.target.value })}
                    />
                    <label className="btn btn-secondary" style={{ padding: '0 14px', flexShrink: 0 }}>
                      <Upload size={16} />
                      <input 
                        type="file" 
                        style={{ display: 'none' }} 
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, (url) => setTestimonialForm((prev: any) => ({ ...prev, avatar: url })))}
                      />
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="testMsg">Recommendation Message</label>
                  <textarea
                    id="testMsg"
                    rows={4}
                    className="input-field"
                    value={testimonialForm.message}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, message: e.target.value })}
                    required
                  ></textarea>
                </div>
                <div className="admin-modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Testimonial</button>
                </div>
              </form>
            )}

            {/* E: BLOG FORM */}
            {activeTab === 'blogs' && modalMode !== 'view' && (
              <form onSubmit={handleBlogSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="blTitle">Title</label>
                  <input
                    type="text"
                    id="blTitle"
                    className="input-field"
                    value={blogForm.title}
                    onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="form-label" htmlFor="blCat">Category</label>
                    <input
                      type="text"
                      id="blCat"
                      className="input-field"
                      placeholder="Web Performance"
                      value={blogForm.category}
                      onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label" htmlFor="blTime">Read Time</label>
                    <input
                      type="text"
                      id="blTime"
                      className="input-field"
                      placeholder="5 min read"
                      value={blogForm.readTime}
                      onChange={(e) => setBlogForm({ ...blogForm, readTime: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Blog Banner Image 
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px' }}>(URL or Upload)</span>
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="input-field"
                      value={blogForm.image}
                      onChange={(e) => setBlogForm({ ...blogForm, image: e.target.value })}
                    />
                    <label className="btn btn-secondary" style={{ padding: '0 14px', flexShrink: 0 }}>
                      <Upload size={16} />
                      <input 
                        type="file" 
                        style={{ display: 'none' }} 
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, (url) => setBlogForm((prev: any) => ({ ...prev, image: url })))}
                      />
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="blTags">Tags (comma separated)</label>
                  <input
                    type="text"
                    id="blTags"
                    className="input-field"
                    placeholder="React, CSS, Optimisation"
                    value={blogForm.tags}
                    onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="blSum">Summary</label>
                  <input
                    type="text"
                    id="blSum"
                    className="input-field"
                    value={blogForm.summary}
                    onChange={(e) => setBlogForm({ ...blogForm, summary: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="blCont">Article Body Content</label>
                  <textarea
                    id="blCont"
                    rows={6}
                    className="input-field"
                    value={blogForm.content}
                    onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                    required
                  ></textarea>
                </div>
                <div className="admin-modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Publish Post</button>
                </div>
              </form>
            )}

            {/* F: MESSAGES VIEW DETAIL */}
            {activeTab === 'messages' && modalMode === 'view' && selectedItem && (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  <div>
                    <strong>From:</strong> {selectedItem.name}
                  </div>
                  <div>
                    <strong>Email:</strong> <a href={`mailto:${selectedItem.email}`} style={{ color: 'var(--accent)' }}>{selectedItem.email}</a>
                  </div>
                  <div>
                    <strong>Date Sent:</strong> {selectedItem.date}
                  </div>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: '16px' }} />
                <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius-sm)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {selectedItem.message}
                </div>
                <div className="admin-modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ background: '#ef4444', color: '#ffffff' }}
                    onClick={() => { handleMessageDelete(selectedItem.id); setShowModal(false); }}
                  >
                    Delete Message
                  </button>
                  <button type="button" className="btn btn-primary" onClick={() => setShowModal(false)}>Close</button>
                </div>
              </div>
            )}

            {/* G: CUSTOM SECTIONS FORM */}
            {activeTab === 'custom-sections' && modalMode !== 'view' && (
              <form onSubmit={handleCustomSectionSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="csTitle">Section Title</label>
                  <input
                    type="text"
                    id="csTitle"
                    className="input-field"
                    placeholder="Certifications"
                    value={customSectionForm.title}
                    onChange={(e) => setCustomSectionForm({ ...customSectionForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: '16px 0' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500 }}>
                    <input
                      type="checkbox"
                      checked={customSectionForm.show}
                      onChange={(e) => setCustomSectionForm({ ...customSectionForm, show: e.target.checked })}
                    />
                    Make Section Visible
                  </label>
                </div>
                <div className="form-group">
                  <label className="form-label">Section Content (Word Editor)</label>
                  <RichTextEditor
                    value={customSectionForm.content || ''}
                    onChange={(html) => setCustomSectionForm((prev: any) => ({ ...prev, content: html }))}
                    placeholder="Write details about this custom section, insert images, files, or styled text..."
                    token={token}
                  />
                </div>
                <div className="admin-modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Section</button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* Toast Container for Main Dashboard Screen */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-card toast-${t.type} glass`}>
            <span className="toast-icon">
              {t.type === 'success' && <CheckCircle size={18} />}
              {t.type === 'error' && <X size={18} />}
              {t.type === 'info' && <Info size={18} />}
            </span>
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
