"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation"; // 👈 useParams اضافه شد
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageSquare, User, Mail, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

// 👈 ورودی‌های تابع (props) را پاک کردیم چون از هوک استفاده می‌کنیم
export default function RegisterPage() {
  const t = useTranslations('Register');
  const router = useRouter();
  const params = useParams(); // 👈 دریافت پارامترها با هوک
  const locale = params.locale as string; // 👈 استخراج زبان
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      // ارسال درخواست به بک‌ند
        await api.post("/auth/register", { 
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
      
      // انتقال به صفحه لاگین بعد از ۲ ثانیه
      setTimeout(() => {
        router.push(`/${locale}/login`);
      }, 2000);

    } catch (error: any) {
      console.error(error);
      setStatus({ 
        type: 'error', 
        msg: error.response?.data?.message || t('error') 
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans">
      
      {/* --- Background Effects (Aurora) --- */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 dark:bg-blue-600/20 blur-[100px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/20 dark:bg-purple-600/20 blur-[100px] animate-pulse-slow delay-1000"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"></div>
      </div>

      {/* --- Main Card --- */}
      <Card className="w-full max-w-md border-slate-200 dark:border-slate-800 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <CardHeader className="space-y-1 text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <MessageSquare className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">{t('title')}</CardTitle>
          <CardDescription>{t('subtitle')}</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            
            {status && (
                <Alert variant={status.type === 'error' ? "destructive" : "default"} className={status.type === 'success' ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800" : ""}>
                    {status.type === 'success' ? <CheckCircle2 className="h-4 w-4"/> : <AlertCircle className="h-4 w-4"/>}
                    <AlertDescription>{status.msg}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">{t('name_label')}</Label>
              <div className="relative">
                <User className="absolute right-3 top-2.5 h-5 w-5 text-slate-400 left-auto" /> 
                <Input 
                  id="name" 
                  placeholder="Ali Rezaei" 
                  className="pr-10"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('email_label')}</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-2.5 h-5 w-5 text-slate-400" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  className="pr-10 dir-ltr text-right" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('password_label')}</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-2.5 h-5 w-5 text-slate-400" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="pr-10 dir-ltr text-right" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  minLength={6}
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base font-semibold shadow-lg shadow-blue-500/20" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> لطفا صبر کنید...
                </>
              ) : (
                <>
                  {t('submit_btn')} <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                </>
              )}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              <Link href={`/${locale}/login`} className="hover:text-blue-600 underline underline-offset-4 transition-colors">
                {t('login_link')}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
      
      {/* Footer Copyright */}
      <div className="absolute bottom-4 text-center text-xs text-slate-400">
        © 2025 TeamInbox. All rights reserved.
      </div>
    </div>
  );
}