"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api"; 
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquareCode, Send, Loader2, RefreshCw, Smartphone, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl"; 

export default function OtpSendPage() {
  // 1. فراخوانی هوک‌های ترجمه
  const t = useTranslations('Otp');
  const tCommon = useTranslations('Common');
  
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [brand, setBrand] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0); 

  // مدیریت تایمر
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const generateRandomCode = () => {
    const random = Math.floor(10000 + Math.random() * 90000).toString();
    setCode(random);
  };

  const validatePhone = (p: string) => {
    const regex = /^09\d{9}$/;
    return regex.test(p);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (timer > 0) return; 
    if (!phone || !code) {
      alert(tCommon('error')); // یا متن اختصاصی برای خطا
      return;
    }
    // چک کردن فرمت فقط برای شماره‌های ایران منطقی است، اگر پروژه بین‌المللی است شاید بخواهید این را بردارید
    if (!validatePhone(phone)) {
      alert("Invalid Phone Number"); // می‌توانید این را هم به ترجمه‌ها اضافه کنید
      return;
    }

    setLoading(true);
    try {
      await api.post("/otp/send", {
        sessionId: "session_1",
        phone: phone,
        code: code,
        brand: brand || "TeamInbox"
      });

      alert(tCommon('success')); // ✅ استفاده از ترجمه موفقیت
      setTimer(60); 
    } catch (error: any) {
      console.error(error);
      alert(tCommon('error')); // ❌ استفاده از ترجمه خطا
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-green-600" />
          {t('title')} {/* 👈 تیتر ترجمه شده */}
        </h1>
        <p className="text-slate-500">
          {t('description')} {/* 👈 توضیحات ترجمه شده */}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* فرم ارسال */}
        <Card className="border-t-4 border-t-green-600 shadow-sm">
          <CardHeader>
            <CardTitle>{t('manualSend')}</CardTitle>
            <CardDescription>{t('manualDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendOtp} className="space-y-4">
              
              <div className="space-y-2">
                <Label>{t('phoneLabel')}</Label>
                <div className="relative">
                  <Smartphone className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="0912..." 
                    className="pr-9 dir-ltr text-left" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('codeLabel')}</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MessageSquareCode className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                      placeholder="12345" 
                      className="pr-9 text-center tracking-widest font-mono text-lg" 
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                  </div>
                  <Button type="button" variant="outline" onClick={generateRandomCode} title={t('generate')}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('brandLabel')}</Label>
                <Input 
                  placeholder="My Shop" 
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 mt-4 transition-all" 
                disabled={loading || timer > 0}
              >
                {loading ? (
                  <Loader2 className="animate-spin ml-2 h-4 w-4" />
                ) : timer > 0 ? (
                  // استفاده از پارامتر در ترجمه (مثلاً: Please wait 30s)
                  t('wait', {timer: timer}) 
                ) : (
                  <>
                    <Send className="ml-2 h-4 w-4" /> {t('sendBtn')}
                  </>
                )}
              </Button>

            </form>
          </CardContent>
        </Card>

        {/* راهنمای API */}
        <div className="space-y-6">
          <Card className="bg-slate-900 text-white border-none">
            <CardHeader>
              <CardTitle className="text-lg text-green-400">{t('docsTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm font-mono dir-ltr text-left">
              <p className="text-slate-400 font-sans">{t('docsDesc')}</p>
              <div>
                <p className="text-slate-500 mb-1">// Endpoint</p>
                <div className="bg-black/50 p-2 rounded border border-slate-700 text-blue-300 break-all">
                  POST /otp/send
                </div>
              </div>
              <div>
                <p className="text-slate-400 mb-1">// Request Body</p>
                <pre className="bg-black/50 p-2 rounded border border-slate-700 text-orange-300 overflow-x-auto">
{`{
  "sessionId": "session_1",
  "phone": "0912...",
  "code": "85902",
  "brand": "MyShop"
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}