// Markdown rendering utilities for SiteBuilder Chat
// Created: Safe markdown to HTML conversion with sanitization

import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configure marked for secure rendering
marked.setOptions({
  breaks: true, // Enable line breaks
  gfm: true, // GitHub Flavored Markdown
});

export function renderMarkdown(content: string): string {
  try {
    // Convert markdown to HTML
    const rawHtml = marked(content) as string;
    
    // Sanitize HTML to prevent XSS attacks
    const cleanHtml = DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 'code', 'pre',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'blockquote',
        'a'
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      ALLOW_DATA_ATTR: false,
    });
    
    return cleanHtml;
  } catch (error) {
    console.error('Error rendering markdown:', error);
    // Return plain text as fallback
    return escapeHtml(content);
  }
}

export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function isMarkdown(content: string): boolean {
  // Simple heuristic to detect markdown content
  const markdownPatterns = [
    /\*\*.*\*\*/, // Bold
    /\*.*\*/, // Italic
    /`.*`/, // Code
    /#{1,6}\s/, // Headers
    /^\s*[\*\-\+]\s/m, // Lists
    /^\s*\d+\.\s/m, // Numbered lists
    /\[.*\]\(.*\)/, // Links
  ];
  
  return markdownPatterns.some(pattern => pattern.test(content));
} 