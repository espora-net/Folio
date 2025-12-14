import { BookOpen, MessageSquare } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-semibold text-foreground">Folio</span>
          </div>
          
          <div className="flex items-center gap-6">
            <a 
              href="https://forms.office.com/r/zn5AwbZxmD" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Enviar feedback</span>
            </a>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Folio
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
