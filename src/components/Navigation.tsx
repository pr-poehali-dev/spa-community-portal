interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const Navigation = ({ activeSection, onSectionChange }: NavigationProps) => {
  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary">спарком.рф</h1>
          <div className="flex gap-2 md:gap-6">
            {['home', 'events', 'about', 'contacts'].map((section) => (
              <button
                key={section}
                onClick={() => onSectionChange(section)}
                className={`text-sm md:text-base font-medium transition-colors ${
                  activeSection === section ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {section === 'home' && 'Главная'}
                {section === 'events' && 'События'}
                {section === 'about' && 'О нас'}
                {section === 'contacts' && 'Контакты'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
