import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useProtected, useAuth } from '@/hooks/use-auth';
import { storage, BRD } from '@/lib/storage';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Trash2, Edit, ArrowRight, ArrowLeft, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Dashboard() {
  const user = useProtected();
  const [, setLocation] = useLocation();
  const [brds, setBrds] = useState<BRD[]>([]);
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    if (user) setBrds(storage.getUserBRDs(user.id));
  }, [user]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm(t('confirmDelete'))) {
      storage.deleteBRD(id);
      if (user) setBrds(storage.getUserBRDs(user.id));
    }
  };

  if (!user) return null;

  const ForwardIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('dashboardTitle')}</h1>
          <p className="text-muted-foreground mt-1 text-lg">{t('dashboardSubtitle')}</p>
        </div>
        <Link href="/brd/new">
          <Button size="lg" className="h-11">
            <Plus className="me-2 h-5 w-5" />
            {t('createNewBRD')}
          </Button>
        </Link>
      </div>

      {brds.length === 0 ? (
        <div className="bg-card border border-border border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">{t('noBrdsTitle')}</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8 text-lg">{t('noBrdsDesc')}</p>
          <Link href="/brd/new">
            <Button size="lg">
              <Plus className="me-2 w-5 h-5" />
              {t('createFirstBRD')}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brds.map((brd) => (
            <Link key={brd.id} href={`/brd/${brd.id}`}>
              <Card className="hover-elevate cursor-pointer h-full flex flex-col transition-all duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge
                      variant={brd.status === 'generated' ? 'default' : brd.status === 'generating' ? 'secondary' : 'outline'}
                      className="mb-2"
                    >
                      {brd.status === 'generated' ? t('statusGenerated') : brd.status === 'generating' ? t('statusProcessing') : t('statusDraft')}
                    </Badge>
                    <div className="flex items-center gap-1" style={{ opacity: 1 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => handleDelete(brd.id, e)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-xl line-clamp-1">{brd.projectName || t('untitledProject')}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-1 min-h-[40px]">
                    {brd.projectDescription || t('noDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1" />
                <CardFooter className="border-t border-border/50 pt-4 flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 me-2" />
                    {format(new Date(brd.updatedAt), 'MMM d, yyyy')}
                  </div>
                  {brd.status === 'generated' ? (
                    <span className="flex items-center text-primary font-medium">
                      {t('viewOutput')} <ForwardIcon className="w-4 h-4 ms-1" />
                    </span>
                  ) : (
                    <span className="flex items-center font-medium">
                      {t('editDraft')} <Edit className="w-4 h-4 ms-1" />
                    </span>
                  )}
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
