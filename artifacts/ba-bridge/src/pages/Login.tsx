import React from 'react';
import { Link, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { storage } from '@/lib/storage';
import { useAuth } from '@/hooks/use-auth';
import { Blocks } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

type LoginForm = { email: string; password: string };

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const loginSchema = z.object({
    email: z.string().email({ message: t('emailInvalid') }),
    password: z.string().min(1, { message: t('passwordRequired') }),
  });

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  function onSubmit(data: LoginForm) {
    const users = storage.getUsers();
    const user = users.find((u) => u.email === data.email && u.password === data.password);
    if (user) {
      login(user);
      setLocation('/dashboard');
    } else {
      toast({ title: t('authFailed'), description: t('invalidCreds'), variant: 'destructive' });
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-muted/30 px-4">
      <Link href="/" className="mb-8 flex items-center gap-2 font-bold text-2xl text-foreground">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <Blocks size={24} className="text-primary-foreground" />
        </div>
        {t('appName')}
      </Link>

      <div className="w-full max-w-md bg-background rounded-2xl shadow-xl border border-border p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">{t('welcomeBack')}</h1>
          <p className="text-muted-foreground mt-2">{t('signInSubtitle')}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('emailLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder="name@company.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('passwordLabel')}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full h-11 text-base font-medium">
              {t('signInBtn')}
            </Button>
          </form>
        </Form>

        <div className="mt-8 text-center text-sm text-muted-foreground border-t border-border pt-6">
          {t('noAccount')}{' '}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            {t('getStartedFree')}
          </Link>
        </div>
      </div>
    </div>
  );
}
