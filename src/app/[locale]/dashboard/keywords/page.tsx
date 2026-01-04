"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bot, Plus, Trash2, Loader2, MessageSquare, Zap, SearchX } from "lucide-react";

interface Keyword { id: string; trigger: string; response: string; }

export default function KeywordsPage() {
  const t = useTranslations('Keywords');
  const tCommon = useTranslations('Common');
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [newTrigger, setNewTrigger] = useState("");
  const [newResponse, setNewResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return { "Content-Type": "application/json", ...(token ? { "Authorization": `Bearer ${token}` } : {}) };
  };

  useEffect(() => { fetchKeywords(); }, []);

  const fetchKeywords = async () => {
    try {
      const res = await fetch("http://localhost:3000/whatsapp/keywords", { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setKeywords(Array.isArray(data) ? data : []);
      }
    } catch (error) { console.error("Error", error); } finally { setFetching(false); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrigger || !newResponse) { setStatus({ type: 'error', msg: t('error_input') }); return; }
    setLoading(true); setStatus(null);
    try {
      const res = await fetch("http://localhost:3000/whatsapp/keywords", {
        method: "POST", headers: getHeaders(), body: JSON.stringify({ trigger: newTrigger, response: newResponse })
      });
      if (!res.ok) throw new Error("Error");
      setStatus({ type: 'success', msg: t('success_add') });
      setNewTrigger(""); setNewResponse(""); fetchKeywords();
    } catch (error) { setStatus({ type: 'error', msg: t('error_add') }); } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if(!confirm(t('delete_confirm'))) return;
    try {
      await fetch(`http://localhost:3000/whatsapp/keywords/${id}`, { method: "DELETE", headers: getHeaders() });
      setKeywords(prev => prev.filter(k => k.id !== id));
    } catch (error) { console.error(error); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 py-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t('title')}</h2><p className="text-muted-foreground mt-1">{t('subtitle')}</p></div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"><Bot className="h-4 w-4" />{keywords.length} {t('active_rules')}</div>
      </div>
      <div className="grid gap-8 md:grid-cols-[350px_1fr]">
        <Card className="h-fit shadow-md border-slate-200 dark:border-slate-800">
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Plus className="h-5 w-5 text-orange-600" />{t('new_rule')}</CardTitle><CardDescription>{t('description')}</CardDescription></CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
                {status && (<Alert variant={status.type === 'error' ? "destructive" : "default"} className={status.type === 'success' ? "bg-green-50 text-green-700 border-green-200 text-xs p-3" : "text-xs p-3"}><AlertTitle>{status.type === 'success' ? tCommon('success') : tCommon('error')}</AlertTitle><AlertDescription>{status.msg}</AlertDescription></Alert>)}
                <div className="space-y-2"><label className="text-sm font-medium">{t('trigger_label')}</label><div className="relative"><Zap className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" /><Input placeholder={t('trigger_placeholder')} className="pr-9" value={newTrigger} onChange={(e) => setNewTrigger(e.target.value)}/></div></div>
                <div className="space-y-2"><label className="text-sm font-medium">{t('response_label')}</label><textarea placeholder={t('response_placeholder')} className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:border-slate-800 dark:bg-slate-950" value={newResponse} onChange={(e) => setNewResponse(e.target.value)}/></div>
                <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('add_btn')}</Button>
            </form>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><MessageSquare className="h-5 w-5 text-blue-600" />{t('list_title')}</CardTitle></CardHeader>
            <CardContent>
                {fetching ? (<div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /></div>) : keywords.length === 0 ? (<div className="text-center py-10 text-slate-500"><SearchX className="h-10 w-10 mx-auto mb-2 opacity-50" /><p>{t('no_keywords')}</p></div>) : (
                    <div className="relative w-full overflow-auto"><table className="w-full caption-bottom text-sm text-right"><thead className="[&_tr]:border-b"><tr className="border-b transition-colors hover:bg-muted/50"><th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[150px]">{t('table_trigger')}</th><th className="h-12 px-4 align-middle font-medium text-muted-foreground">{t('table_response')}</th><th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[50px]"></th></tr></thead><tbody className="[&_tr:last-child]:border-0">{keywords.map((k) => (<tr key={k.id} className="border-b transition-colors hover:bg-slate-50/50"><td className="p-4 align-middle font-medium"><span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-700">{k.trigger}</span></td><td className="p-4 align-middle max-w-[300px] truncate text-slate-600" title={k.response}>{k.response}</td><td className="p-4 align-middle"><Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(k.id)}><Trash2 className="h-4 w-4" /></Button></td></tr>))}</tbody></table></div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}