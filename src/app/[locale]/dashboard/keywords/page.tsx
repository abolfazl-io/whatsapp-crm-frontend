"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch"; // 👈 نیاز به کامپوننت سوییچ دارید
import { Label } from "@/components/ui/label";
import { Bot, Plus, Trash2, Loader2, MessageSquare, Zap, SearchX, Sparkles, BrainCircuit } from "lucide-react";

interface Keyword {
  id: string;
  trigger: string;
  response: string;
}

export default function KeywordsPage() {
  const t = useTranslations('Keywords');

  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [newTrigger, setNewTrigger] = useState("");
  const [newResponse, setNewResponse] = useState("");
  
  // 👇 Stateهای جدید برای AI
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // دریافت همزمان کلمات و وضعیت AI
      const [keywordsRes, aiRes] = await Promise.all([
        api.get("/whatsapp/keywords"),
        api.get("/whatsapp/ai/status")
      ]);

      setKeywords(Array.isArray(keywordsRes.data) ? keywordsRes.data : []);
      setAiEnabled(aiRes.data.aiEnabled);

    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setFetching(false);
    }
  };

  // 👇 تابع تغییر وضعیت هوش مصنوعی
  const toggleAi = async (checked: boolean) => {
    setAiLoading(true);
    try {
        await api.post("/whatsapp/ai/toggle", { enabled: checked });
        setAiEnabled(checked);
    } catch (error) {
        console.error("Error toggling AI", error);
    } finally {
        setAiLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrigger || !newResponse) {
        setStatus({ type: 'error', msg: t('alertErrorInput') });
        return;
    }
    
    setLoading(true);
    setStatus(null);

    try {
      await api.post("/whatsapp/keywords", { 
          trigger: newTrigger, 
          response: newResponse 
      });

      setStatus({ type: 'success', msg: t('alertSuccess') });
      setNewTrigger("");
      setNewResponse("");
      // رفرش فقط لیست کلمات
      const res = await api.get("/whatsapp/keywords");
      setKeywords(res.data);

    } catch (error) {
      setStatus({ type: 'error', msg: t('alertErrorServer') });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm(t('deleteConfirm'))) return;

    try {
      await api.delete(`/whatsapp/keywords/${id}`);
      setKeywords(prev => prev.filter(k => k.id !== id));
    } catch (error) {
      console.error("Delete error", error);
    }
  };

  if (fetching) {
      return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8 text-slate-400" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 py-6">
      
      {/* هدر صفحه */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BrainCircuit className="h-8 w-8 text-orange-600" />
            {t('title')}
          </h2>
          <p className="text-muted-foreground mt-1">
            {t('description')}
          </p>
        </div>
        
        {/* 👇 بخش جدید: کارت کنترل هوش مصنوعی */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-4 shadow-sm">
            <div className={`p-2 rounded-full ${aiEnabled ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                <Sparkles className="h-5 w-5" />
            </div>
            <div>
                <Label htmlFor="ai-mode" className="font-medium block cursor-pointer">{t('aiMode')}</Label>
                <span className="text-xs text-muted-foreground">{aiEnabled ? t('aiActive') : t('aiInactive')}</span>
            </div>
            <Switch 
                id="ai-mode"
                checked={aiEnabled}
                onCheckedChange={toggleAi}
                disabled={aiLoading}
            />
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[350px_1fr]">
        
        {/* فرم افزودن */}
        <Card className="h-fit shadow-md border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-5 w-5 text-orange-600" />
                {t('addRule')}
            </CardTitle>
            <CardDescription>
              {t('newRuleDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
                
                {status && (
                    <Alert variant={status.type === 'error' ? "destructive" : "default"} className={status.type === 'success' ? "bg-green-50 text-green-700 border-green-200 text-xs p-3" : "text-xs p-3"}>
                        <AlertTitle>{status.type === 'success' ? t('registered') : t('errorTitle')}</AlertTitle>
                        <AlertDescription>{status.msg}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium">{t('trigger')}</label>
                    <div className="relative">
                        <Zap className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder={t('triggerPlaceholder')}
                            className="pr-9"
                            value={newTrigger}
                            onChange={(e) => setNewTrigger(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">{t('response')}</label>
                    <textarea 
                        placeholder={t('responsePlaceholder')}
                        className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                        value={newResponse}
                        onChange={(e) => setNewResponse(e.target.value)}
                    />
                </div>

                <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('addButton')}
                </Button>
            </form>
          </CardContent>
        </Card>

        {/* لیست کلمات */}
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    {t('list')}
                </CardTitle>
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                    {t('activeRules', { count: keywords.length })}
                </div>
            </CardHeader>
            <CardContent>
                {keywords.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                        <SearchX className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p>{t('noKeywords')}</p>
                    </div>
                ) : (
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-right">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[150px]">{t('trigger')}</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">{t('response')}</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[50px]"></th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {keywords.map((k) => (
                                    <tr key={k.id} className="border-b transition-colors hover:bg-slate-50/50">
                                        <td className="p-4 align-middle font-medium">
                                            <span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
                                                {k.trigger}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle max-w-[300px] truncate text-slate-600" title={k.response}>
                                            {k.response}
                                        </td>
                                        <td className="p-4 align-middle">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleDelete(k.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>

      </div>
    </div>
  );
}