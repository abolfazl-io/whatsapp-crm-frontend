"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Send, Phone, Link as LinkIcon, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function SendFileUrlPage() {
  const [phone, setPhone] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  // استخراج خودکار نام فایل از لینک (برای راحتی کاربر)
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
      setStatus({ type: 'error', msg: 'تمامی فیلدها (شماره، لینک و نام فایل) الزامی هستند.' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const cleanPhone = phone.replace(/\D/g, "");
      const token = localStorage.getItem("token"); // دریافت توکن

      // داده‌هایی که دقیقاً بک‌ند انتظار دارد
      const payload = {
        phone: cleanPhone,
        fileUrl: fileUrl,
        fileName: fileName,
        caption: caption || ""
      };

      console.log("📤 Sending Payload:", payload); // برای دیباگ در کنسول مرورگر

      // استفاده از fetch برای ارسال استاندارد JSON
      const response = await fetch("http://localhost:3000/whatsapp/send-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // 👈 این خط برای ارسال جیسون حیاتی است
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `خطای سرور: ${response.status}`);
      }

      setStatus({ type: 'success', msg: 'فایل با موفقیت ارسال شد!' });
      
      // پاکسازی فرم
      setFileUrl("");
      setFileName("");
      setCaption("");

    } catch (error: any) {
      console.error("File Send Error:", error);
      setStatus({ type: 'error', msg: error.message || "خطا در ارتباط با سرور." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">ارسال فایل (لینک)</h2>
          <p className="text-muted-foreground mt-1">ارسال فایل‌های PDF، صوتی یا ویدیویی از طریق لینک مستقیم.</p>
        </div>
      </div>

      <Card className="shadow-md border-slate-200 dark:border-slate-800">
        <form onSubmit={handleSend}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-blue-500" />
              مشخصات فایل
            </CardTitle>
            <CardDescription>
              لینک مستقیم فایل را وارد کنید. فایل توسط سرور دانلود و برای کاربر ارسال می‌شود.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {status && (
              <Alert variant={status.type === 'error' ? "destructive" : "default"} className={status.type === 'success' ? "bg-green-50 text-green-700 border-green-200" : ""}>
                {status.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{status.type === 'success' ? "موفق" : "خطا"}</AlertTitle>
                <AlertDescription>{status.msg}</AlertDescription>
              </Alert>
            )}

            {/* شماره موبایل */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-500" />
                شماره موبایل
              </Label>
              <Input
                id="phone"
                placeholder="مثال: 09123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="font-mono text-left dir-ltr"
              />
            </div>

            {/* لینک فایل */}
            <div className="space-y-2">
              <Label htmlFor="fileUrl" className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-slate-500" />
                لینک دانلود فایل (URL)
              </Label>
              <Input
                id="fileUrl"
                placeholder="https://example.com/invoice.pdf"
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
                    نام فایل (با پسوند)
                  </Label>
                  <Input
                    id="fileName"
                    placeholder="مثال: file.pdf"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="text-left dir-ltr"
                  />
                </div>

                {/* کپشن */}
                <div className="space-y-2">
                  <Label htmlFor="caption" className="text-muted-foreground">کپشن (اختیاری)</Label>
                  <Input 
                    id="caption"
                    placeholder="توضیحات..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                  />
                </div>
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
                  ارسال فایل
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