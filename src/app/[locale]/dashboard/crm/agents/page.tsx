"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useTranslations } from "next-intl"; // 👈 هوک ترجمه
import { useRouter } from "next/navigation"; // برای ریدارکت بهتر
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Agent {
  id: number;
  name: string;
  email?: string;
}

export default function AgentsPage() {
  const t = useTranslations('CrmAgents'); // 👈 کلید ترجمه
  const router = useRouter();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    // بررسی دسترسی ادمین
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user.role !== 'ADMIN') {
                alert(t('accessDenied'));
                router.push("/dashboard"); 
            }
        } catch (e) {
            // اگر خطای پارس داشت، یعنی دیتای یوزر خراب است
        }
    }
    fetchAgents();
  }, [router, t]);

  const fetchAgents = async () => {
    try {
      const res = await api.get("/crm/agents");
      setAgents(res.data);
    } catch (error) {
      console.error("Error fetching agents", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await api.post("/crm/agents", formData);
      await fetchAgents();
      setIsDialogOpen(false);
      setFormData({ name: "", email: "", password: "" });
      alert(t('successAdd'));
    } catch (error) {
      alert(t('errorAdd'));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(t('deleteConfirm'));
    if (!confirmDelete) return;

    try {
        await api.delete(`/crm/agents/${id}`);
        setAgents(prev => prev.filter(agent => agent.id !== id));
        alert(t('successDelete'));
    } catch (error) {
        console.error(error);
        alert(t('errorDelete'));
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-8 animate-in fade-in duration-500">
      
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
            <p className="text-slate-500 mt-1">{t('description')}</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              {t('addBtn')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t('dialog.title')}</DialogTitle>
              <DialogDescription>{t('dialog.desc')}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{t('dialog.nameLabel')}</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">{t('dialog.emailLabel')}</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">{t('dialog.passwordLabel')}</Label>
                <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required minLength={6} />
              </div>
              <DialogFooter className="mt-4">
                <Button type="submit" disabled={submitLoading} className="w-full bg-blue-600 hover:bg-blue-700">
                  {submitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('dialog.submitBtn')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>{t('listTitle', { count: agents.length })}</CardTitle></CardHeader>
        <CardContent>
            {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
            ) : agents.length === 0 ? (
                <div className="text-center py-10 text-slate-500">{t('noAgents')}</div>
            ) : (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">{t('table.image')}</TableHead>
                        <TableHead>{t('table.name')}</TableHead>
                        <TableHead>{t('table.email')}</TableHead>
                        <TableHead className="text-left">{t('table.actions')}</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {agents.map((agent) => (
                        <TableRow key={agent.id}>
                        <TableCell>
                            <Avatar><AvatarFallback className="bg-blue-100 text-blue-700">{agent.name?.[0]?.toUpperCase() || "U"}</AvatarFallback></Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{agent.name}</TableCell>
                        <TableCell className="font-mono text-slate-500">{agent.email || "-"}</TableCell>
                        <TableCell className="text-left">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-red-500 hover:bg-red-50"
                                onClick={() => handleDelete(agent.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>
    </div>
  );
}