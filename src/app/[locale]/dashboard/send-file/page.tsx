"use client";

import { useState } from "react";
import { api } from "@/lib/api"; // استفاده از کتابخانه api مرکزی
import { useTranslations } from "next-intl"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Send, Phone, Link as LinkIcon, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function SendFileUrlPage() {
  const t = useTranslations('SendFile'); 
  const tCommon = useTranslations('Common'); 

  const [phone, setPhone] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  // استخراج خودکار نام فایل از لینک
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFileUrl(url);
    
    // تلاش برای حدس زدن نام فایل از انتهای URL
    if (url && !fileName) {
        try {
            const potentialName = url.substring(url.lastIndexOf('/') + 1).split('?')[0];
            if (potentialName && potentialName.length < 30) {
                setFileName(potentialName);
            }
        } catch (err) {
            // نادیده گرفتن خطا
        }
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone || !fileUrl || !fileName) {
      setStatus({ type: 'error', msg: t('errorInput') });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const cleanPhone = phone.replace(/\D/g, "");

      const payload = {
        phone: cleanPhone,
        fileUrl: fileUrl,
        fileName: fileName,
        caption: caption || ""
      };

      // ارسال درخواست
      await api.post("/whatsapp/send-file", payload);

      setStatus({ type: 'success', msg: t('success') });
      
      // پاکسازی فرم
      setFileUrl("");
      setFileName("");
      setCaption("");

    } catch (error: any) {
      // ✅ استفاده از warn برای جلوگیری از قرمز شدن کنسول
      console.warn("File Send Failed:", error.message);

      let errorMsg = error.response?.data?.message || tCommon('error');

      // 🛑 مدیریت اختصاصی خطای عدم دسترسی (۴۰۳)
      if (error.response && error.response.status === 403) {
        errorMsg = "⛔ شما مجوز ارسال فایل را ندارید.";
      }

      setStatus({ type: 'error', msg: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('title')}
          </h2>
          <p className="text-muted-foreground mt-1">
            {t('description')}
          </p>
        </div>
      </div>

      <Card className="shadow-md border-slate-200 dark:border-slate-800">
        <form onSubmit={handleSend}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-blue-500" />
              {t('detailsTitle')}
            </CardTitle>
            <CardDescription>
              {t('detailsDesc')}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {status && (
              <Alert variant={status.type === 'error' ? "destructive" : "default"} className={status.type === 'success' ? "bg-green-50 text-green-700 border-green-200" : ""}>
                {status.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>
                    {status.type === 'success' ? tCommon('success') : tCommon('error')}
                </AlertTitle>
                <AlertDescription>{status.msg}</AlertDescription>
              </Alert>
            )}

            {/* شماره موبایل */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-500" />
                {t('phoneLabel')}
              </Label>
              <Input
                id="phone"
                placeholder="0912..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="font-mono text-left dir-ltr"
              />
            </div>

            {/* لینک فایل */}
            <div className="space-y-2">
              <Label htmlFor="fileUrl" className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-slate-500" />
                {t('urlLabel')}
              </Label>
              <Input
                id="fileUrl"
                placeholder={t('urlPlaceholder')}
                value={fileUrl}
                onChange={handleUrlChange}
                className="font-mono text-left dir-ltr text-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* نام فایل */}
                <div className="space-y-2">
                  <Label htmlFor="fileName" className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    {t('fileNameLabel')}
                  </Label>
                  <Input
                    id="fileName"
                    placeholder={t('fileNamePlaceholder')}
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="text-left dir-ltr"
                  />
                </div>

                {/* کپشن */}
                <div className="space-y-2">
                  <Label htmlFor="caption" className="text-muted-foreground">{t('captionLabel')}</Label>
                  <Input 
                    id="caption"
                    placeholder={t('captionPlaceholder')}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                  />
                </div>
            </div>

          </CardContent>

          <CardFooter className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end py-4">
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 w-36" 
              disabled={loading || !phone || !fileUrl || !fileName}
            >
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : (
                <>
                  {t('sendBtn')}
                  <Send className="mr-2 h-4 w-4 rotate-180" /> 
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}