"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useTranslations } from "next-intl"; // 👈 اضافه شده
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Send, Users, Image as ImageIcon, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function BulkPage() {
  const t = useTranslations('Bulk'); // 👈 دسترسی به ترجمه‌های بخش Bulk
  const tCommon = useTranslations('Common'); // 👈 دسترسی به ترجمه‌های عمومی

  const [phones, setPhones] = useState("");
  const [message, setMessage] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; msg: string } | null>(null);

  const phoneList = phones.split("\n").filter((p) => p.trim().length > 0);
  const count = phoneList.length;

  const handleSend = async () => {
    if (count === 0 || !message.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const cleanPhones = phoneList.map(p => p.trim());

      const res = await api.post("/whatsapp/send-bulk", {
        phones: cleanPhones,
        message: message,
        mediaUrl: mediaUrl || undefined,
      });

      setResult({ 
        success: true, 
        // استفاده از ترجمه با پارامتر
        msg: t('successMsg', { id: res.data.queueDetails?.jobId || 'N/A' })
      });
      
    } catch (error: any) {
      console.error(error);
      setResult({ 
        success: false, 
        msg: error.response?.data?.message || tCommon('error')
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground mt-1">{t('description')}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        
        {/* ستون راست: فرم ارسال */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                {t('recipients')}
              </CardTitle>
              <CardDescription>
                {t('recipientsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Textarea 
                  placeholder={t('recipientsPlaceholder')}
                  className="min-h-[200px] font-mono text-base resize-y dir-ltr text-left" // dir-ltr برای نمایش صحیح شماره‌ها
                  value={phones}
                  onChange={(e) => setPhones(e.target.value)}
                />
                <div className="absolute bottom-2 right-2">
                  <Badge variant={count > 0 ? "secondary" : "outline"}>
                    {count} {t('recipientCount')}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-green-600" />
                {t('messageContent')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('messageLabel')}</label>
                <Textarea 
                  placeholder="Hello..." 
                  className="min-h-[120px]"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> 
                  {t('imageLabel')}
                </label>
                <Input 
                  placeholder="https://example.com/image.jpg" 
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  dir="ltr"
                />
                <p className="text-xs text-muted-foreground">{t('imageHelp')}</p>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center py-4 border-t">
               <span className="text-xs text-slate-500">
                 {loading ? t('processing') : t('ready')}
               </span>
               <Button 
                 onClick={handleSend} 
                 disabled={loading || count === 0 || !message} 
                 className="bg-blue-600 hover:bg-blue-700 min-w-[140px]"
               >
                 {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                 {t('startSending')}
               </Button>
            </CardFooter>
          </Card>
        </div>

        {/* ستون چپ: راهنما و وضعیت */}
        <div className="space-y-6">
          
          {/* نمایش نتیجه */}
          {result && (
            <Alert variant={result.success ? "default" : "destructive"} className={result.success ? "border-green-200 bg-green-50 text-green-800" : ""}>
              {result.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              <AlertTitle>{result.success ? tCommon('success') : tCommon('error')}</AlertTitle>
              <AlertDescription>{result.msg}</AlertDescription>
            </Alert>
          )}

          {/* پیش‌نمایش */}
          <Card className="bg-slate-100 dark:bg-slate-950 border-dashed">
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-slate-500 uppercase">{t('preview')}</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="bg-[#DCF8C6] dark:bg-[#056162] text-slate-900 dark:text-white p-3 rounded-lg rounded-tl-none shadow-sm max-w-full text-sm leading-relaxed whitespace-pre-wrap relative">
                    {mediaUrl && (
                      <div className="mb-2 rounded overflow-hidden bg-slate-200 h-32 flex items-center justify-center">
                         <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                      </div>
                    )}
                    {message || <span className="text-slate-400 italic">{t('previewText')}</span>}
                    <div className="text-[10px] text-right mt-1 opacity-60 flex justify-end gap-1">
                       12:30 <span className="text-blue-500">✓✓</span>
                    </div>
                </div>
             </CardContent>
          </Card>

          {/* نکات ایمنی */}
          <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-900/10 dark:border-yellow-900">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-500 text-sm">
                <AlertTriangle className="h-4 w-4" />
                {t('tipsTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-yellow-800 dark:text-yellow-200 space-y-2 leading-relaxed">
              <p>• {t('tips1')}</p>
              <p>• {t('tips2')}</p>
              <p>• {t('tips3')}</p>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}