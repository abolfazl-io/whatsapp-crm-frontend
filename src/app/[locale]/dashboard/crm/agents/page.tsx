"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Plus, Trash2, Shield, UserCog } from "lucide-react";

interface Agent { id: number; name: string; email: string; isOnline: boolean; }

export default function AgentsPage() {
  const t = useTranslations('Agents');
  const tCommon = useTranslations('Common');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: "", email: "", password: "" });
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchAgents = async () => {
    try {
      const res = await api.get("/crm/agents");
      setAgents(res.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAgents(); }, []);

  const handleCreate = async () => {
    if (!newAgent.email || !newAgent.password || !newAgent.name) return;
    setSubmitLoading(true);
    try {
      await api.post("/auth/signup", { ...newAgent, role: 'AGENT' }); 
      // نکته: اینجا بهتر است اندپوینت اختصاصی ساخت ایجنت داشته باشید، اما فعلاً از ساین‌آپ استفاده می‌کنیم
      await fetchAgents();
      setIsDialogOpen(false);
      setNewAgent({ name: "", email: "", password: "" });
    } catch (error) { alert(tCommon('error')); } finally { setSubmitLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('delete_confirm'))) return;
    try {
      await api.delete(`/crm/agents/${id}`);
      setAgents(prev => prev.filter(a => a.id !== id));
      alert(t('success_delete'));
    } catch (error) { alert(t('error_delete')); }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCog className="h-8 w-8 text-indigo-500" />
            {t('title')}
          </h1>
          <p className="text-slate-500 mt-1">{t('subtitle')}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild><Button className="bg-indigo-600 hover:bg-indigo-700"><Plus className="mr-2 h-4 w-4" />{t('add_btn')}</Button></DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>{t('modal_title')}</DialogTitle><DialogDescription>{t('modal_desc')}</DialogDescription></DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2"><Label>{t('name_label')}</Label><Input value={newAgent.name} onChange={(e) => setNewAgent({...newAgent, name: e.target.value})} /></div>
                    <div className="space-y-2"><Label>{t('email_label')}</Label><Input type="email" value={newAgent.email} onChange={(e) => setNewAgent({...newAgent, email: e.target.value})} /></div>
                    <div className="space-y-2"><Label>{t('password_label')}</Label><Input type="password" value={newAgent.password} onChange={(e) => setNewAgent({...newAgent, password: e.target.value})} /></div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{tCommon('cancel')}</Button>
                    <Button onClick={handleCreate} disabled={submitLoading}>{submitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('save_btn')}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">{t('list_title')}</CardTitle></CardHeader>
        <CardContent className="p-0">
            <Table>
                <TableHeader><TableRow className="bg-slate-50"><TableHead>{t('table_image')}</TableHead><TableHead>{t('table_name')}</TableHead><TableHead>{t('table_email')}</TableHead><TableHead className="text-left">{t('table_actions')}</TableHead></TableRow></TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow><TableCell colSpan={4} className="h-24 text-center text-slate-500"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />{tCommon('loading')}</TableCell></TableRow>
                    ) : agents.length === 0 ? (
                        <TableRow><TableCell colSpan={4} className="h-24 text-center text-slate-500">{t('no_data')}</TableCell></TableRow>
                    ) : (
                        agents.map((agent) => (
                            <TableRow key={agent.id}>
                                <TableCell><Avatar><AvatarFallback>{agent.name[0]}</AvatarFallback></Avatar></TableCell>
                                <TableCell className="font-medium">{agent.name}</TableCell>
                                <TableCell className="font-mono text-slate-500">{agent.email}</TableCell>
                                <TableCell>
                                    <div className="flex items-center justify-end">
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(agent.id)} className="text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
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