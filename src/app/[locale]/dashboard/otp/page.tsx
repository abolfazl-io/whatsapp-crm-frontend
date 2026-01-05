"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api"; 
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquareCode, Send, Loader2, RefreshCw, Smartphone, ShieldCheck } from "lucide-react";

export default function OtpSendPage() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [brand, setBrand] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0); // برای محدودیت ارسال (Rate Limit)

  // مدیریت تایمر معکوس
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // تولید کد تصادفی
  const generateRandomCode = () => {
    const random = Math.floor(10000 + Math.random() * 90000).toString();
    setCode(random);
  };

  // اعتبارسنجی شماره موبایل
  const validatePhone = (p: string) => {
    const regex = /^09\d{9}$/;
    return regex.test(p);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (timer > 0) return; // اگر تایمر فعال است، اجازه نده
    if (!phone || !code) {
      alert("لطفاً شماره و کد را وارد کنید.");
      return;
    }
    if (!validatePhone(phone)) {
      alert("شماره موبایل نامعتبر است (باید ۱۱ رقم و با ۰۹ شروع شود).");
      return;
    }

    setLoading(true);
    try {
      await api.post("/otp/send", {
        sessionId: "session_1",
        phone: phone,
        code: code,
        brand: brand || "تیم اینباکس"
      });

      alert("✅ کد با موفقیت ارسال شد!");
      setTimer(60); // فعال کردن تایمر ۶۰ ثانیه‌ای
    } catch (error: any) {
      console.error(error);
      alert("❌ خطا در ارسال. ربات متصل نیست یا مشکلی پیش آمده.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-green-600" />
          سرویس رمز یکبار مصرف (OTP)
        </h1>
        <p className="text-slate-500">
          ارسال کد احراز هویت از طریق واتساپ (امن، سریع و رایگان)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* فرم ارسال */}
        <Card className="border-t-4 border-t-green-600 shadow-sm">
          <CardHeader>
            <CardTitle>ارسال دستی کد</CardTitle>
            <CardDescription>تست عملکرد API و ارسال تکی</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendOtp} className="space-y-4">
              
              <div className="space-y-2">
                <Label>شماره موبایل</Label>
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
                <Label>کد تایید</Label>
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
                  <Button type="button" variant="outline" onClick={generateRandomCode} title="تولید کد">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>نام برند (اختیاری)</Label>
                <Input 
                  placeholder="مثال: فروشگاه من" 
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
                  `لطفاً ${timer} ثانیه صبر کنید`
                ) : (
                  <>
                    <Send className="ml-2 h-4 w-4" /> ارسال کد
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
              <CardTitle className="text-lg text-green-400">مستندات توسعه‌دهندگان</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm font-mono dir-ltr text-left">
              <div>
                <p className="text-slate-400 mb-1">// Endpoint</p>
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