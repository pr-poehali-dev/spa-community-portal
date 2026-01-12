import Icon from '@/components/ui/icon';

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© 2026 спарком.рф — Банное сообщество Москвы</p>
          <div className="flex gap-4">
            <a href="https://t.me/sparkomrf" className="text-muted-foreground hover:text-primary transition-colors">
              <Icon name="Send" size={20} />
            </a>
            <a href="tel:+79991234567" className="text-muted-foreground hover:text-primary transition-colors">
              <Icon name="Phone" size={20} />
            </a>
            <a href="mailto:hello@sparkom.rf" className="text-muted-foreground hover:text-primary transition-colors">
              <Icon name="Mail" size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
