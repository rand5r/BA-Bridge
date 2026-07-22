import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { useProtected } from '@/hooks/use-auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { storage, BRD } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Save, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export default function BRDForm() {
  const user = useProtected();
  const [, setLocation] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();

  const isNew = !params.id || params.id === 'new';
  const brdId = isNew ? '' : params.id!;

  const [formData, setFormData] = useState<Partial<BRD>>({
    projectName: '',
    projectDescription: '',
    businessGoals: '',
    stakeholders: '',
    functionalRequirements: '',
    nonFunctionalRequirements: '',
    businessRules: '',
    notes: '',
  });

  useEffect(() => {
    if (!isNew && user) {
      const existing = storage.getBRDById(brdId);
      if (existing && existing.userId === user.id) {
        setFormData(existing);
      } else {
        toast({ title: t('toastBrdNotFound'), variant: 'destructive' });
        setLocation('/dashboard');
      }
    }
  }, [isNew, brdId, user, setLocation, toast, t]);

  if (!user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const saveDraft = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.projectName?.trim()) {
      toast({ title: t('toastProjectNameRequired'), variant: 'destructive' });
      return null;
    }
    const now = new Date().toISOString();
    const brdToSave: BRD = {
      id: isNew ? crypto.randomUUID() : brdId,
      userId: user.id,
      projectName: formData.projectName || '',
      projectDescription: formData.projectDescription || '',
      businessGoals: formData.businessGoals || '',
      stakeholders: formData.stakeholders || '',
      functionalRequirements: formData.functionalRequirements || '',
      nonFunctionalRequirements: formData.nonFunctionalRequirements || '',
      businessRules: formData.businessRules || '',
      notes: formData.notes || '',
      status: formData.status || 'draft',
      createdAt: (formData as BRD).createdAt || now,
      updatedAt: now,
    };
    storage.saveBRD(brdToSave);
    return brdToSave;
  };

  const handleSaveDraft = (e: React.FormEvent) => {
    const saved = saveDraft(e);
    if (saved) {
      toast({ title: t('toastDraftSaved') });
      if (isNew) setLocation(`/brd/${saved.id}`);
    }
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const saved = saveDraft();
    if (saved) {
      saved.status = 'generating';
      storage.saveBRD(saved);
      setLocation(`/brd/${saved.id}/result`);
    }
  };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <AppLayout>
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => setLocation('/dashboard')} className="text-muted-foreground hover:text-foreground -ms-4">
          <BackIcon className="w-4 h-4 me-2" />
          {t('backToDashboard')}
        </Button>
      </div>

      <div className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden">
        <div className="p-8 border-b border-border bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isNew ? t('formTitleNew') : t('formTitleEdit')}
            </h1>
            <p className="text-muted-foreground mt-1">{t('formSubtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleSaveDraft} className="min-w-[120px]">
              <Save className="w-4 h-4 me-2" />
              {t('saveDraft')}
            </Button>
            <Button onClick={handleGenerate} className="min-w-[200px] shadow-sm">
              <Sparkles className="w-4 h-4 me-2" />
              {t('generateTBRD')}
            </Button>
          </div>
        </div>

        <form className="p-8 space-y-10 max-w-4xl">
          {/* 1. Core Information */}
          <section className="space-y-6">
            <h2 className="text-xl font-semibold border-b border-border pb-2">{t('section1Title')}</h2>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="projectName" className="text-base font-medium">
                  {t('projectNameLabel')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="projectName"
                  name="projectName"
                  placeholder="e.g. Next-Gen User Authentication Flow"
                  value={formData.projectName}
                  onChange={handleChange}
                  className="text-lg py-6"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="projectDescription" className="text-base font-medium">
                  {t('projectDescLabel')} <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="projectDescription"
                  name="projectDescription"
                  placeholder="High-level overview of what we are building and why."
                  value={formData.projectDescription}
                  onChange={handleChange}
                  className="min-h-[120px] text-base resize-y"
                />
              </div>
            </div>
          </section>

          {/* 2. Business Strategy */}
          <section className="space-y-6">
            <h2 className="text-xl font-semibold border-b border-border pb-2">{t('section2Title')}</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="businessGoals" className="text-base font-medium">{t('businessGoalsLabel')}</Label>
                <Textarea
                  id="businessGoals"
                  name="businessGoals"
                  placeholder={'- Increase conversion by 15%\n- Reduce support tickets'}
                  value={formData.businessGoals}
                  onChange={handleChange}
                  className="min-h-[150px]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stakeholders" className="text-base font-medium">{t('stakeholdersLabel')}</Label>
                <Textarea
                  id="stakeholders"
                  name="stakeholders"
                  placeholder={'- Sarah, Product VP\n- David, Lead Engineer'}
                  value={formData.stakeholders}
                  onChange={handleChange}
                  className="min-h-[150px]"
                />
              </div>
            </div>
          </section>

          {/* 3. Requirements & Rules */}
          <section className="space-y-6">
            <h2 className="text-xl font-semibold border-b border-border pb-2">{t('section3Title')}</h2>
            <div className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="functionalRequirements" className="text-base font-medium">{t('funcReqLabel')}</Label>
                <p className="text-sm text-muted-foreground -mt-1">{t('funcReqHint')}</p>
                <Textarea
                  id="functionalRequirements"
                  name="functionalRequirements"
                  placeholder={'1. Users must be able to log in via Google SSO.\n2. The system must send a confirmation email after purchase.'}
                  value={formData.functionalRequirements}
                  onChange={handleChange}
                  className="min-h-[150px]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nonFunctionalRequirements" className="text-base font-medium">{t('nonFuncReqLabel')}</Label>
                <p className="text-sm text-muted-foreground -mt-1">{t('nonFuncReqHint')}</p>
                <Textarea
                  id="nonFunctionalRequirements"
                  name="nonFunctionalRequirements"
                  placeholder={'- 99.9% uptime\n- Page load under 2 seconds\n- SOC2 Compliance'}
                  value={formData.nonFunctionalRequirements}
                  onChange={handleChange}
                  className="min-h-[100px]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="businessRules" className="text-base font-medium">{t('bizRulesLabel')}</Label>
                <p className="text-sm text-muted-foreground -mt-1">{t('bizRulesHint')}</p>
                <Textarea
                  id="businessRules"
                  name="businessRules"
                  placeholder={'- Only Enterprise users can access advanced analytics.\n- Passwords must expire every 90 days.'}
                  value={formData.businessRules}
                  onChange={handleChange}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </section>

          {/* 4. Additional Context */}
          <section className="space-y-6">
            <h2 className="text-xl font-semibold border-b border-border pb-2">{t('section4Title')}</h2>
            <div className="grid gap-2">
              <Label htmlFor="notes" className="text-base font-medium">{t('notesLabel')}</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Any other context that the engineering team should know."
                value={formData.notes}
                onChange={handleChange}
                className="min-h-[100px]"
              />
            </div>
          </section>

          <div className="pt-6 border-t border-border flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleSaveDraft} size="lg">
              {t('saveDraft')}
            </Button>
            <Button type="button" onClick={handleGenerate} size="lg" className="min-w-[200px]">
              <Sparkles className="w-5 h-5 me-2" />
              {t('generateTBRD')}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
