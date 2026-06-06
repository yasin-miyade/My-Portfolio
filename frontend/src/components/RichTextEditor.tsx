import React, { useRef, useState, useEffect } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, Heading1, Heading2, 
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, 
  Link as LinkIcon, Image as ImageIcon, File as FileIcon, 
  Eraser, Code, Quote, Heading3, Minus
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  token?: string | null;
}

export default function RichTextEditor({ value, onChange, placeholder = 'Write rich content here...', token }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showCode, setShowCode] = useState(false);
  const [htmlValue, setHtmlValue] = useState(value);

  // Keep internal state synced with prop when changed externally
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
    setHtmlValue(value);
  }, [value]);

  const handleCommand = (command: string, arg: string = '') => {
    if (showCode) return;
    document.execCommand(command, false, arg);
    triggerChange();
  };

  const triggerChange = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setHtmlValue(html);
      onChange(html);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const html = e.target.value;
    setHtmlValue(html);
    onChange(html);
  };

  const handleAddLink = () => {
    const url = prompt('Enter hyperlink URL (e.g., https://google.com):');
    if (url) {
      handleCommand('createLink', url);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        // Insert uploaded image inline with selection focus preserved
        editorRef.current?.focus();
        const imgHtml = `<img src="${data.url}" style="max-width: 100%; height: auto; border-radius: var(--border-radius-sm); margin: 16px 0; display: block; box-shadow: var(--card-shadow); border: 1px solid var(--border);" alt="${file.name}" />`;
        document.execCommand('insertHTML', false, imgHtml);
        triggerChange();
      } else {
        alert('File upload failed. Max 10MB.');
      }
    } catch (err) {
      alert('Upload network error.');
    }

    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file); // API expects field name 'image' for uploads

    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        // Insert styled file download link
        editorRef.current?.focus();
        const fileHtml = `<a href="${data.url}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 8px; color: var(--accent); background: var(--bg-tertiary); border: 1px solid var(--border); padding: 8px 16px; border-radius: var(--border-radius-sm); font-weight: 500; text-decoration: none; margin: 8px 0; transition: all 0.2s ease;" class="editor-file-attachment">
          <span style="font-size: 1.1rem;">📁</span> ${file.name} (Download)
        </a>&nbsp;`;
        document.execCommand('insertHTML', false, fileHtml);
        triggerChange();
      } else {
        alert('File upload failed. Max 10MB.');
      }
    } catch (err) {
      alert('Upload network error.');
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="rich-editor-container" style={{ border: '1px solid var(--border)', borderRadius: 'var(--border-radius-sm)', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
      
      {/* Hidden inputs for uploads */}
      <input 
        type="file" 
        ref={imageInputRef} 
        style={{ display: 'none' }} 
        accept="image/*" 
        onChange={handleImageUpload} 
      />
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar" 
        onChange={handleFileUpload} 
      />

      {/* Toolbar */}
      <div className="rich-editor-toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '8px', borderBottom: '1px solid var(--border)', background: 'var(--bg-tertiary)' }}>
        
        {/* Basic styles */}
        <button 
          type="button" 
          title="Bold"
          className="rich-editor-btn"
          onMouseDown={(e) => { e.preventDefault(); handleCommand('bold'); }}
          style={toolbarBtnStyle}
        >
          <Bold size={15} />
        </button>
        <button 
          type="button" 
          title="Italic"
          className="rich-editor-btn"
          onMouseDown={(e) => { e.preventDefault(); handleCommand('italic'); }}
          style={toolbarBtnStyle}
        >
          <Italic size={15} />
        </button>
        <button 
          type="button" 
          title="Underline"
          className="rich-editor-btn"
          onMouseDown={(e) => { e.preventDefault(); handleCommand('underline'); }}
          style={toolbarBtnStyle}
        >
          <Underline size={15} />
        </button>
        <button 
          type="button" 
          title="Strikethrough"
          className="rich-editor-btn"
          onMouseDown={(e) => { e.preventDefault(); handleCommand('strikeThrough'); }}
          style={toolbarBtnStyle}
        >
          <Strikethrough size={15} />
        </button>

        <span style={dividerStyle}></span>

        {/* Headings */}
        <button 
          type="button" 
          title="Heading 1"
          className="rich-editor-btn"
          onMouseDown={(e) => { e.preventDefault(); handleCommand('formatBlock', '<h1>'); }}
          style={toolbarBtnStyle}
        >
          <Heading1 size={15} />
        </button>
        <button 
          type="button" 
          title="Heading 2"
          className="rich-editor-btn"
          onMouseDown={(e) => { e.preventDefault(); handleCommand('formatBlock', '<h2>'); }}
          style={toolbarBtnStyle}
        >
          <Heading2 size={15} />
        </button>
        <button 
          type="button" 
          title="Heading 3"
          className="rich-editor-btn"
          onMouseDown={(e) => { e.preventDefault(); handleCommand('formatBlock', '<h3>'); }}
          style={toolbarBtnStyle}
        >
          <Heading3 size={15} />
        </button>
        <button 
          type="button" 
          title="Quote"
          className="rich-editor-btn"
          onMouseDown={(e) => { e.preventDefault(); handleCommand('formatBlock', '<blockquote>'); }}
          style={toolbarBtnStyle}
        >
          <Quote size={15} />
        </button>

        <span style={dividerStyle}></span>

        {/* Lists */}
        <button 
          type="button" 
          title="Unordered List"
          className="rich-editor-btn"
          onMouseDown={(e) => { e.preventDefault(); handleCommand('insertUnorderedList'); }}
          style={toolbarBtnStyle}
        >
          <List size={15} />
        </button>
        <button 
          type="button" 
          title="Ordered List"
          className="rich-editor-btn"
          onMouseDown={(e) => { e.preventDefault(); handleCommand('insertOrderedList'); }}
          style={toolbarBtnStyle}
        >
          <ListOrdered size={15} />
        </button>

        <span style={dividerStyle}></span>

        {/* Alignments */}
        <button 
          type="button" 
          title="Align Left"
          className="rich-editor-btn"
          onMouseDown={(e) => { e.preventDefault(); handleCommand('justifyLeft'); }}
          style={toolbarBtnStyle}
        >
          <AlignLeft size={15} />
        </button>
        <button 
          type="button" 
          title="Align Center"
          className="rich-editor-btn"
          onMouseDown={(e) => { e.preventDefault(); handleCommand('justifyCenter'); }}
          style={toolbarBtnStyle}
        >
          <AlignCenter size={15} />
        </button>
        <button 
          type="button" 
          title="Align Right"
          className="rich-editor-btn"
          onMouseDown={(e) => { e.preventDefault(); handleCommand('justifyRight'); }}
          style={toolbarBtnStyle}
        >
          <AlignRight size={15} />
        </button>

        <span style={dividerStyle}></span>

        {/* Insertions */}
        <button 
          type="button" 
          title="Insert Link"
          className="rich-editor-btn"
          onMouseDown={(e) => { e.preventDefault(); handleAddLink(); }}
          style={toolbarBtnStyle}
        >
          <LinkIcon size={15} />
        </button>
        <button 
          type="button" 
          title="Upload & Insert Image"
          className="rich-editor-btn"
          onMouseDown={(e) => { e.preventDefault(); imageInputRef.current?.click(); }}
          style={toolbarBtnStyle}
        >
          <ImageIcon size={15} />
        </button>
        <button 
          type="button" 
          title="Upload & Attach File"
          className="rich-editor-btn"
          onMouseDown={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}
          style={toolbarBtnStyle}
        >
          <FileIcon size={15} />
        </button>
        <button 
          type="button" 
          title="Horizontal Rule"
          className="rich-editor-btn"
          onMouseDown={(e) => { e.preventDefault(); handleCommand('insertHorizontalRule'); }}
          style={toolbarBtnStyle}
        >
          <Minus size={15} />
        </button>

        <span style={dividerStyle}></span>

        {/* Clear formatting */}
        <button 
          type="button" 
          title="Clear Formatting"
          className="rich-editor-btn"
          onMouseDown={(e) => { e.preventDefault(); handleCommand('removeFormat'); }}
          style={toolbarBtnStyle}
        >
          <Eraser size={15} />
        </button>

        {/* Code viewer toggle */}
        <button 
          type="button" 
          title="Toggle HTML Source"
          className="rich-editor-btn"
          onClick={() => setShowCode(!showCode)}
          style={{ 
            ...toolbarBtnStyle, 
            marginLeft: 'auto',
            background: showCode ? 'var(--accent)' : 'transparent',
            color: showCode ? '#ffffff' : 'var(--text-primary)'
          }}
        >
          <Code size={15} />
        </button>
      </div>

      {/* Editing Area */}
      <div style={{ position: 'relative', minHeight: '200px' }}>
        {!showCode ? (
          <div
            ref={editorRef}
            contentEditable
            onInput={triggerChange}
            className="rich-editor-body"
            style={{
              padding: '16px',
              minHeight: '200px',
              maxHeight: '400px',
              overflowY: 'auto',
              outline: 'none',
              lineHeight: '1.6',
              color: 'var(--text-primary)'
            }}
            data-placeholder={placeholder}
          />
        ) : (
          <textarea
            value={htmlValue}
            onChange={handleTextareaChange}
            className="rich-editor-code"
            style={{
              width: '100%',
              minHeight: '200px',
              height: '100%',
              padding: '16px',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              border: 'none',
              background: 'var(--bg-tertiary)',
              color: 'var(--accent)',
              outline: 'none',
              resize: 'vertical',
              lineHeight: '1.5'
            }}
          />
        )}
      </div>
    </div>
  );
}

// Inline styles for cleaner custom design config
const toolbarBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  borderRadius: '4px',
  border: 'none',
  background: 'transparent',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  transition: 'all 0.15s ease'
};

const dividerStyle: React.CSSProperties = {
  width: '1px',
  height: '18px',
  background: 'var(--border)',
  margin: '5px 4px'
};
