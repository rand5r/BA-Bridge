import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { useProtected } from '@/hooks/use-auth';
import { storage, BRD, TechnicalBRD } from '@/lib/storage';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft, ArrowRight, Edit, Download, CheckCircle, Database,
  LayoutTemplate, ShieldCheck, ListChecks, AlertTriangle, Lightbulb, Code2, BookOpen, TestTube
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { buildTBRDPdf } from '@/lib/pdf';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

async function callAI(brd: BRD, lang: string): Promise<TechnicalBRD> {
  const res = await fetch(`${BASE}/api/generate-tbrd`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectName: brd.projectName,
      projectDescription: brd.projectDescription,
      businessGoals: brd.businessGoals,
      stakeholders: brd.stakeholders,
      functionalRequirements: brd.functionalRequirements,
      nonFunctionalRequirements: brd.nonFunctionalRequirements,
      businessRules: brd.businessRules,
      notes: brd.notes,
      lang,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `Server error ${res.status}`);
  }

  const body = await res.json();
  return body.data as TechnicalBRD;
}

const METHOD_COLORS: Record<string, string> = {
  GET:    'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  POST:   'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  PUT:    'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  PATCH:  'bg-purple-500/15 text-purple-700 dark:text-purple-400',
  DELETE: 'bg-red-500/15 text-red-700 dark:text-red-400',
};

export default function BRDResult() {
  const user = useProtected();
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t, lang, isRTL } = useLanguage();

  const brdId = params.id;
  const [brd, setBrd] = useState<BRD | null>(null);
  const [tbrd, setTbrd] = useState<TechnicalBRD | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState('');

  useEffect(() => {
    if (!user || !brdId) return;

    const existing = storage.getBRDById(brdId);
    if (!existing || existing.userId !== user.id) {
      setLocation('/dashboard');
      return;
    }

    setBrd(existing);

    if (existing.status === 'generated' && existing.technicalBRD) {
      setTbrd(existing.technicalBRD);
      setIsGenerating(false);
      return;
    }

    const steps = [
      t('synthStep1'),
      t('synthStep2'),
      t('synthStep3'),
      t('synthStep4'),
      t('synthStep5'),
    ];
    setLoadingStep(steps[0]);
    let stepIdx = 0;
    const stepTimer = setInterval(() => {
      stepIdx = (stepIdx + 1) % steps.length;
      setLoadingStep(steps[stepIdx]);
    }, 2000);

    callAI(existing, lang)
      .then((result) => {
        const updated: BRD = {
          ...existing,
          status: 'generated',
          technicalBRD: result,
          updatedAt: new Date().toISOString(),
        };
        storage.saveBRD(updated);
        setBrd(updated);
        setTbrd(result);
      })
      .catch((err: Error) => {
        setError(err.message);
        storage.saveBRD({ ...existing, status: 'draft', updatedAt: new Date().toISOString() });
      })
      .finally(() => {
        clearInterval(stepTimer);
        setIsGenerating(false);
      });

    return () => clearInterval(stepTimer);
  }, [user, brdId, setLocation]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDownload = async () => {
    if (!brd || !tbrd) return;
    setIsDownloading(true);
    try {
      const blob = await buildTBRDPdf(
        {
          projectName: brd.projectName,
          authorName:  user!.name,
          date:        new Date().toLocaleDateString(),
        },
        {
          subtitle:           t('techReqsSubtitle'),
          metaAuthor:         t('metaAuthor'),
          metaDate:           t('metaDate'),
          metaVersion:        t('metaVersion'),
          metaPoweredBy:      t('metaPoweredBy'),
          versionLabel:       t('versionLabel'),
          poweredByValue:     t('poweredByValue'),
          sectionGaps:        t('sectionGaps'),
          sectionRecs:        t('sectionRecs'),
          sectionOverview:    t('sectionOverview'),
          sectionFuncSpec:    t('sectionFuncSpec'),
          sectionNonFunc:     t('sectionNonFunc'),
          sectionDBTables:    t('sectionDBTables'),
          sectionAPIs:        t('sectionAPIs'),
          sectionUserStories: t('sectionUserStories'),
          sectionAcceptance:  t('sectionAcceptance'),
          colCategory:        t('colCategory'),
          colRequirement:     t('colRequirement'),
          colMetric:          t('colMetric'),
          colTable:           t('colTable'),
          colDescription:     t('colDescription'),
          colFields:          t('colFields'),
          epicLabel:          t('epicLabel'),
          docFooterNote:      t('docFooterNote'),
        },
        tbrd,
        lang,
      );
      const safeName = brd.projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = `${safeName}_technical_brd.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast({
        title:       t('exportFailed'),
        description: err instanceof Error ? err.message : t('exportFailedDesc'),
        variant:     'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (!user || !brd) return null;

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const FwdIcon  = isRTL ? ArrowLeft  : ArrowRight;

  return (
    <AppLayout>
      {/* Top bar */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Button variant="ghost" onClick={() => setLocation('/dashboard')} className="text-muted-foreground hover:text-foreground -ms-4">
          <BackIcon className="w-4 h-4 me-2" />
          {t('backToDashboard')}
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setLocation(`/brd/${brd.id}`)} disabled={isGenerating}>
            <Edit className="w-4 h-4 me-2" />
            {t('editSourceBRD')}
          </Button>
          <Button onClick={handleDownload} disabled={isGenerating || isDownloading}>
            <Download className="w-4 h-4 me-2" />
            {isDownloading ? t('generatingPDF') : t('downloadPDF')}
          </Button>
        </div>
      </div>

      {/* Title */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold tracking-tight">{brd.projectName}</h1>
          {!isGenerating && !error && (
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              <CheckCircle className="w-3 h-3 me-1" /> {t('badgeGenerated')}
            </Badge>
          )}
          {isGenerating && (
            <Badge variant="secondary" className="animate-pulse">{t('badgeGenerating')}</Badge>
          )}
          {error && (
            <Badge variant="destructive">{t('badgeFailed')}</Badge>
          )}
        </div>
        <p className="text-muted-foreground text-lg">{t('techReqsSubtitle')}</p>
      </div>

      {/* Loading state */}
      {isGenerating && (
        <Card className="p-12 min-h-[600px] flex flex-col items-center justify-center border-dashed">
          <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-[spin_3s_linear_infinite]" />
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <LayoutTemplate className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h2 className="text-2xl font-semibold mb-3">{t('synthesisTitle')}</h2>
          <p className="text-muted-foreground text-center max-w-md mb-3 transition-all duration-500">{loadingStep}</p>
          <p className="text-xs text-muted-foreground mb-8">{t('synthesisNote')}</p>
          <div className="w-full max-w-lg space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[95%]" />
            <Skeleton className="h-4 w-[75%]" />
            <Skeleton className="h-4 w-[85%]" />
          </div>
        </Card>
      )}

      {/* Error state */}
      {!isGenerating && error && (
        <Card className="p-12 flex flex-col items-center justify-center border-destructive/30 bg-destructive/5">
          <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t('genFailedTitle')}</h2>
          <p className="text-muted-foreground text-center max-w-md mb-6">{error}</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setLocation('/dashboard')}>{t('backToDashboard')}</Button>
            <Button onClick={() => setLocation(`/brd/${brd.id}`)}>{t('editAndRetry')}</Button>
          </div>
        </Card>
      )}

      {/* Generated document */}
      {!isGenerating && !error && tbrd && (
        <div className="bg-card border border-border shadow-sm rounded-xl p-8 md:p-12 space-y-12">

          {/* Header */}
          <div className="border-b border-border pb-8 text-center">
            <h1 className="text-4xl font-extrabold mb-3">{brd.projectName}</h1>
            <p className="text-xl text-muted-foreground mb-6">{t('techReqsSubtitle')}</p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <span><strong>{t('metaAuthor')}:</strong> {user.name}</span>
              <span><strong>{t('metaDate')}:</strong> {new Date().toLocaleDateString()}</span>
              <span><strong>{t('metaVersion')}:</strong> {t('versionLabel')}</span>
              <span><strong>{t('metaPoweredBy')}:</strong> {t('poweredByValue')}</span>
            </div>
          </div>

          {/* Gaps & Recommendations */}
          {((tbrd.missingRequirements?.length > 0) || (tbrd.recommendations?.length > 0)) && (
            <div className="grid md:grid-cols-2 gap-6">
              {tbrd.missingRequirements?.length > 0 && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-6">
                  <h3 className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-4 h-4" /> {t('sectionGaps')}
                  </h3>
                  <ul className="space-y-2">
                    {tbrd.missingRequirements.map((item, i) => (
                      <li key={i} className="text-sm flex items-start gap-2 text-foreground">
                        <FwdIcon className="w-3 h-3 mt-1 shrink-0 text-amber-600" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {tbrd.recommendations?.length > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                  <h3 className="font-semibold text-primary flex items-center gap-2 mb-4">
                    <Lightbulb className="w-4 h-4" /> {t('sectionRecs')}
                  </h3>
                  <ul className="space-y-2">
                    {tbrd.recommendations.map((item, i) => (
                      <li key={i} className="text-sm flex items-start gap-2 text-foreground">
                        <FwdIcon className="w-3 h-3 mt-1 shrink-0 text-primary" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* 1. Technical Overview */}
          <section>
            <h2 className="text-2xl font-bold flex items-center gap-2 border-b border-border pb-2 mb-4">
              <BookOpen className="w-6 h-6 text-primary" /> {t('sectionOverview')}
            </h2>
            {tbrd.technicalOverview?.split('\n').filter(Boolean).map((para, i) => (
              <p key={i} className="leading-relaxed text-foreground mb-4">{para}</p>
            ))}
          </section>

          {/* 2. Functional Specification */}
          {tbrd.functionalSpecification?.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold flex items-center gap-2 border-b border-border pb-2 mb-6">
                <ListChecks className="w-6 h-6 text-primary" /> {t('sectionFuncSpec')}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {tbrd.functionalSpecification.map((mod, i) => (
                  <div key={i} className="border border-border rounded-lg p-5 bg-muted/20">
                    <h3 className="font-semibold text-base mb-1">{mod.module}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{mod.description}</p>
                    {mod.details?.length > 0 && (
                      <ul className="space-y-1">
                        {mod.details.map((d, j) => (
                          <li key={j} className="text-sm flex items-start gap-2">
                            <FwdIcon className="w-3 h-3 mt-1 shrink-0 text-primary" /> {d}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 3. Non-Functional Specification */}
          {tbrd.nonFunctionalSpecification?.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold flex items-center gap-2 border-b border-border pb-2 mb-6">
                <ShieldCheck className="w-6 h-6 text-primary" /> {t('sectionNonFunc')}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-y border-border">
                      <th className="p-3 font-semibold">{t('colCategory')}</th>
                      <th className="p-3 font-semibold">{t('colRequirement')}</th>
                      <th className="p-3 font-semibold">{t('colMetric')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {tbrd.nonFunctionalSpecification.map((nf, i) => (
                      <tr key={i}>
                        <td className="p-3 font-medium text-primary">{nf.category}</td>
                        <td className="p-3 text-foreground">{nf.requirement}</td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">{nf.metric}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* 4. Database Tables */}
          {tbrd.databaseTables?.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold flex items-center gap-2 border-b border-border pb-2 mb-6">
                <Database className="w-6 h-6 text-primary" /> {t('sectionDBTables')}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-y border-border">
                      <th className="p-3 font-semibold">{t('colTable')}</th>
                      <th className="p-3 font-semibold">{t('colDescription')}</th>
                      <th className="p-3 font-semibold">{t('colFields')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {tbrd.databaseTables.map((tbl, i) => (
                      <tr key={i}>
                        <td className="p-3 font-mono text-primary font-medium">{tbl.name}</td>
                        <td className="p-3 text-foreground">{tbl.description}</td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">{tbl.fields}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* 5. API Specification */}
          {tbrd.apis?.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold flex items-center gap-2 border-b border-border pb-2 mb-6">
                <Code2 className="w-6 h-6 text-primary" /> {t('sectionAPIs')}
              </h2>
              <div className="space-y-3">
                {tbrd.apis.map((api, i) => (
                  <div key={i} className="border border-border rounded-lg overflow-hidden">
                    <div className="bg-muted/40 px-4 py-3 font-mono text-sm border-b border-border flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-xs ${METHOD_COLORS[api.method] ?? 'bg-muted text-foreground'}`}>
                        {api.method}
                      </span>
                      {api.endpoint}
                    </div>
                    <div className="px-4 py-3 text-sm text-muted-foreground">{api.description}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 6. User Stories */}
          {tbrd.userStories?.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold flex items-center gap-2 border-b border-border pb-2 mb-6">
                <BookOpen className="w-6 h-6 text-primary" /> {t('sectionUserStories')}
              </h2>
              <div className="space-y-6">
                {tbrd.userStories.map((epic, i) => (
                  <div key={i} className="bg-card border border-border rounded-lg p-6 shadow-sm">
                    <h3 className="font-semibold text-lg mb-4">{t('epicLabel')}: {epic.epic}</h3>
                    <ul className="space-y-4">
                      {epic.stories.map((story, j) => (
                        <li key={j} className="border-s-2 border-primary ps-4 text-sm text-foreground">{story}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 7. Acceptance Criteria */}
          {tbrd.acceptanceCriteria?.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold flex items-center gap-2 border-b border-border pb-2 mb-6">
                <TestTube className="w-6 h-6 text-primary" /> {t('sectionAcceptance')}
              </h2>
              <div className="space-y-4">
                {tbrd.acceptanceCriteria.map((ac, i) => (
                  <div key={i} className="border border-border rounded-lg p-5 bg-muted/10">
                    <h3 className="font-semibold mb-3 text-foreground">{ac.feature}</h3>
                    <ul className="space-y-2">
                      {ac.criteria.map((c, j) => (
                        <li key={j} className="text-sm flex items-start gap-2 text-muted-foreground">
                          <CheckCircle className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" /> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          <p className="text-xs text-muted-foreground text-center pt-8 border-t border-border">
            {t('docFooterNote')} — "{brd.projectName}"
          </p>
        </div>
      )}
    </AppLayout>
  );
}
