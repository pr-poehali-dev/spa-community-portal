import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { user, loading } = useAuth();
  
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary">спарком.рф</h1>
            </Link>
            <div className="flex items-center gap-2 md:gap-6">
              <Link
                to="/"
                className={`text-sm md:text-base font-medium transition-colors ${
                  isActive('/') && location.pathname === '/' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Главная
              </Link>
              <Link
                to="/events"
                className={`text-sm md:text-base font-medium transition-colors ${
                  isActive('/events') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                События
              </Link>
              <Link
                to="/bany"
                className={`text-sm md:text-base font-medium transition-colors ${
                  isActive('/bany') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Бани
              </Link>
              <Link
                to="/masters"
                className={`text-sm md:text-base font-medium transition-colors ${
                  isActive('/masters') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Мастера
              </Link>
              <Link
                to="/blog"
                className={`text-sm md:text-base font-medium transition-colors ${
                  isActive('/blog') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Блог
              </Link>
              <Link
                to="/about"
                className={`text-sm md:text-base font-medium transition-colors ${
                  isActive('/about') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                О нас
              </Link>
              {!loading && (
                <>
                  {user ? (
                    <Link to="/profile">
                      <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2">
                        <Icon name="User" size={16} />
                        {user.name}
                      </Button>
                      <Button variant="outline" size="icon" className="md:hidden">
                        <Icon name="User" size={16} />
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/auth">
                      <Button size="sm" className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 hidden md:flex">
                        Войти
                      </Button>
                      <Button size="icon" className="md:hidden bg-gradient-to-r from-amber-600 to-orange-600">
                        <Icon name="User" size={16} />
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-card border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-serif font-bold text-lg mb-4">спарком.рф</h3>
              <p className="text-sm text-muted-foreground">
                Банное сообщество Москвы. Открытые мероприятия и традиции.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Разделы</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/events" className="text-muted-foreground hover:text-primary transition-colors">События</Link></li>
                <li><Link to="/bany" className="text-muted-foreground hover:text-primary transition-colors">Бани</Link></li>
                <li><Link to="/masters" className="text-muted-foreground hover:text-primary transition-colors">Мастера</Link></li>
                <li><Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors">Блог</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Информация</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">О нас</Link></li>
                <li><Link to="/about/rules" className="text-muted-foreground hover:text-primary transition-colors">Правила</Link></li>
                <li><Link to="/about/faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
                <li><Link to="/about/contacts" className="text-muted-foreground hover:text-primary transition-colors">Контакты</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <div className="space-y-3">
                <a href="https://t.me/sparkomrf" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Icon name="Send" size={16} />
                  <span>@sparkomrf</span>
                </a>
                <a href="tel:+79991234567" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Icon name="Phone" size={16} />
                  <span>+7 (999) 123-45-67</span>
                </a>
                <a href="mailto:hello@sparkom.rf" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Icon name="Mail" size={16} />
                  <span>hello@sparkom.rf</span>
                </a>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">© 2026 спарком.рф — Банное сообщество Москвы</p>
            <div className="flex gap-4 text-sm">
              <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Политика конфиденциальности</Link>
              <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">Пользовательское соглашение</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};