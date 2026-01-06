"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useTranslations } from "next-intl"; // 👈 هوک ترجمه
import { 
  Card, CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Loader2, Plus, Trash2, Zap, Copy } from "lucide-react";

interface CannedResponse {
  id: number;
  shortcut: string;
  content: string;
}

export default function CannedResponsesPage() {
  const t = useTranslations('CrmCanned'); // 👈 کلید ترجمه
  const tCommon = useTranslations('Common');

  const [responses, setResponses] = useState<CannedResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newResponse, setNewResponse] = useState({ shortcut: "", content: "" });
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchResponses = async () => {
    try {
      const res = await api.get("/crm/canned-responses");
      setResponses(res.data);
    } catch (error) {
      console.error("Error fetching canned responses", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, []);

  const handleCreate = async () => {
    if (!newResponse.shortcut || !newResponse.content) return;
    
    setSubmitLoading(true);
    try {
      const res = await api.post("/crm/canned-responses", newResponse);
      setResponses([res.data, ...responses]); 
      setIsDialogOpen(false); 
      setNewResponse({ shortcut: "", content: "" }); 
      alert(t('successCreate'));
    } catch (error) {
      alert(t('errorCreate'));
    } finally {
      setSubmitLoading(false);
    }
  };

    const handleDelete = async (id: number) => {
        const confirmDelete = window.confirm(t('confirmDelete'));
        if (!confirmDelete) return;
        
        try {
            await api.delete(`/crm/canned-responses/${id}`);
            setResponses(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error(error);
            alert(t('errorDelete'));
        }
    };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(t('copySuccess'));
  };
  

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-6 animate-in fade-in duration-500">
      
      {/* هدر صفحه */}
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="h-8 w-8 text-yellow-500" />
                {t('title')}
            </h1>
            <p className="text-slate-500 mt-1">{t('description')}</p>
        </div>

        {/* دکمه افزودن */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('addBtn')}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('dialog.title')}</DialogTitle>
                    <DialogDescription>
                        {t('dialog.desc')}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>{t('dialog.shortcutLabel')}</Label>
                        <Input 
                            placeholder="/hi" 
                            className="text-left dir-ltr"
                            value={newResponse.shortcut}
                            onChange={(e) => setNewResponse({...newResponse, shortcut: e.target.value})}
                        />
                        <p className="text-xs text-slate-400">{t('dialog.shortcutHelp')}</p>
                    </div>
                    <div className="space-y-2">
                        <Label>{t('dialog.contentLabel')}</Label>
                        <Textarea 
                            placeholder={t('dialog.contentPlaceholder')}
                            className="h-32 resize-none"
                            value={newResponse.content}
                            onChange={(e) => setNewResponse({...newResponse, content: e.target.value})}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t('dialog.cancel')}</Button>
                    <Button onClick={handleCreate} disabled={submitLoading || !newResponse.shortcut || !newResponse.content}>
                        {submitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('dialog.save')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>

      {/* لیست پاسخ‌ها */}
      <Card>
        <CardContent className="p-0">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50">
                        <TableHead className="w-[150px]">{t('table.shortcut')}</TableHead>
                        <TableHead>{t('table.content')}</TableHead>
                        <TableHead className="w-[100px] text-left">{t('table.actions')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center text-slate-500">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                {tCommon('loading')}
                            </TableCell>
                        </TableRow>
                    ) : responses.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center text-slate-500">
                                {t('noData')}
                            </TableCell>
                        </TableRow>
                    ) : (
                        responses.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-700 text-sm dir-ltr inline-block">
                                        {item.shortcut}
                                    </span>
                                </TableCell>
                                <TableCell className="max-w-md truncate" title={item.content}>
                                    {item.content}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center justify-end gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => handleCopy(item.content)} title={t('copyTooltip')}>
                                            <Copy className="h-4 w-4 text-slate-400" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-red-500 hover:bg-red-50">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}