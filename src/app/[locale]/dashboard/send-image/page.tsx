"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Send, Phone, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle, UploadCloud } from "lucide-react";

export default function SendImagePage() {
  const [phone, setPhone] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState(""); // اگر بک‌ند کپشن را پشتیبانی می‌کند
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  // هندل کردن انتخاب فایل
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // بررسی نوع فایل (فقط عکس)
      if (!selectedFile.type.startsWith("image/")) {
        setStatus({ type: 'error', msg: 'لطفاً فقط فایل عکس انتخاب کنید.' });
        return;
      }
      // بررسی حجم فایل (مثلاً زیر ۵ مگابایت)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setStatus({ type: 'error', msg: 'حجم عکس نباید بیشتر از ۵ مگابایت باشد.' });
        return;
      }

      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile)); // نمایش پیش‌نمایش
      setStatus(null);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone || !file) {
      setStatus({ type: 'error', msg: 'لطفاً شماره و عکس را انتخاب کنید.' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const cleanPhone = phone.replace(/\D/g, "");
      
      const formData = new FormData();
      formData.append("phone", cleanPhone);
      formData.append("file", file);
      if (caption) formData.append("caption", caption);

      // ۱. دریافت توکن از حافظه مرورگر
      const token = localStorage.getItem("token"); // یا هر نامی که توکن را با آن ذخیره کردید

      // ۲. ارسال درخواست با هدر Authorization
      const response = await fetch("http://localhost:3000/whatsapp/upload-image", {
        method: "POST",
        headers: {
          // ⚠️ نکته حیاتی: Content-Type را ننویسید، اما Authorization را باید بنویسید
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: formData,
      });

      // ۳. بررسی دقیق خطا
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // اگر جیسون نبود، خالی برگردان
        console.error("Server Error Details:", errorData); // لاگ کردن متن دقیق خطا در کنسول
        throw new Error(errorData.message || `خطای سرور: ${response.status}`);
      }

      setStatus({ type: 'success', msg: 'عکس با موفقیت ارسال شد!' });
      
      setFile(null);
      setPreview(null);
      setCaption("");

    } catch (error: any) {
      console.error("Upload Error:", error);
      setStatus({ type: 'error', msg: error.message || "خطا در برقراری ارتباط با سرور." });
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">ارسال تصویر</h2>
          <p className="text-muted-foreground mt-1">ارسال عکس به مخاطبین واتساپ.</p>
        </div>
      </div>

      <Card className="shadow-md border-slate-200 dark:border-slate-800">
        <form onSubmit={handleSend}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-purple-600" />
              آپلود و ارسال
            </CardTitle>
            <CardDescription>
              فایل عکس را انتخاب کنید. فرمت‌های مجاز: JPG, PNG, WEBP
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {status && (
              <Alert variant={status.type === 'error' ? "destructive" : "default"} className={status.type === 'success' ? "bg-green-50 text-green-700 border-green-200" : ""}>
                {status.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{status.type === 'success' ? "موفق" : "خطا"}</AlertTitle>
                <AlertDescription>{status.msg}</AlertDescription>
              </Alert>
            )}

            {/* ورودی شماره */}
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

            {/* ورودی فایل (Drag & Drop ساده) */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <UploadCloud className="h-4 w-4 text-slate-500" />
                انتخاب عکس
              </Label>
              
              {!preview ? (
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
                    <span className="text-sm font-medium">برای انتخاب عکس کلیک کنید</span>
                    <span className="text-xs">یا عکس را اینجا رها کنید</span>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 group">
                  <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="sm"
                      onClick={() => { setFile(null); setPreview(null); }}
                    >
                      حذف عکس
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* ورودی کپشن (اختیاری) */}
            <div className="space-y-2">
               <Label htmlFor="caption" className="text-xs text-muted-foreground">کپشن (توضیحات عکس) - اختیاری</Label>
               <Input 
                 id="caption"
                 placeholder="توضیحی برای عکس بنویسید..."
                 value={caption}
                 onChange={(e) => setCaption(e.target.value)}
               />
            </div>

          </CardContent>

          <CardFooter className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end py-4">
            <Button 
              type="submit" 
              className="bg-purple-600 hover:bg-purple-700 w-32" 
              disabled={loading || !phone || !file}
            >
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : (
                <>
                  ارسال عکس
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