"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Send, Phone, Link as LinkIcon, Loader2, CheckCircle2, AlertCircle, FileText } from "lucide-react";

export default function SendFilePage() {
  const t = useTranslations('SendFile');
  const tCommon = useTranslations('Common');
  const [phone, setPhone] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone || !fileUrl || !fileName) {
      setStatus({ type: 'error', msg: t('error_fields') });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      await api.post("/whatsapp/send/document", {
        phone,
        fileUrl,
        fileName,
        caption
      });

      setStatus({ type: 'success', msg: t('success_msg') });
      setFileUrl("");
      setFileName("");
      setCaption("");

    } catch (error: any) {
      console.error(error);
      setStatus({ type: 'error', msg: tCommon('error') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t('title')}</h2>
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>
      </div>

      <Card className="shadow-md border-slate-200 dark:border-slate-800">
        <form onSubmit={handleSend}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-blue-600" />
              {t('file_spec_title')}
            </CardTitle>
            <CardDescription>{t('file_spec_desc')}</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {status && (
              <Alert variant={status.type === 'error' ? "destructive" : "default"} className={status.type === 'success' ? "bg-green-50 text-green-700 border-green-200" : ""}>
                {status.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{status.type === 'success' ? tCommon('success') : tCommon('error')}</AlertTitle>
                <AlertDescription>{status.msg}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-500" />
                {useTranslations('Chat')('phone_label')}
              </Label>
              <Input
                id="phone"
                placeholder="0912..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="font-mono text-left dir-ltr"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="url" className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-slate-500" />
                        {t('url_label')}
                    </Label>
                    <Input
                        id="url"
                        placeholder="https://example.com/file.pdf"
                        value={fileUrl}
                        onChange={(e) => setFileUrl(e.target.value)}
                        className="font-mono text-left dir-ltr text-blue-600"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="filename" className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-500" />
                        {t('name_label')}
                    </Label>
                    <Input
                        id="filename"
                        placeholder="catalog.pdf"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        className="font-mono text-left dir-ltr"
                    />
                </div>
            </div>

            <div className="space-y-2">
               <Label htmlFor="caption" className="text-xs text-muted-foreground">{useTranslations('SendImage')('caption_label')}</Label>
               <Input 
                 id="caption"
                 placeholder={useTranslations('SendImage')('caption_placeholder')}
                 value={caption}
                 onChange={(e) => setCaption(e.target.value)}
               />
            </div>

          </CardContent>

          <CardFooter className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end py-4">
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 w-32" 
              disabled={loading || !phone || !fileUrl || !fileName}
            >
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : (
                <>
                  <span className="mr-2">{t('send_btn')}</span>
                  <Send className="h-4 w-4 rotate-180" /> 
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}