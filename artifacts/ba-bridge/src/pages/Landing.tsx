import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Blocks, ArrowRight, FileText, Zap, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

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

export default function Landing() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-foreground">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Blocks size={20} className="text-primary-foreground" />
            </div>
            {t('appName')}
          </div>
          <div className="flex items-center gap-3">
            <LangToggle />
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t('navLogIn')}
            </Link>
            <Link href="/register">
              <Button size="sm">{t('navGetStarted')}</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col pt-16">
        <section className="py-24 md:py-32 px-4 max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary font-medium mb-4">
            <span className="flex h-2 w-2 rounded-full bg-primary me-2"></span>
            {t('landingBadge')}
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            {t('landingH1a')} <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              {t('landingH1b')}
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('landingSubtext')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register">
              <Button size="lg" className="h-14 px-8 text-lg rounded-xl">
                {t('landingCta1')}
                <ArrowRight className="ms-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-xl">
                {t('landingCta2')}
              </Button>
            </Link>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-24 bg-muted/50 border-t border-border">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">{t('featureSectionTitle')}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{t('featureSectionSub')}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-background p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-6">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{t('feature1Title')}</h3>
                <p className="text-muted-foreground leading-relaxed">{t('feature1Desc')}</p>
              </div>

              <div className="bg-background p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{t('feature2Title')}</h3>
                <p className="text-muted-foreground leading-relaxed">{t('feature2Desc')}</p>
              </div>

              <div className="bg-background p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{t('feature3Title')}</h3>
                <p className="text-muted-foreground leading-relaxed">{t('feature3Desc')}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          {t('footerCopy').replace('{year}', String(year))}
        </div>
      </footer>
    </div>
  );
}
