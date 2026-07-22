import React from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/contexts/LanguageContext';
import { LogOut, Blocks } from 'lucide-react';
import { Button } from '@/components/ui/button';

function LangToggle() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="flex items-center rounded-lg border border-border overflow-hidden text-sm font-medium">
      <button
        onClick={() => setLang('en')}
        className={`px-3 py-1.5 transition-colors ${lang === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
      >
        EN
      </button>
      <button
        onClick={() => setLang('ar')}
        className={`px-3 py-1.5 transition-colors ${lang === 'ar' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
      >
        العربية
      </button>
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-foreground font-semibold text-lg hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              <Blocks size={18} className="text-white" />
            </div>
            {t('appName')}
          </Link>

          <div className="flex items-center gap-3">
            <LangToggle />
            {user && (
              <>
                <div className="w-px h-6 bg-border hidden sm:block" />
                <div className="text-sm text-muted-foreground font-medium hidden sm:block">
                  {user.name}
                </div>
                <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground">
                  <LogOut className="w-4 h-4 me-2" />
                  {t('navSignOut')}
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
