import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Helper to ensure database file exists
function initDb() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const defaultPasswordHash = bcrypt.hashSync('admin123', 10);
    
    const initialData = {
      admin: {
        username: 'admin',
        passwordHash: defaultPasswordHash,
      },
      settings: {
        name: 'Alex Morgan',
        title: 'Senior Full Stack Engineer & Cloud Architect',
        bio: 'I build scalable, clean, and highly interactive web applications. With 5+ years of experience, I specialize in React, Node.js, TypeScript, and AWS architecture. Passionate about performance, user experience, and clean code.',
        email: 'alex.morgan@example.com',
        phone: '+1 (555) 123-4567',
        address: 'San Francisco, CA',
        resumeUrl: '',
        githubUrl: 'https://github.com',
        linkedinUrl: 'https://linkedin.com',
        twitterUrl: 'https://twitter.com',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        heroBgUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1920',
        aboutContent: '<p>I\'m a passionate Full Stack Software Engineer. I specialize in crafting clean, high-performance web applications using modern methodologies. I believe that writing code is not just about solving logical problems, but also about building premium user experiences that feel fluid, responsive, and intuitive.</p><p>Throughout my engineering journey, I have worked across front-end systems, databases, and microservices. I enjoy streamlining developer pipelines, architecting resilient cloud infrastructure, and writing reusable components.</p>',
        showAbout: true,
        showSkills: true,
        showProjects: true,
        showEducation: true,
        showTestimonials: true,
        showBlog: true,
        showContact: true,
        aboutStats: [
          { id: 'stat_1', icon: 'Award', value: '5+', label: 'Years Experience', show: true },
          { id: 'stat_2', icon: 'Briefcase', value: '{projectsCount}+', label: 'Projects Completed', show: true },
          { id: 'stat_3', icon: 'GraduationCap', value: '{blogsCount}+', label: 'Articles Published', show: true }
        ],
        sectionOrder: ['about', 'skills', 'projects', 'education', 'testimonials', 'blog', 'contact']
      },
      visitorCount: 0,
      projects: [
        {
          id: 'p1',
          title: 'Nova Commerce - Next-Gen E-Commerce',
          description: 'A high-performance e-commerce platform with real-time analytics, instant search, and global multi-currency payment checkout. Built with React and Node.js.',
          image: 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=800',
          technologies: 'React, Node.js, Express, Socket.io, Stripe API',
          github: 'https://github.com',
          demo: 'https://example.com',
          category: 'Full Stack',
        },
        {
          id: 'p2',
          title: 'Quantum Dashboard - Cloud Monitoring',
          description: 'A cloud infrastructure monitoring dashboard that visualizes server health, response times, and system metrics using SVG graphs and WebSockets.',
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
          technologies: 'React, TypeScript, Chart.js, TailwindCSS, AWS',
          github: 'https://github.com',
          demo: 'https://example.com',
          category: 'Frontend',
        },
        {
          id: 'p3',
          title: 'Aura AI - Creative Image Generator',
          description: 'Web application leveraging Stable Diffusion to generate custom artistic assets based on user text prompts, featuring a community showcase gallery.',
          image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
          technologies: 'React, Tailwind, Express, OpenAI API, AWS S3',
          github: 'https://github.com',
          demo: 'https://example.com',
          category: 'AI / Machine Learning',
        }
      ],
      skills: [
        { id: 's1', name: 'React / Next.js', level: 95, category: 'Frontend' },
        { id: 's2', name: 'TypeScript', level: 90, category: 'Languages' },
        { id: 's3', name: 'Node.js / Express', level: 88, category: 'Backend' },
        { id: 's4', name: 'Python', level: 80, category: 'Languages' },
        { id: 's5', name: 'PostgreSQL / MongoDB', level: 85, category: 'Database' },
        { id: 's6', name: 'Docker / AWS', level: 75, category: 'DevOps' },
        { id: 's7', name: 'CSS Grid & Flexbox', level: 98, category: 'Frontend' },
        { id: 's8', name: 'System Design', level: 85, category: 'Backend' }
      ],
      education: [
        {
          id: 'e1',
          degree: 'M.S. in Computer Science',
          institution: 'Stanford University',
          duration: '2018 - 2020',
          description: 'Focused on distributed systems, artificial intelligence, and advanced web technologies. Graduated with honors.',
        },
        {
          id: 'e2',
          degree: 'B.S. in Software Engineering',
          institution: 'University of California, Berkeley',
          duration: '2014 - 2018',
          description: 'Core coursework: Algorithms, Data Structures, Database Systems, Computer Networks, and UI Design.',
        }
      ],
      testimonials: [
        {
          id: 't1',
          name: 'Sarah Jenkins',
          role: 'Product Manager',
          company: 'CloudFlow Technologies',
          message: 'Working with Alex was an absolute pleasure. Their technical expertise and eye for UI design transformed our complex requirements into a beautifully responsive, fast application.',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
        },
        {
          id: 't2',
          name: 'Marcus Chen',
          role: 'CTO',
          company: 'Aether Startups',
          message: 'Alex delivered our backend infrastructure on time and perfectly architected. Their understanding of cloud services and clean database design ensured our launch went smoothly.',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
        }
      ],
      blog: [
        {
          id: 'b1',
          title: 'Mastering CSS Grid: A Deep Dive into Premium Layouts',
          summary: 'Explore how to build modern, responsive grid layouts with glassmorphic designs, without writing a single line of framework utility classes.',
          content: 'CSS Grid Layout is one of the most powerful features available in modern CSS. It allows you to create grid structures that adapt flawlessly across mobile, tablet, and desktop viewports. In this post, we look at how to define grid templates, place items, leverage auto-fill and auto-fit, and overlay elements to achieve stunning glassmorphism. By understanding grid-template-areas and the fractional (fr) unit, you can build production-ready pages with half the markup and CSS you would normally write.',
          category: 'CSS / Styling',
          readTime: '5 min read',
          date: '2026-05-15',
          image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=800',
          tags: 'CSS, Web Design, Frontend'
        },
        {
          id: 'b2',
          title: 'Building a Node.js JSON DB for Serverless Environments',
          summary: 'Learn why lightweight, file-based JSON storage can be a perfect fit for portfolios and small-scale apps, avoiding native compilation issues.',
          content: 'Many projects fail to compile or deploy due to complex native dependencies (like native SQLite drivers on Windows or specific Alpine Linux builds). Creating an asynchronous, atomic file-based database store using Node.js filesystem modules offers a bulletproof, performant, and zero-configuration alternative. We cover how to write atomic updates using temp files, how to implement locking, and how to structure JSON documents for easy CRUD querying.',
          category: 'Backend Dev',
          readTime: '8 min read',
          date: '2026-06-01',
          image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
          tags: 'NodeJS, Backend, Database'
        }
      ],
      messages: [],
      customSections: []
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf8');
  }
}

// Initialise DB
initDb();

// Read all DB data
export function getDb() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read JSON DB, returning empty object', error);
    return {};
  }
}

// Write entire DB data (atomic write helper)
export function saveDb(data) {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (error) {
    console.error('Failed to save JSON DB', error);
    return false;
  }
}

// Query helper
export function getData(key) {
  const db = getDb();
  return db[key];
}

// Save helper for a specific key
export function saveData(key, value) {
  const db = getDb();
  db[key] = value;
  return saveDb(db);
}
