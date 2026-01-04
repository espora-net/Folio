'use client';

import { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import mermaid from 'mermaid';
import { ChevronRight, ChevronDown, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

// Import highlight.js styles for syntax highlighting
import 'highlight.js/styles/github-dark.css';

// Initialize Mermaid with configuration
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'strict',
  fontFamily: 'inherit',
});

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

/**
 * Component to render Mermaid diagrams
 */
const MermaidDiagram = ({ code }: { code: string }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
        const { svg } = await mermaid.render(id, code);
        setSvg(svg);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error rendering diagram');
      }
    };
    
    renderDiagram();
  }, [code]);

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
        <p className="font-semibold">Error en diagrama Mermaid:</p>
        <pre className="mt-2 overflow-auto">{error}</pre>
        <details className="mt-2">
          <summary className="cursor-pointer text-xs">Ver código</summary>
          <pre className="mt-1 text-xs overflow-auto">{code}</pre>
        </details>
      </div>
    );
  }

  return (
    <div 
      className="my-4 flex justify-center overflow-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

/**
 * Extract table of contents from markdown content
 */
const extractToc = (content: string): TocItem[] => {
  const headingRegex = /^(#{1,6})\s+(.+?)(?:\s*<a\s+id="([^"]+)"\s*><\/a>)?$/gm;
  const toc: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    let text = match[2].trim();
    let id = match[3];

    // Remove HTML tags from text (apply repeatedly to handle nested/malformed tags)
    let previousText = '';
    while (previousText !== text) {
      previousText = text;
      text = text.replace(/<[^>]*>/g, '');
    }
    text = text.trim();
    
    // Generate ID if not present
    if (!id) {
      id = text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    if (text) {
      toc.push({ id, text, level });
    }
  }

  return toc;
};

/**
 * Enhanced Markdown Viewer with:
 * - Syntax highlighting for code blocks
 * - Mermaid diagram support
 * - HTML rendering support
 * - Table of contents navigation
 */
const MarkdownViewer = ({ content, className = '' }: MarkdownViewerProps) => {
  const [tocOpen, setTocOpen] = useState(false);
  const toc = useMemo(() => extractToc(content), [content]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setTocOpen(false);
  };

  // Custom components for ReactMarkdown
  const components = useMemo(() => ({
    // Custom code block renderer with Mermaid support
    code: ({ node, className, children, ...props }: React.ComponentProps<'code'> & { node?: unknown }) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const codeContent = String(children).replace(/\n$/, '');
      
      // Check if it's inline code or block code
      const isBlock = className?.includes('hljs') || language;
      
      // Render Mermaid diagrams
      if (language === 'mermaid') {
        return <MermaidDiagram code={codeContent} />;
      }

      // For inline code
      if (!isBlock) {
        return (
          <code 
            className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" 
            {...props}
          >
            {children}
          </code>
        );
      }

      // For code blocks (already highlighted by rehype-highlight)
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },

    // Enhanced pre block styling
    pre: ({ children, ...props }: React.ComponentProps<'pre'>) => (
      <pre 
        className="overflow-x-auto rounded-lg p-4 text-sm bg-[#0d1117] text-[#c9d1d9]"
        {...props}
      >
        {children}
      </pre>
    ),

    // Add ID to headings for TOC navigation
    h1: ({ children, ...props }: React.ComponentProps<'h1'>) => {
      const id = generateHeadingId(children);
      return <h1 id={id} className="scroll-mt-4" {...props}>{children}</h1>;
    },
    h2: ({ children, ...props }: React.ComponentProps<'h2'>) => {
      const id = generateHeadingId(children);
      return <h2 id={id} className="scroll-mt-4" {...props}>{children}</h2>;
    },
    h3: ({ children, ...props }: React.ComponentProps<'h3'>) => {
      const id = generateHeadingId(children);
      return <h3 id={id} className="scroll-mt-4" {...props}>{children}</h3>;
    },
    h4: ({ children, ...props }: React.ComponentProps<'h4'>) => {
      const id = generateHeadingId(children);
      return <h4 id={id} className="scroll-mt-4" {...props}>{children}</h4>;
    },
    h5: ({ children, ...props }: React.ComponentProps<'h5'>) => {
      const id = generateHeadingId(children);
      return <h5 id={id} className="scroll-mt-4" {...props}>{children}</h5>;
    },
    h6: ({ children, ...props }: React.ComponentProps<'h6'>) => {
      const id = generateHeadingId(children);
      return <h6 id={id} className="scroll-mt-4" {...props}>{children}</h6>;
    },

    // Enhanced table styling
    table: ({ children, ...props }: React.ComponentProps<'table'>) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border-collapse border border-border" {...props}>
          {children}
        </table>
      </div>
    ),
    th: ({ children, ...props }: React.ComponentProps<'th'>) => (
      <th className="border border-border bg-muted px-4 py-2 text-left font-semibold" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }: React.ComponentProps<'td'>) => (
      <td className="border border-border px-4 py-2" {...props}>
        {children}
      </td>
    ),

    // Enhanced blockquote styling
    blockquote: ({ children, ...props }: React.ComponentProps<'blockquote'>) => (
      <blockquote 
        className="border-l-4 border-primary/50 pl-4 my-4 italic text-muted-foreground"
        {...props}
      >
        {children}
      </blockquote>
    ),

    // Enhanced link styling with external indicator
    a: ({ href, children, ...props }: React.ComponentProps<'a'>) => {
      const isExternal = href?.startsWith('http');
      return (
        <a 
          href={href}
          className="text-primary hover:underline"
          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          {...props}
        >
          {children}
        </a>
      );
    },

    // Enhanced image styling
    img: ({ src, alt, ...props }: React.ComponentProps<'img'>) => (
      <img 
        src={src}
        alt={alt}
        className="max-w-full h-auto rounded-lg my-4 shadow-sm"
        {...props}
      />
    ),

    // Enhanced horizontal rule
    hr: () => (
      <hr className="my-8 border-t border-border" />
    ),
  }), []);

  return (
    <div className={`relative ${className}`}>
      {/* Table of Contents Toggle Button */}
      {toc.length > 0 && (
        <div className="absolute top-0 right-0 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTocOpen(!tocOpen)}
            className="gap-2"
          >
            <List className="h-4 w-4" />
            Índice
            {tocOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </Button>
          
          {/* TOC Dropdown */}
          {tocOpen && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-background border border-border rounded-lg shadow-lg z-20">
              <ScrollArea className="max-h-80">
                <div className="p-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase px-2 py-1">
                    Tabla de contenidos
                  </p>
                  <nav className="mt-1">
                    {toc.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => scrollToHeading(item.id)}
                        className="block w-full text-left px-2 py-1.5 text-sm hover:bg-muted rounded transition-colors truncate"
                        style={{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }}
                      >
                        {item.text}
                      </button>
                    ))}
                  </nav>
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      )}

      {/* Markdown Content */}
      <div className="prose prose-slate dark:prose-invert prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-base prose-li:text-base prose-table:text-sm max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeHighlight]}
          components={components}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

/**
 * Generate a slug ID from heading content
 */
function generateHeadingId(children: React.ReactNode): string {
  const text = extractTextFromChildren(children);
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Extract text content from React children
 */
function extractTextFromChildren(children: React.ReactNode): string {
  if (typeof children === 'string') {
    return children;
  }
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join('');
  }
  if (children && typeof children === 'object' && 'props' in children) {
    return extractTextFromChildren((children as React.ReactElement).props.children);
  }
  return '';
}

export default MarkdownViewer;
