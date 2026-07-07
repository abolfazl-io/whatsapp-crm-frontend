"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation"; // 👈 useParams اضافه شد
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() { 
  const t = useTranslations('Auth');
  const tr = useTranslations('Testimonial');
  const router = useRouter();
  const params = useParams(); 
  const locale = params.locale as string; 
  const text = tr("quote");


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      // هدایت به داشبورد با زبان صحیح
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      if (err.response?.status === 401) setError(t('failed'));
      else setError("Connection Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2">
      {/* سمت چپ (در موبایل مخفی) - بخش هنری */}
      <div className="hidden bg-slate-900 lg:flex flex-col justify-between p-10 text-white">
        <div className="flex items-center text-lg font-bold text-blue-400">
          <div className="h-8 w-8 bg-blue-500 rounded-lg mr-2"></div>
          TeamInbox
        </div>
        <div className="space-y-4 max-w-lg">
          <blockquote className="text-2xl font-medium leading-relaxed">
            "{text}"
          </blockquote>
          <footer className="text-sm text-slate-400">Sofia Davis - مدیر فروش</footer>
        </div>
        <div className="text-sm text-slate-500">
          © 2025 TeamInbox Inc. All rights reserved.
        </div>
      </div>

      {/* سمت راست - فرم لاگین */}
      <div className="flex items-center justify-center py-12 px-6 lg:px-8 bg-white">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t('title')}</h1>
            <p className="text-balance text-slate-500">
              {t('description')}
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="grid gap-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg text-center font-medium animate-pulse">
                {error}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">{t('password')}</Label>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <Button type="submit" className="w-full h-11 text-base bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('loggingIn')}
                </>
              ) : (
                t('loginBtn')
              )}
            </Button>
            {/* <Button variant="outline" className="w-full h-11">
              ورود با گوگل
            </Button> */}
            <div className="mt-4 text-center text-sm">
              <Link href={`/${locale}/register`} className="text-slate-500 hover:text-blue-600 hover:underline">{t('noAccount')}</Link>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}