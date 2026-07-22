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
import { useLanguage } from '@/contexts/LanguageContext';

type RegisterForm = { name: string; email: string; password: string; confirmPassword: string };

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { t } = useLanguage();

  const registerSchema = z
    .object({
      name: z.string().min(2, { message: t('nameRequired') }),
      email: z.string().email({ message: t('emailInvalid') }),
      password: z.string().min(6, { message: t('passwordMin') }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('passwordsNoMatch'),
      path: ['confirmPassword'],
    });

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  function onSubmit(data: RegisterForm) {
    const users = storage.getUsers();
    if (users.some((u) => u.email === data.email)) {
      form.setError('email', { message: t('emailRegistered') });
      return;
    }
    const newUser = { id: crypto.randomUUID(), name: data.name, email: data.email, password: data.password };
    users.push(newUser);
    storage.saveUsers(users);
    login(newUser);
    setLocation('/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-muted/30 px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2 font-bold text-2xl text-foreground">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <Blocks size={24} className="text-primary-foreground" />
        </div>
        {t('appName')}
      </Link>

      <div className="w-full max-w-md bg-background rounded-2xl shadow-xl border border-border p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">{t('createAccountTitle')}</h1>
          <p className="text-muted-foreground mt-2">{t('createAccountSubtitle')}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fullName')}</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('workEmail')}</FormLabel>
                  <FormControl>
                    <Input placeholder="jane@company.com" {...field} />
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

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('confirmPasswordLabel')}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full h-11 text-base font-medium mt-2">
              {t('createAccountBtn')}
            </Button>
          </form>
        </Form>

        <div className="mt-8 text-center text-sm text-muted-foreground border-t border-border pt-6">
          {t('alreadyHaveAccount')}{' '}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            {t('signInLink')}
          </Link>
        </div>
      </div>
    </div>
  );
}
