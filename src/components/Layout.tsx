import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
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
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Icon name="User" className="h-4 w-4" />
                      <span className="hidden md:inline">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/account" className="cursor-pointer">
                        <Icon name="LayoutDashboard" className="mr-2 h-4 w-4" />
                        Личный кабинет
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/account" className="cursor-pointer">
                        <Icon name="Settings" className="mr-2 h-4 w-4" />
                        Настройки
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-destructive">
                      <Icon name="LogOut" className="mr-2 h-4 w-4" />
                      Выйти
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild variant="default" size="sm">
                  <Link to="/login">
                    <Icon name="LogIn" className="h-4 w-4 mr-2" />
                    Войти
                  </Link>
                </Button>
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