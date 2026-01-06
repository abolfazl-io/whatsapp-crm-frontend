"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api"; // 👈 استفاده از api مرکزی
import { useTranslations } from "next-intl"; // 👈 هوک ترجمه
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Webhook, Globe, Save, Loader2, CheckCircle2, AlertCircle, 
  Trash2, Activity, Zap, MessageSquare, Image as ImageIcon, CheckCheck
} from "lucide-react";

export default function WebhookPage() {
  const t = useTranslations('Webhook'); // 👈 دسترسی به کلیدهای Webhook
  const tCommon = useTranslations('Common');

  const [url, setUrl] = useState("");
  const [savedUrl, setSavedUrl] = useState("");
  const [testType, setTestType] = useState<'text' | 'image' | 'status'>('text');
  
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info', msg: string } | null>(null);

  useEffect(() => {
    fetchWebhook();
  }, []);

  // دریافت اطلاعات (با api مرکزی)
  const fetchWebhook = async () => {
    try {
      const res = await api.get("/whatsapp/webhook");
      if (res.data.url) {
        setUrl(res.data.url);
        setSavedUrl(res.data.url);
      }
    } catch (error) {
      console.error("Error fetching webhook", error);
    } finally {
      setInitialLoading(false);
    }
  };

  // ذخیره (با api مرکزی)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setStatus(null);

    try {
      await api.post("/whatsapp/webhook", { url });
      setSavedUrl(url);
      setStatus({ type: 'success', msg: t('savedMsg') });
    } catch (error: any) {
      setStatus({ type: 'error', msg: tCommon('error') });
    } finally {
      setLoading(false);
    }
  };

  // حذف (با api مرکزی)
  const handleDelete = async () => {
    if (!confirm(t('deleteConfirm'))) return;
    
    setLoading(true);
    setStatus(null);
    try {
      await api.delete("/whatsapp/webhook");
      setUrl("");
      setSavedUrl("");
      setStatus({ type: 'info', msg: t('deletedMsg') });
    } catch (error) {
      setStatus({ type: 'error', msg: tCommon('error') });
    } finally {
      setLoading(false);
    }
  };

  // تست (با api مرکزی)
  const handleTest = async () => {
    if (!url) {
        setStatus({ type: 'error', msg: t('errorInput') });
        return;
    }

    setTestLoading(true);
    setStatus(null);
    
    try {
      await api.post("/whatsapp/webhook/test", { 
        url: url, 
        type: testType 
      });

      setStatus({ type: 'success', msg: t('testSuccess', { type: testType }) });
    } catch (error: any) {
      console.error(error);
      const errorText = error.response?.data?.message || tCommon('error');
      setStatus({ type: 'error', msg: t('testError', { error: errorText }) });
    } finally {
      setTestLoading(false);
    }
  };

  if (initialLoading) {
      return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8 text-slate-400" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500 py-6">
      
      {/* هدر صفحه */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t('title')}</h2>
          <p className="text-muted-foreground mt-1">{t('description')}</p>
        </div>
        
        {savedUrl ? (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1 text-sm flex gap-1 items-center">
             <Activity className="h-3 w-3 animate-pulse" /> {t('active')}
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200 px-3 py-1 text-sm flex gap-1 items-center">
             <Zap className="h-3 w-3" /> {t('inactive')}
          </Badge>
        )}
      </div>

      <Card className="shadow-md border-slate-200 dark:border-slate-800">
        <form onSubmit={handleSave}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-orange-600" />
              {t('configTitle')}
            </CardTitle>
            <CardDescription>
              {t('configDesc')}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            
            {/* نمایش پیغام‌های وضعیت */}
            {status && (
              <Alert variant={status.type === 'error' ? "destructive" : "default"} 
                     className={`transition-all duration-300 ${
                         status.type === 'success' ? "bg-green-50 text-green-700 border-green-200" : 
                         status.type === 'info' ? "bg-blue-50 text-blue-700 border-blue-200" : ""
                     }`}>
                {status.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : 
                 status.type === 'info' ? <Zap className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>
                    {status.type === 'success' ? t('successTitle') : status.type === 'info' ? t('infoTitle') : t('errorTitle')}
                </AlertTitle>
                <AlertDescription>{status.msg}</AlertDescription>
              </Alert>
            )}

            {/* ورودی آدرس وب‌هوک */}
            <div className="space-y-2">
              <Label htmlFor="url" className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-slate-500" />
                {t('urlLabel')}
              </Label>
              <Input
                id="url"
                placeholder="https://example.com/api/whatsapp-webhook"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="font-mono text-left dir-ltr text-blue-600"
              />
              <p className="text-xs text-muted-foreground">
                {t('urlHelp')} <a href="https://webhook.site" target="_blank" className="underline text-blue-500">webhook.site</a>
              </p>
            </div>

            {/* بخش ابزارهای تست و حذف */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800 p-4">
                <div className="mb-3 text-sm text-slate-700 dark:text-slate-300 font-medium">
                    {t('toolsTitle')}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                    
                    {/* انتخابگر سناریو و دکمه تست */}
                    <div className="flex w-full sm:w-auto gap-2">
                        <div className="relative">
                            <select 
                                value={testType}
                                onChange={(e) => setTestType(e.target.value as any)}
                                className="h-10 w-full sm:w-40 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-slate-950 dark:border-slate-800 appearance-none cursor-pointer"
                            >
                                <option value="text">{t('testText')}</option>
                                <option value="image">{t('testImage')}</option>
                                <option value="status">{t('testStatus')}</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-slate-500">
                                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                            </div>
                        </div>

                        <Button 
                          type="button" 
                          variant="secondary" 
                          onClick={handleTest}
                          disabled={testLoading || !url}
                          className="flex-1 sm:flex-none border-slate-200 hover:bg-white"
                        >
                          {testLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                              testType === 'text' ? <MessageSquare className="h-4 w-4 mr-2 text-blue-500"/> :
                              testType === 'image' ? <ImageIcon className="h-4 w-4 mr-2 text-purple-500"/> :
                              <CheckCheck className="h-4 w-4 mr-2 text-green-500"/>
                          )}
                          {t('sendTest')}
                        </Button>
                    </div>

                    {/* دکمه حذف */}
                    {savedUrl && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          onClick={handleDelete}
                          disabled={loading}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                          {t('deleteBtn')}
                        </Button>
                    )}
                </div>
            </div>

          </CardContent>

          <CardFooter className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end py-4">
            <Button 
              type="submit" 
              className="bg-orange-600 hover:bg-orange-700 w-32" 
              disabled={loading || !url || (url === savedUrl && !status)}
            >
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : (
                <>
                  {t('saveBtn')}
                  <Save className="mr-2 h-4 w-4" /> 
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}