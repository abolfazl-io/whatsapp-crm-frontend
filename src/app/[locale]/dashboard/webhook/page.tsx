"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Webhook, Globe, Save, Loader2, CheckCircle2, AlertCircle, Trash2, Activity, Zap, MessageSquare, Image as ImageIcon, CheckCheck } from "lucide-react";

export default function WebhookPage() {
  const t = useTranslations('Webhook');
  const tCommon = useTranslations('Common');
  const [url, setUrl] = useState("");
  const [savedUrl, setSavedUrl] = useState("");
  const [testType, setTestType] = useState<'text' | 'image' | 'status'>('text');
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info', msg: string } | null>(null);

  const getHeaders = () => { const token = localStorage.getItem("token"); return { "Content-Type": "application/json", ...(token ? { "Authorization": `Bearer ${token}` } : {}) }; };

  useEffect(() => {
    fetch("http://localhost:3000/whatsapp/webhook", { headers: getHeaders() }).then(res => res.ok ? res.json() : null).then(data => { if(data?.url) { setUrl(data.url); setSavedUrl(data.url); } }).catch(console.error).finally(() => setInitialLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); if (!url) return; setLoading(true); setStatus(null);
    try {
      const res = await fetch("http://localhost:3000/whatsapp/webhook", { method: "POST", headers: getHeaders(), body: JSON.stringify({ url }) });
      if (!res.ok) throw new Error("Error"); setSavedUrl(url); setStatus({ type: 'success', msg: t('success_save') });
    } catch (error) { setStatus({ type: 'error', msg: tCommon('error') }); } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!confirm(tCommon('confirm'))) return; setLoading(true); setStatus(null);
    try {
      const res = await fetch("http://localhost:3000/whatsapp/webhook", { method: "DELETE", headers: getHeaders() });
      if (!res.ok) throw new Error("Error"); setUrl(""); setSavedUrl(""); setStatus({ type: 'info', msg: 'Webhook deleted' });
    } catch (error) { setStatus({ type: 'error', msg: tCommon('error') }); } finally { setLoading(false); }
  };

  const handleTest = async () => {
    if (!url) { setStatus({ type: 'error', msg: t('error_test') }); return; }
    setTestLoading(true); setStatus(null);
    try {
      const res = await fetch("http://localhost:3000/whatsapp/webhook/test", { method: "POST", headers: getHeaders(), body: JSON.stringify({ url, type: testType }) });
      if (!res.ok) throw new Error("Error"); setStatus({ type: 'success', msg: t('success_test') });
    } catch (error) { setStatus({ type: 'error', msg: t('error_test') }); } finally { setTestLoading(false); }
  };

  if (initialLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8 text-slate-400" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500 py-6">
      <div className="flex items-center justify-between"><div><h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t('title')}</h2><p className="text-muted-foreground mt-1">{t('subtitle')}</p></div>{savedUrl ? (<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1 text-sm flex gap-1 items-center"><Activity className="h-3 w-3 animate-pulse" /> {t('active')}</Badge>) : (<Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200 px-3 py-1 text-sm flex gap-1 items-center"><Zap className="h-3 w-3" /> {t('inactive')}</Badge>)}</div>
      <Card className="shadow-md border-slate-200 dark:border-slate-800"><form onSubmit={handleSave}><CardHeader><CardTitle className="flex items-center gap-2"><Webhook className="h-5 w-5 text-orange-600" />{t('config_title')}</CardTitle><CardDescription>{t('config_desc')}</CardDescription></CardHeader><CardContent className="space-y-6">{status && (<Alert variant={status.type === 'error' ? "destructive" : "default"} className={status.type === 'success' ? "bg-green-50 text-green-700 border-green-200" : ""}><AlertTitle>{status.type === 'success' ? tCommon('success') : tCommon('error')}</AlertTitle><AlertDescription>{status.msg}</AlertDescription></Alert>)}<div className="space-y-2"><Label htmlFor="url" className="flex items-center gap-2"><Globe className="h-4 w-4 text-slate-500" />{t('url_label')}</Label><Input id="url" placeholder={t('url_placeholder')} value={url} onChange={(e) => setUrl(e.target.value)} className="font-mono text-left dir-ltr text-blue-600"/><p className="text-xs text-muted-foreground">{t('url_hint')}</p></div><div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800 p-4"><div className="mb-3 text-sm text-slate-700 dark:text-slate-300 font-medium">{t('test_tools')}</div><div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center"><div className="flex w-full sm:w-auto gap-2"><div className="relative"><select value={testType} onChange={(e) => setTestType(e.target.value as any)} className="h-10 w-full sm:w-40 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500 dark:bg-slate-950 dark:border-slate-800 appearance-none cursor-pointer"><option value="text">{t('text_test')}</option><option value="image">{t('image_test')}</option><option value="status">{t('status_test')}</option></select></div><Button type="button" variant="secondary" onClick={handleTest} disabled={testLoading || !url} className="flex-1 sm:flex-none border-slate-200 hover:bg-white">{testLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('send_test')}</Button></div>{savedUrl && (<Button type="button" variant="ghost" onClick={handleDelete} disabled={loading} className="text-red-600 hover:text-red-700 hover:bg-red-50">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}{t('delete_btn')}</Button>)}</div></div></CardContent><CardFooter className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end py-4"><Button type="submit" className="bg-orange-600 hover:bg-orange-700 w-32" disabled={loading || !url || (url === savedUrl && !status)}>{loading ? <Loader2 className="animate-spin h-4 w-4" /> : <><span className="mr-2">{t('save_btn')}</span><Save className="h-4 w-4" /></>}</Button></CardFooter></form></Card>
    </div>
  );
}