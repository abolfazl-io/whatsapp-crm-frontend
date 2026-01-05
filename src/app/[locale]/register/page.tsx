"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RegisterPage() {
  const t = useTranslations('Auth');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // ارسال درخواست به بک‌ند
      await api.post("/auth/register", {
        email: formData.email,
        password: formData.password,
        name: formData.name
      });

      setSuccess(t('registerSuccess'));
      
      // هدایت به صفحه لاگین بعد از ۲ ثانیه
      setTimeout(() => {
        router.push(`/${locale}/login`);
      }, 2000);

    } catch (err: any) {
      console.error(err);
      // نمایش خطای دریافتی از سرور یا خطای عمومی
      const msg = err.response?.data?.message || "خطا در ثبت‌نام. ممکن است ایمیل تکراری باشد.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2">
      {/* سمت چپ - بخش گرافیکی (مشابه صفحه لاگین) */}
      <div className="hidden bg-slate-900 lg:flex flex-col justify-between p-10 text-white">
        <div className="flex items-center text-lg font-bold text-blue-400">
          <div className="h-8 w-8 bg-blue-500 rounded-lg mr-2"></div>
          TeamInbox
        </div>
        <div className="space-y-4 max-w-lg">
          <blockquote className="text-2xl font-medium leading-relaxed">
            "به جمع هزاران مدیری بپیوندید که با TeamInbox ارتباطات خود را متحول کرده‌اند."
          </blockquote>
        </div>
        <div className="text-sm text-slate-500">
          © 2025 TeamInbox Inc. All rights reserved.
        </div>
      </div>

      {/* سمت راست - فرم ثبت‌نام */}
      <div className="flex items-center justify-center py-12 px-6 lg:px-8 bg-white dark:bg-slate-950">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t('registerTitle')}
            </h1>
            <p className="text-balance text-slate-500">
              {t('registerDescription')}
            </p>
          </div>
          
          <form onSubmit={handleRegister} className="grid gap-4">
            
            {/* نمایش خطا */}
            {error && (
              <Alert variant="destructive" className="bg-red-50 text-red-600 border-red-200">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* نمایش موفقیت */}
            {success && (
              <Alert className="bg-green-50 text-green-600 border-green-200">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name">{t('name')}</Label>
              <Input
                id="name"
                placeholder="Admin User"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="h-11 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="h-11 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-blue-500 dir-ltr"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="h-11 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-blue-500 dir-ltr"
              />
            </div>

            <Button type="submit" className="w-full h-11 text-base bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('registering')}
                </>
              ) : (
                t('registerBtn')
              )}
            </Button>
            
            <div className="text-center text-sm">
                <Link href={`/${locale}/login`} className="text-blue-600 hover:underline">
                    {t('haveAccount')}
                </Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}