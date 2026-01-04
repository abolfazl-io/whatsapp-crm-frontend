"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Send, Phone, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle, UploadCloud } from "lucide-react";

export default function SendImagePage() {
  const t = useTranslations('SendImage');
  const tCommon = useTranslations('Common');
  const [phone, setPhone] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) { setStatus({ type: 'error', msg: t('error_type') }); return; }
      if (selectedFile.size > 5 * 1024 * 1024) { setStatus({ type: 'error', msg: t('error_size') }); return; }
      setFile(selectedFile); setPreview(URL.createObjectURL(selectedFile)); setStatus(null);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !file) { setStatus({ type: 'error', msg: t('error_inputs') }); return; }
    setLoading(true); setStatus(null);
    try {
      const cleanPhone = phone.replace(/\D/g, "");
      const formData = new FormData();
      formData.append("phone", cleanPhone); formData.append("file", file);
      if (caption) formData.append("caption", caption);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/whatsapp/upload-image", {
        method: "POST", headers: { ...(token ? { "Authorization": `Bearer ${token}` } : {}) }, body: formData,
      });
      if (!response.ok) throw new Error("Error");
      setStatus({ type: 'success', msg: t('success_msg') }); setFile(null); setPreview(null); setCaption("");
    } catch (error: any) { setStatus({ type: 'error', msg: tCommon('error') }); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500 py-6">
      <div className="flex items-center justify-between"><div><h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t('title')}</h2><p className="text-muted-foreground mt-1">{t('subtitle')}</p></div></div>
      <Card className="shadow-md border-slate-200 dark:border-slate-800">
        <form onSubmit={handleSend}>
          <CardHeader><CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5 text-purple-600" />{t('upload_title')}</CardTitle><CardDescription>{t('upload_desc')}</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            {status && (<Alert variant={status.type === 'error' ? "destructive" : "default"} className={status.type === 'success' ? "bg-green-50 text-green-700 border-green-200" : ""}><AlertTitle>{status.type === 'success' ? tCommon('success') : tCommon('error')}</AlertTitle><AlertDescription>{status.msg}</AlertDescription></Alert>)}
            <div className="space-y-2"><Label htmlFor="phone" className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-500" />{t('phone_label')}</Label><Input id="phone" placeholder="0912..." value={phone} onChange={(e) => setPhone(e.target.value)} className="font-mono text-left dir-ltr"/></div>
            <div className="space-y-2"><Label className="flex items-center gap-2"><UploadCloud className="h-4 w-4 text-slate-500" />{t('select_image')}</Label>{!preview ? (<div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer relative"><input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/><div className="flex flex-col items-center gap-2 text-slate-400"><ImageIcon className="h-10 w-10 mb-2 opacity-50" /><span className="text-sm font-medium">{t('click_to_select')}</span><span className="text-xs">{t('drop_here')}</span></div></div>) : (<div className="relative rounded-xl overflow-hidden border border-slate-200 group"><img src={preview} alt="Preview" className="w-full h-64 object-cover" /><div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Button type="button" variant="destructive" size="sm" onClick={() => { setFile(null); setPreview(null); }}>{t('remove')}</Button></div></div>)}</div>
            <div className="space-y-2"><Label htmlFor="caption" className="text-xs text-muted-foreground">{t('caption_label')}</Label><Input id="caption" placeholder={t('caption_placeholder')} value={caption} onChange={(e) => setCaption(e.target.value)}/></div>
          </CardContent>
          <CardFooter className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end py-4"><Button type="submit" className="bg-purple-600 hover:bg-purple-700 w-32" disabled={loading || !phone || !file}>{loading ? <Loader2 className="animate-spin h-4 w-4" /> : <><span className="mr-2">{t('send_btn')}</span><Send className="h-4 w-4 rotate-180" /></>}</Button></CardFooter>
        </form>
      </Card>
    </div>
  );
}