"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Megaphone, Send, Info, Loader2 } from "lucide-react";

export default function BulkPage() {
  const t = useTranslations('Bulk');
  const tCommon = useTranslations('Common');
  const [recipients, setRecipients] = useState("");
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const handleSend = async () => {
    const phones = recipients.split('\n').filter(p => p.trim().length > 5);
    if (phones.length === 0 || !message) {
        setStatus({ type: 'error', msg: tCommon('error') }); // یا پیام اختصاصی
        return;
    }

    setLoading(true);
    setStatus(null);

    try {
        await api.post("/whatsapp/send/bulk", {
            phones: phones.map(p => p.trim()),
            message,
            mediaUrl: imageUrl || undefined
        });
        setStatus({ type: 'success', msg: t('status_processing') }); // در واقع پیام موفقیت "در صف قرار گرفت"
        setRecipients(""); setMessage(""); setImageUrl("");
    } catch (error) { setStatus({ type: 'error', msg: tCommon('error') }); } 
    finally { setLoading(false); }
  };

  const recipientCount = recipients.split('\n').filter(p => p.trim().length > 5).length;

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-orange-100 rounded-full text-orange-600"><Megaphone className="h-6 w-6" /></div>
        <div><h1 className="text-3xl font-bold">{t('title')}</h1><p className="text-slate-500">{t('subtitle')}</p></div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>{t('recipients_title')}</CardTitle><CardDescription>{t('recipients_desc')}</CardDescription></CardHeader>
                <CardContent>
                    <Textarea 
                        placeholder={t('recipients_placeholder')} 
                        className="h-48 font-mono dir-ltr" 
                        value={recipients} 
                        onChange={(e) => setRecipients(e.target.value)}
                    />
                    <div className="mt-2 text-right text-sm text-slate-500">{recipientCount} {t('recipient_count')}</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>{t('content_title')}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>{t('message_label')}</Label>
                        <Textarea placeholder={t('message_placeholder')} className="h-32" value={message} onChange={(e) => setMessage(e.target.value)}/>
                    </div>
                    <div className="space-y-2">
                        <Label>{t('image_label')}</Label>
                        <Input placeholder={t('image_placeholder')} className="dir-ltr" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}/>
                        <p className="text-xs text-slate-400">{t('image_hint')}</p>
                    </div>
                </CardContent>
                <CardFooter className="justify-end border-t bg-slate-50 py-4">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700" onClick={handleSend} disabled={loading || recipientCount === 0 || !message}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4 rotate-180" />}
                        {t('start_btn')}
                    </Button>
                </CardFooter>
            </Card>
            
            {status && <Alert variant={status.type === 'error' ? "destructive" : "default"}><AlertTitle>{status.type === 'success' ? tCommon('success') : tCommon('error')}</AlertTitle><AlertDescription>{status.msg}</AlertDescription></Alert>}
        </div>

        <div className="space-y-6">
            <Card className="bg-yellow-50 border-yellow-200">
                <CardHeader><CardTitle className="text-yellow-800 flex items-center gap-2"><Info className="h-5 w-5" />{t('safety_title')}</CardTitle></CardHeader>
                <CardContent className="text-sm text-yellow-700 leading-relaxed whitespace-pre-wrap">
                    {t('safety_points')}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}