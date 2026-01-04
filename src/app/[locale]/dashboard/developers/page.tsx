"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api"; // برای گرفتن پروفایل
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Copy, RefreshCw, Key, BookOpen, Check, Play, Terminal, Wifi } from "lucide-react";

export default function DevelopersPage() {
  const t = useTranslations('Developers');
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'fa';
  
  // State برای کلید API
  const [apiKey, setApiKey] = useState("loading...");
  const [copied, setCopied] = useState(false);
  const [loadingKey, setLoadingKey] = useState(false);

  // State برای تست زنده
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("Hello from API! 🚀");
  const [testLoading, setTestLoading] = useState(false);
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<number | null>(null);

  // دریافت کلید هنگام لود صفحه
  useEffect(() => {
    api.get("/auth/profile").then(res => setApiKey(res.data.apiKey || "No API Key")).catch(console.error);
  }, []);

  // تولید مجدد کلید
  const handleRegenerate = async () => {
    if(!confirm("کلید قبلی غیرفعال خواهد شد و نرم‌افزارهای متصل قطع می‌شوند. ادامه می‌دهید؟")) return;
    setLoadingKey(true);
    try {
        const res = await api.patch("/auth/regenerate-key");
        setApiKey(res.data.apiKey);
    } catch(e) { alert("Error"); } finally { setLoadingKey(false); }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 🚀 تابع اجرای تست واقعی (بدون استفاده از Axios داخلی، برای شبیه‌سازی خارجی)
  const runLiveTest = async () => {
    if (!testPhone || !testMessage) return;
    
    setTestLoading(true);
    setTestResponse(null);
    setTestStatus(null);

    try {
        // درخواست مستقیم به بک‌ند (شبیه‌سازی نرم‌افزار خارجی)
        const response = await fetch("http://localhost:3000/whatsapp/api/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey // ارسال کلید در هدر
            },
            body: JSON.stringify({
                receptor: testPhone,
                message: testMessage
            })
        });

        const data = await response.json();
        setTestStatus(response.status);
        setTestResponse(JSON.stringify(data, null, 2));

    } catch (error: any) {
        setTestStatus(500);
        setTestResponse(`Connection Error: ${error.message}`);
    } finally {
        setTestLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 animate-in fade-in duration-500">
      
      {/* هدر صفحه */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
            <p className="text-muted-foreground mt-2">{t('subtitle')}</p>
        </div>
        <Link href={`/${currentLocale}/docs`}>
            <Button variant="outline" className="gap-2">
                <BookOpen className="h-4 w-4"/> مشاهده مستندات کامل
            </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* ستون چپ: مدیریت کلید */}
        <div className="space-y-6">
            <Card className="border-blue-100 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-900/10 h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg"><Key className="h-5 w-5 text-blue-600"/> {t('apikey_label')}</CardTitle>
                    <CardDescription>از این کلید در هدر <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">x-api-key</code> استفاده کنید.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Input value={apiKey} readOnly className="font-mono text-center tracking-widest bg-white dark:bg-slate-950" />
                        </div>
                        <Button variant="outline" onClick={copyToClipboard} className="w-12 px-0 shrink-0">
                            {copied ? <Check className="h-4 w-4 text-green-600"/> : <Copy className="h-4 w-4"/>}
                        </Button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-2 rounded border border-amber-100 dark:border-amber-900">
                        <Wifi className="h-3 w-3"/>
                        این کلید مستقیماً به حساب واتساپ متصل شما وصل است.
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleRegenerate} disabled={loadingKey} variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 w-full">
                        <RefreshCw className={`h-4 w-4 mr-2 ${loadingKey ? 'animate-spin' : ''}`}/>
                        {t('regenerate')}
                    </Button>
                </CardFooter>
            </Card>
        </div>

        {/* ستون راست: کنسول تست */}
        <div className="space-y-6">
            <Card className="h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg"><Terminal className="h-5 w-5 text-purple-600"/> کنسول تست (Playground)</CardTitle>
                    <CardDescription>تست اتصال API بدون نیاز به کدنویسی</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                    <div className="space-y-2">
                        <Label>شماره گیرنده</Label>
                        <Input 
                            placeholder="0912..." 
                            className="font-mono dir-ltr text-left" 
                            value={testPhone}
                            onChange={(e) => setTestPhone(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>متن پیام</Label>
                        <Textarea 
                            placeholder="Hello World..." 
                            className="h-20"
                            value={testMessage}
                            onChange={(e) => setTestMessage(e.target.value)}
                        />
                    </div>
                    
                    {/* نمایش نتیجه تست */}
                    {testResponse && (
                        <div className={`text-xs font-mono p-3 rounded border ${testStatus === 200 || testStatus === 201 ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'} overflow-auto max-h-32 dir-ltr`}>
                            <div className="flex justify-between mb-1 font-bold">
                                <span>Status: {testStatus}</span>
                                <span>POST /whatsapp/api/send</span>
                            </div>
                            <pre>{testResponse}</pre>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="mt-auto">
                    <Button 
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white" 
                        onClick={runLiveTest} 
                        disabled={testLoading || !testPhone || !testMessage}
                    >
                        {testLoading ? "در حال ارسال..." : <><Play className="h-4 w-4 mr-2 fill-current"/> ارسال درخواست تست</>}
                    </Button>
                </CardFooter>
            </Card>
        </div>

      </div>
    </div>
  );
}