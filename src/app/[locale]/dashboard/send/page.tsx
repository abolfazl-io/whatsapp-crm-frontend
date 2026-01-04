"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Send, Phone, MessageSquare, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function SendPage() {
  const t = useTranslations('SendText');
  const tCommon = useTranslations('Common');
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !message) {
        setStatus({ type: 'error', msg: t('error_required') });
        return;
    }
    
    setLoading(true);
    setStatus(null);

    try {
      // ارسال درخواست به API
      await api.post("/whatsapp/send/text", {
        phone: phone.replace(/\D/g, ''), // حذف کاراکترهای غیر عددی
        message
      });
      setStatus({ type: 'success', msg: t('success') });
      setMessage("");
      // phone را پاک نمی‌کنیم شاید کاربر بخواهد دوباره به همان شماره پیام دهد
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
                <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-blue-600"/>{t('card_title')}</CardTitle>
                <CardDescription>{t('card_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {status && (
                    <Alert variant={status.type === 'error' ? "destructive" : "default"} className={status.type === 'success' ? "bg-green-50 text-green-700 border-green-200" : ""}>
                        {status.type === 'success' ? <CheckCircle2 className="h-4 w-4"/> : <AlertCircle className="h-4 w-4"/>}
                        <AlertTitle>{status.type === 'success' ? tCommon('success') : tCommon('error')}</AlertTitle>
                        <AlertDescription>{status.msg}</AlertDescription>
                    </Alert>
                )}
                
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-500"/>{t('phone_label')}</Label>
                    <Input placeholder="0912..." className="dir-ltr text-left font-mono" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>

                <div className="space-y-2">
                    <Label>{t('message_label')}</Label>
                    <Textarea placeholder={t('message_placeholder')} className="h-32" value={message} onChange={(e) => setMessage(e.target.value)} />
                </div>
            </CardContent>
            <CardFooter className="justify-end border-t bg-slate-50 dark:bg-slate-900/50 py-4">
                <Button type="submit" disabled={loading || !phone || !message} className="bg-blue-600 hover:bg-blue-700 w-32">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4 mr-2 rotate-180"/>}
                    {t('send_btn')}
                </Button>
            </CardFooter>
        </form>
      </Card>
    </div>
  );
}