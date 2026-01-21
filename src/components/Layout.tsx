import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Icon from '@/components/ui/icon';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-xl md:text-3xl font-serif font-bold text-primary">спарком.рф</h1>
            </Link>
            
            <div className="hidden lg:flex items-center gap-6">
              <Link to="/" className={`text-base font-medium transition-colors ${isActive('/') && location.pathname === '/' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Главная</Link>
              <Link to="/events" className={`text-base font-medium transition-colors ${isActive('/events') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>События</Link>
              <Link to="/calendar" className={`text-base font-medium transition-colors ${isActive('/calendar') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Календарь</Link>
              <Link to="/bany" className={`text-base font-medium transition-colors ${isActive('/bany') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Бани</Link>
              <Link to="/masters" className={`text-base font-medium transition-colors ${isActive('/masters') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Мастера</Link>
              <Link to="/blog" className={`text-base font-medium transition-colors ${isActive('/blog') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Блог</Link>
              <Link to="/about" className={`text-base font-medium transition-colors ${isActive('/about') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>О нас</Link>
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Icon name="User" className="h-4 w-4" />
                      <span>{user.name}</span>
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

            <div className="flex lg:hidden items-center gap-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Icon name="User" className="h-5 w-5" />
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
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-destructive">
                      <Icon name="LogOut" className="mr-2 h-4 w-4" />
                      Выйти
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild variant="ghost" size="icon">
                  <Link to="/login">
                    <Icon name="LogIn" className="h-5 w-5" />
                  </Link>
                </Button>
              )}
              
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Icon name="Menu" className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                  <nav className="flex flex-col gap-4 mt-8">
                    <Link to="/" onClick={() => setMobileMenuOpen(false)} className={`text-lg font-medium py-2 px-3 rounded-md transition-colors ${isActive('/') && location.pathname === '/' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>Главная</Link>
                    <Link to="/events" onClick={() => setMobileMenuOpen(false)} className={`text-lg font-medium py-2 px-3 rounded-md transition-colors ${isActive('/events') ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>События</Link>
                    <Link to="/calendar" onClick={() => setMobileMenuOpen(false)} className={`text-lg font-medium py-2 px-3 rounded-md transition-colors ${isActive('/calendar') ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>Календарь</Link>
                    <Link to="/bany" onClick={() => setMobileMenuOpen(false)} className={`text-lg font-medium py-2 px-3 rounded-md transition-colors ${isActive('/bany') ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>Бани</Link>
                    <Link to="/masters" onClick={() => setMobileMenuOpen(false)} className={`text-lg font-medium py-2 px-3 rounded-md transition-colors ${isActive('/masters') ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>Мастера</Link>
                    <Link to="/blog" onClick={() => setMobileMenuOpen(false)} className={`text-lg font-medium py-2 px-3 rounded-md transition-colors ${isActive('/blog') ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>Блог</Link>
                    <Link to="/about" onClick={() => setMobileMenuOpen(false)} className={`text-lg font-medium py-2 px-3 rounded-md transition-colors ${isActive('/about') ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>О нас</Link>
                  </nav>
                </SheetContent>
              </Sheet>
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
                <li><Link to="/calendar" className="text-muted-foreground hover:text-primary transition-colors">Календарь</Link></li>
                <li><a href="https://t.me/sparkomrf" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">Телеграм</a></li>
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
              <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">О проекте</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};