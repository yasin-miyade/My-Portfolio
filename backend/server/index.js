import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import dotenv from 'dotenv';

import { getDb, saveDb, getData, saveData } from './db.js';
import { authMiddleware, generateToken, comparePassword, hashPassword } from './auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
const allowedOrigins = [
  "https://its-myportfolio.vercel.app",
  "http://localhost:5173",
  "http://localhost:5000"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) || 
        origin.endsWith(".vercel.app") ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Safe fallback to allow custom domains
    },
    credentials: true,
  })
);
app.use(express.json());

// Prevent browser caching on all API requests
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// Set up image upload directory
const UPLOADS_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR, {
  setHeaders: (res) => {
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
}));

// Configure Multer for secure file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedExtensions = /jpeg|jpg|png|webp|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar/;
    const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Format not allowed. Only images (jpeg, jpg, png, webp, gif) and documents (pdf, doc, docx, xls, xlsx, ppt, pptx, txt, zip, rar) are allowed.'));
  },
});

// --- API ROUTES ---

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const db = getDb();
  if (db.admin.username === username && comparePassword(password, db.admin.passwordHash)) {
    const token = generateToken(username);
    return res.json({ token, username });
  }

  res.status(401).json({ error: 'Invalid username or password.' });
});

app.get('/api/auth/verify', authMiddleware, (req, res) => {
  res.json({ valid: true, username: req.user.username });
});

// Visitor Counter endpoints
app.get('/api/visitor', (req, res) => {
  const count = getData('visitorCount') || 0;
  res.json({ count });
});

app.post('/api/visitor/increment', (req, res) => {
  let count = getData('visitorCount') || 0;
  count += 1;
  saveData('visitorCount', count);
  res.json({ count });
});

// Settings endpoints
app.get('/api/settings', (req, res) => {
  res.json(getData('settings') || {});
});

app.put('/api/settings', authMiddleware, (req, res) => {
  const currentSettings = getData('settings') || {};
  const newSettings = { ...currentSettings, ...req.body };
  
  // Clean off password if included in update body
  delete newSettings.password;
  delete newSettings.username;

  saveData('settings', newSettings);

  // If credential updating is requested
  if (req.body.password || req.body.username) {
    const db = getDb();
    if (req.body.password) {
      db.admin.passwordHash = hashPassword(req.body.password);
    }
    if (req.body.username) {
      db.admin.username = req.body.username;
    }
    saveDb(db);
  }

  res.json({ success: true, settings: newSettings });
});

// Projects CRUD endpoints
app.get('/api/projects', (req, res) => {
  res.json(getData('projects') || []);
});

app.post('/api/projects', authMiddleware, (req, res) => {
  const projects = getData('projects') || [];
  const newProject = {
    id: Date.now().toString(),
    title: req.body.title || 'Untitled Project',
    description: req.body.description || '',
    image: req.body.image || '',
    technologies: req.body.technologies || '',
    github: req.body.github || '',
    demo: req.body.demo || '',
    category: req.body.category || 'Other',
  };
  projects.push(newProject);
  saveData('projects', projects);
  res.status(201).json(newProject);
});

app.put('/api/projects/:id', authMiddleware, (req, res) => {
  const projects = getData('projects') || [];
  const index = projects.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Project not found' });

  projects[index] = {
    ...projects[index],
    title: req.body.title,
    description: req.body.description,
    image: req.body.image,
    technologies: req.body.technologies,
    github: req.body.github,
    demo: req.body.demo,
    category: req.body.category,
  };
  saveData('projects', projects);
  res.json(projects[index]);
});

app.delete('/api/projects/:id', authMiddleware, (req, res) => {
  let projects = getData('projects') || [];
  projects = projects.filter(p => p.id !== req.params.id);
  saveData('projects', projects);
  res.json({ success: true });
});

// Skills CRUD endpoints
app.get('/api/skills', (req, res) => {
  res.json(getData('skills') || []);
});

app.post('/api/skills', authMiddleware, (req, res) => {
  const skills = getData('skills') || [];
  const newSkill = {
    id: Date.now().toString(),
    name: req.body.name || 'New Skill',
    level: parseInt(req.body.level) || 50,
    category: req.body.category || 'Other',
  };
  skills.push(newSkill);
  saveData('skills', skills);
  res.status(201).json(newSkill);
});

app.put('/api/skills/:id', authMiddleware, (req, res) => {
  const skills = getData('skills') || [];
  const index = skills.findIndex(s => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Skill not found' });

  skills[index] = {
    ...skills[index],
    name: req.body.name,
    level: parseInt(req.body.level),
    category: req.body.category,
  };
  saveData('skills', skills);
  res.json(skills[index]);
});

app.delete('/api/skills/:id', authMiddleware, (req, res) => {
  let skills = getData('skills') || [];
  skills = skills.filter(s => s.id !== req.params.id);
  saveData('skills', skills);
  res.json({ success: true });
});

// Education CRUD endpoints
app.get('/api/education', (req, res) => {
  res.json(getData('education') || []);
});

app.post('/api/education', authMiddleware, (req, res) => {
  const education = getData('education') || [];
  const newEdu = {
    id: Date.now().toString(),
    degree: req.body.degree || 'Degree',
    institution: req.body.institution || 'Institution',
    duration: req.body.duration || '',
    description: req.body.description || '',
  };
  education.push(newEdu);
  saveData('education', education);
  res.status(201).json(newEdu);
});

app.put('/api/education/:id', authMiddleware, (req, res) => {
  const education = getData('education') || [];
  const index = education.findIndex(e => e.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Education entry not found' });

  education[index] = {
    ...education[index],
    degree: req.body.degree,
    institution: req.body.institution,
    duration: req.body.duration,
    description: req.body.description,
  };
  saveData('education', education);
  res.json(education[index]);
});

app.delete('/api/education/:id', authMiddleware, (req, res) => {
  let education = getData('education') || [];
  education = education.filter(e => e.id !== req.params.id);
  saveData('education', education);
  res.json({ success: true });
});

// Testimonials CRUD endpoints
app.get('/api/testimonials', (req, res) => {
  res.json(getData('testimonials') || []);
});

app.post('/api/testimonials', authMiddleware, (req, res) => {
  const testimonials = getData('testimonials') || [];
  const newTestimonial = {
    id: Date.now().toString(),
    name: req.body.name || 'Name',
    role: req.body.role || 'Role',
    company: req.body.company || '',
    message: req.body.message || '',
    avatar: req.body.avatar || '',
  };
  testimonials.push(newTestimonial);
  saveData('testimonials', testimonials);
  res.status(201).json(newTestimonial);
});

app.put('/api/testimonials/:id', authMiddleware, (req, res) => {
  const testimonials = getData('testimonials') || [];
  const index = testimonials.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Testimonial not found' });

  testimonials[index] = {
    ...testimonials[index],
    name: req.body.name,
    role: req.body.role,
    company: req.body.company,
    message: req.body.message,
    avatar: req.body.avatar,
  };
  saveData('testimonials', testimonials);
  res.json(testimonials[index]);
});

app.delete('/api/testimonials/:id', authMiddleware, (req, res) => {
  let testimonials = getData('testimonials') || [];
  testimonials = testimonials.filter(t => t.id !== req.params.id);
  saveData('testimonials', testimonials);
  res.json({ success: true });
});

// Blog CRUD endpoints
app.get('/api/blog', (req, res) => {
  res.json(getData('blog') || []);
});

app.post('/api/blog', authMiddleware, (req, res) => {
  const blog = getData('blog') || [];
  const newPost = {
    id: Date.now().toString(),
    title: req.body.title || 'Untitled Post',
    summary: req.body.summary || '',
    content: req.body.content || '',
    category: req.body.category || 'Other',
    readTime: req.body.readTime || '3 min read',
    date: new Date().toISOString().split('T')[0],
    image: req.body.image || '',
    tags: req.body.tags || '',
  };
  blog.push(newPost);
  saveData('blog', blog);
  res.status(201).json(newPost);
});

app.put('/api/blog/:id', authMiddleware, (req, res) => {
  const blog = getData('blog') || [];
  const index = blog.findIndex(b => b.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Blog post not found' });

  blog[index] = {
    ...blog[index],
    title: req.body.title,
    summary: req.body.summary,
    content: req.body.content,
    category: req.body.category,
    readTime: req.body.readTime,
    image: req.body.image,
    tags: req.body.tags,
  };
  saveData('blog', blog);
  res.json(blog[index]);
});

app.delete('/api/blog/:id', authMiddleware, (req, res) => {
  let blog = getData('blog') || [];
  blog = blog.filter(b => b.id !== req.params.id);
  saveData('blog', blog);
  res.json({ success: true });
});

// Messages CRUD endpoints
app.post('/api/messages', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Please provide all details (name, email, message).' });
  }

  const messages = getData('messages') || [];
  const newMessage = {
    id: Date.now().toString(),
    name,
    email,
    message,
    read: false,
    date: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };
  messages.push(newMessage);
  saveData('messages', messages);
  res.status(201).json({ success: true, message: 'Message sent successfully!' });
});

app.get('/api/messages', authMiddleware, (req, res) => {
  res.json(getData('messages') || []);
});

app.put('/api/messages/:id/read', authMiddleware, (req, res) => {
  const messages = getData('messages') || [];
  const index = messages.findIndex(m => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Message not found' });

  messages[index].read = true;
  saveData('messages', messages);
  res.json(messages[index]);
});

app.delete('/api/messages/:id', authMiddleware, (req, res) => {
  let messages = getData('messages') || [];
  messages = messages.filter(m => m.id !== req.params.id);
  saveData('messages', messages);
  res.json({ success: true });
});

// Image Upload Endpoint
app.post('/api/upload', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded or invalid format.' });
  }
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

// Custom Sections CRUD endpoints
app.get('/api/custom-sections', (req, res) => {
  res.json(getData('customSections') || []);
});

app.post('/api/custom-sections', authMiddleware, (req, res) => {
  const customSections = getData('customSections') || [];
  const settings = getData('settings') || {};
  const order = settings.sectionOrder || ['about', 'skills', 'projects', 'education', 'testimonials', 'blog', 'contact'];

  const id = `custom_${Date.now()}`;
  const newSection = {
    id,
    title: req.body.title || 'New Custom Section',
    content: req.body.content || '',
    show: req.body.show !== false,
  };

  customSections.push(newSection);
  saveData('customSections', customSections);

  // Append to settings sectionOrder
  order.push(id);
  settings.sectionOrder = order;
  saveData('settings', settings);

  res.status(201).json(newSection);
});

app.put('/api/custom-sections/:id', authMiddleware, (req, res) => {
  const customSections = getData('customSections') || [];
  const index = customSections.findIndex(cs => cs.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Custom section not found' });

  customSections[index] = {
    ...customSections[index],
    title: req.body.title,
    content: req.body.content,
    show: req.body.show !== false,
  };

  saveData('customSections', customSections);
  res.json(customSections[index]);
});

app.delete('/api/custom-sections/:id', authMiddleware, (req, res) => {
  let customSections = getData('customSections') || [];
  customSections = customSections.filter(cs => cs.id !== req.params.id);
  saveData('customSections', customSections);

  // Remove from settings sectionOrder
  const settings = getData('settings') || {};
  if (settings.sectionOrder) {
    settings.sectionOrder = settings.sectionOrder.filter(id => id !== req.params.id);
    saveData('settings', settings);
  }

  res.json({ success: true });
});

// Serve frontend in production mode
const CLIENT_DIST = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(CLIENT_DIST)) {
  // Serve static assets with aggressive caching, excluding index.html
  app.use(express.static(CLIENT_DIST, {
    setHeaders: (res, filePath) => {
      if (path.basename(filePath) === 'index.html') {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      } else {
        res.set('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }
  }));

  app.get('*', (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
} else {
  app.get('*', (req, res) => {
    res.send('Vite build not found. Please run "npm run build" to compile frontend assets.');
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong on the server' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
