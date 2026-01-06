"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useTranslations } from "next-intl"; // 👈 هوک ترجمه
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Send, Phone, MessageSquare, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function SendSingleMessagePage() {
  const t = useTranslations('Send'); // 👈 دسترسی به کلیدهای Send
  const tCommon = useTranslations('Common'); // 👈 دسترسی به کلیدهای عمومی

  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone || !message) {
      setStatus({ type: 'error', msg: t('errorInput') });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      // نرمال‌سازی شماره (حذف فاصله و خط تیره)
      const cleanPhone = phone.replace(/\D/g, "");

      await api.post("/whatsapp/send/text", {
        phone: cleanPhone,
        message: message
      });

      setStatus({ type: 'success', msg: t('successMsg') });
      setMessage(""); 
      
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.message || tCommon('error');
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
            {t('titleText')}
          </h2>
          <p className="text-muted-foreground mt-1">
            {t('descText')}
          </p>
        </div>
      </div>

      <Card className="shadow-md border-slate-200 dark:border-slate-800">
        <form onSubmit={handleSend}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-600" />
              {t('detailsTitle')}
            </CardTitle>
            <CardDescription>
              {t('detailsDesc')}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* نمایش وضعیت (ارور یا موفقیت) */}
            {status && (
              <Alert variant={status.type === 'error' ? "destructive" : "default"} className={status.type === 'success' ? "bg-green-50 text-green-700 border-green-200" : ""}>
                {status.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>
                    {status.type === 'success' ? t('successTitle') : t('errorTitle')}
                </AlertTitle>
                <AlertDescription>{status.msg}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-500" />
                {t('phoneLabel')}
              </Label>
              <Input
                id="phone"
                placeholder={t('phonePlaceholder')}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="font-mono text-left dir-ltr"
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-slate-500" />
                {t('messageLabel')}
              </Label>
              <Textarea
                id="message"
                placeholder={t('messagePlaceholder')}
                className="min-h-[120px] resize-y"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <p className="text-xs text-muted-foreground text-left dir-ltr">
                {message.length} {t('chars')}
              </p>
            </div>
          </CardContent>

          <CardFooter className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end py-4">
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 w-32" 
              disabled={loading || !phone || !message}
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