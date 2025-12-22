"use client";

import { useState, useEffect, useRef } from "react"; // useRef اضافه شد
import { usePathname } from "next/navigation";
import { io } from "socket.io-client";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, QrCode, Wifi, WifiOff, RefreshCw, LogOut, Unplug } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'fa';

  const [status, setStatus] = useState<"DISCONNECTED" | "SCAN_QR" | "CONNECTED" | "LOADING">("LOADING");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [loadingAction, setLoadingAction] = useState(false);

  // برای جلوگیری از اجرای تکراری درخواست‌ها
  const isStartingRef = useRef(false);

  // خروج از پنل مدیریت
  const handleAppLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = `/${currentLocale}/login`;
  };

  // قطع اتصال واتساپ
  const disconnectWhatsapp = async () => {
    try {
      setLoadingAction(true);
      addLog("⚠️ در حال قطع اتصال واتساپ...");
      await api.delete("/whatsapp/session"); 
      setStatus("DISCONNECTED");
      setQrCode(null);
      setPhone(null);
      addLog("✅ واتساپ قطع شد.");
    } catch (error) {
      console.error(error);
      addLog("❌ خطا در قطع ارتباط واتساپ.");
    } finally {
      setLoadingAction(false);
    }
  };

  // تابع لاگ‌انداز
  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 5));
  };

  // استارت دستی یا خودکار ربات
  const startSession = async () => {
    if (isStartingRef.current) return; // اگر قبلاً درخواست داده، دوباره نده
    isStartingRef.current = true;
    
    try {
      // فقط اگر دستی کلیک شده بود لودینگ نشان بده
      if (!loadingAction) setLoadingAction(true); 
      
      addLog("🚀 تلاش برای اتصال به واتساپ...");
      await api.post("/whatsapp/start", {});
      
      // موفقیت‌آمیز بود، اما وضعیت نهایی را سوکت یا پولینگ آپدیت می‌کند
    } catch (error) {
      addLog("❌ خطا در استارت ربات.");
    } finally {
      setLoadingAction(false);
      isStartingRef.current = false;
    }
  };

  // تابع بررسی وضعیت (قلب تپنده صفحه)
  const checkStatus = async (autoStart = false) => {
    try {
      const res = await api.get("/whatsapp/status");
      const backendStatus = res.data.status;
      
      if (backendStatus === "CONNECTED") {
        setStatus("CONNECTED");
        setPhone(res.data.phone);
        // اگر قبلاً QR داشتیم پاکش کن
        setQrCode(null);
      } else if (backendStatus === "SCAN_QR") {
         setStatus("SCAN_QR");
         if(res.data.qr) setQrCode(res.data.qr);
      } else {
        setStatus("DISCONNECTED");
        
        // 🔥 جادوی اتصال خودکار:
        // اگر وضعیت قطع بود و ما اجازه استارت خودکار داشتیم، دکمه را بزن!
        if (autoStart) {
            console.log("🔄 وضعیت قطع است، تلاش برای اتصال خودکار...");
            startSession();
        }
      }
    } catch (error: any) {
      console.error("❌ خطا در ارتباط با سرور:", error.message);
      setStatus("DISCONNECTED");
    }
  };

  // مدیریت چرخه حیات و سوکت
  useEffect(() => {
    // ۱. اتصال به سوکت
    const socket = io("http://localhost:3000");

    socket.on("connect", () => {
        console.log("Socket connected");
    });
    
    socket.on("session:qr", (data) => {
      setStatus("SCAN_QR");
      setQrCode(data.qr);
      addLog("📷 بارکد جدید دریافت شد (اسکن کنید)");
    });

    socket.on("session:connected", (data) => {
      setStatus("CONNECTED");
      setQrCode(null);
      setPhone(data.phone);
      addLog(`✅ متصل شد: ${data.phone}`);
    });

    socket.on("session:disconnected", () => {
      setStatus("DISCONNECTED");
      addLog("❌ ارتباط قطع شد");
      // اگر قطع شد، ۳ ثانیه بعد چک کن ببین می‌توانیم برگردیم؟
      setTimeout(() => checkStatus(true), 3000);
    });

    // ۲. بررسی اولیه + استارت خودکار (true)
    checkStatus(true);

    // ۳. بررسی دوره‌ای هر ۵ ثانیه (Polling)
    // این باعث می‌شود حتی اگر سوکت کار نکند، وضعیت آپدیت شود
    const interval = setInterval(() => {
        checkStatus(false); // اینجا false می‌فرستیم که هی پشت سر هم استارت نزند
    }, 5000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">تنظیمات اتصال</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-1 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              وضعیت واتساپ
              {status === "CONNECTED" ? (
                <Badge className="bg-green-500 hover:bg-green-600">متصل</Badge>
              ) : status === "SCAN_QR" ? (
                <Badge className="bg-yellow-500 hover:bg-yellow-600">انتظار اسکن</Badge>
              ) : status === "LOADING" ? (
                <Badge className="bg-slate-500">در حال بررسی...</Badge>
              ) : (
                <Badge variant="destructive">قطع</Badge>
              )}
            </CardTitle>
            <CardDescription>
              مدیریت اتصال ربات به شبکه واتساپ
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-[320px] space-y-6">
            
            {status === "LOADING" && (
              <div className="flex flex-col items-center gap-2">
                 <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
                 <p className="text-sm text-slate-400">در حال برقراری ارتباط با سرور...</p>
              </div>
            )}

            {status === "DISCONNECTED" && (
              <div className="text-center space-y-4 w-full px-6">
                <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <WifiOff className="h-10 w-10 text-slate-400" />
                </div>
                <p className="text-sm text-muted-foreground">هنوز متصل نشده‌اید.</p>
                <Button onClick={() => startSession()} disabled={loadingAction} size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                  {loadingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <RefreshCw className="mr-2 h-4 w-4" />}
                  شروع اتصال جدید
                </Button>
              </div>
            )}

            {status === "SCAN_QR" && qrCode && (
              <div className="text-center space-y-4 w-full">
                <div className="relative p-2 bg-white border-2 border-slate-200 rounded-xl shadow-inner mx-auto w-fit">
                   <img src={qrCode} alt="Scan QR" className="w-56 h-56 object-contain" />
                </div>
                <p className="text-sm text-muted-foreground animate-pulse">
                  لطفاً با واتساپ گوشی اسکن کنید...
                </p>
              </div>
            )}

            {status === "CONNECTED" && (
              <div className="w-full space-y-6">
                <div className="text-center space-y-2">
                    <div className="h-24 w-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto border-4 border-green-50 dark:border-green-900/50 shadow-lg shadow-green-100">
                    <Wifi className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">شما آنلاین هستید!</h3>
                    <p className="font-mono text-slate-500 dir-ltr">{phone}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 px-4">
                    <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="secondary" className="w-full border border-slate-200 text-slate-700 hover:bg-slate-100">
                        <Unplug className="mr-2 h-4 w-4" />
                        تغییر شماره
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>خروج از واتساپ؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            ارتباط ربات با واتساپ قطع می‌شود و برای استفاده مجدد باید دوباره QR کد را اسکن کنید.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>انصراف</AlertDialogCancel>
                        <AlertDialogAction onClick={disconnectWhatsapp} className="bg-red-600 hover:bg-red-700">
                            بله، قطع کن
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                    </AlertDialog>

                    <Button 
                    variant="outline" 
                    className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100"
                    onClick={handleAppLogout} 
                    >
                    <LogOut className="mr-2 h-4 w-4" />
                    خروج از پنل
                    </Button>
                </div>
              </div>
            )}

          </CardContent>
        </Card>

        {/* بخش ترمینال */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium uppercase text-slate-500">ترمینال زنده</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-950 text-slate-50 p-4 rounded-lg font-mono text-xs h-[320px] overflow-y-auto custom-scrollbar" dir="ltr">
                {logs.length === 0 ? (
                  <span className="text-slate-600 opacity-50 flex h-full items-center justify-center">منتظر رویدادها...</span>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="border-b border-slate-800/50 last:border-0 py-2 flex items-start">
                      <span className="text-green-500 mr-2 shrink-0">$</span>
                      <span>{log}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}