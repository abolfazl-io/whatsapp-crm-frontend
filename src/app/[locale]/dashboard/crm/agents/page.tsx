"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useTranslations } from "next-intl"; 
import { useRouter } from "next/navigation";
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, Loader2, Trash2, Shield, MessageSquare, 
  Image as ImageIcon, FileText, Users, Eye, KeyRound, Pencil // 👈 آیکون ویرایش
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Agent {
  id: number;
  name: string;
  email?: string;
  canSendMessage: boolean;
  canSendImage: boolean;
  canSendFile: boolean;
  canViewInbox: boolean;
  canViewContacts: boolean;
  canUseOtp: boolean;
}

export default function AgentsPage() {
  const t = useTranslations('CrmAgents');
  const router = useRouter();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // 🆕 استیت برای تشخیص حالت ویرایش
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  const initialFormState = {
    name: "",
    email: "",
    password: "",
    canSendMessage: true,
    canSendImage: true,
    canSendFile: true,
    canViewInbox: true,
    canViewContacts: true,
    canUseOtp: false,
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchAgents();
  }, []);

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

  // 🆕 تابع باز کردن مودال برای افزودن (ریست کردن فرم)
  const openAddModal = () => {
    setEditingAgent(null);
    setFormData(initialFormState);
    setIsDialogOpen(true);
  };

  // 🆕 تابع باز کردن مودال برای ویرایش (پر کردن فرم)
  const openEditModal = (agent: Agent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      email: agent.email || "",
      password: "", // رمز عبور را خالی می‌گذاریم (اگر کاربر پر نکند، تغییر نمی‌کند)
      canSendMessage: agent.canSendMessage,
      canSendImage: agent.canSendImage,
      canSendFile: agent.canSendFile,
      canViewInbox: agent.canViewInbox,
      canViewContacts: agent.canViewContacts,
      canUseOtp: agent.canUseOtp,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    
    try {
      if (editingAgent) {
        // 🔄 حالت ویرایش (Update)
        const payload: any = { ...formData };
        if (!payload.password) delete payload.password; // اگر رمز خالی بود، ارسال نکن

        await api.patch(`/crm/agents/${editingAgent.id}`, payload);
        alert("اطلاعات با موفقیت بروزرسانی شد"); // یا استفاده از toast
      } else {
        // ➕ حالت افزودن (Create)
        await api.post("/crm/agents", formData);
        alert(t('successAdd'));
      }

      await fetchAgents();
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
      alert(editingAgent ? "خطا در ویرایش" : t('errorAdd'));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('deleteConfirm'))) return;
    try {
        await api.delete(`/crm/agents/${id}`);
        setAgents(prev => prev.filter(agent => agent.id !== id));
    } catch (error) {
        alert(t('errorDelete'));
    }
  };

  const ToggleItem = ({ label, checked, onChange, icon: Icon }: any) => (
    <div 
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all ${
        checked ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200"
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${checked ? "text-blue-600" : "text-slate-400"}`} />
        <span className={`text-sm ${checked ? "text-blue-700 font-medium" : "text-slate-500"}`}>{label}</span>
      </div>
      <div className={`w-8 h-4 rounded-full relative transition-colors ${checked ? "bg-blue-500" : "bg-slate-300"}`}>
        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${checked ? "left-0.5" : "left-4.5"}`} style={{left: checked ? '4px' : '18px'}} />
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-10 space-y-8 animate-in fade-in duration-500">
      
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
            <p className="text-slate-500 mt-1">{t('description')}</p>
        </div>

        {/* دکمه افزودن */}
        <Button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            {t('addBtn')}
        </Button>

        {/* مودال (دیالوگ) مشترک برای افزودن و ویرایش */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingAgent ? "ویرایش اطلاعات و دسترسی‌ها" : t('dialog.title')}
              </DialogTitle>
              <DialogDescription>
                {editingAgent ? "اطلاعات مورد نظر را تغییر داده و ذخیره کنید." : t('dialog.desc')}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">{t('dialog.nameLabel')}</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">{t('dialog.emailLabel')}</Label>
                    <Input id="email" type="email" dir="ltr" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                </div>
                <div className="grid gap-2 col-span-2">
                    <Label htmlFor="password">
                        {t('dialog.passwordLabel')} 
                        {editingAgent && <span className="text-xs text-slate-400 mr-2">(برای تغییر نکردن خالی بگذارید)</span>}
                    </Label>
                    <Input 
                        id="password" 
                        type="password" 
                        dir="ltr" 
                        value={formData.password} 
                        onChange={(e) => setFormData({...formData, password: e.target.value})} 
                        required={!editingAgent} // فقط در حالت ساختن اجباری است
                        minLength={6} 
                    />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-slate-600 flex items-center gap-2">
                    <Shield className="h-4 w-4" /> سطح دسترسی‌ها
                </Label>
                <div className="grid grid-cols-2 gap-3">
                    <ToggleItem 
                        label="ارسال پیام" icon={MessageSquare} 
                        checked={formData.canSendMessage} 
                        onChange={(v: boolean) => setFormData({...formData, canSendMessage: v})} 
                    />
                    <ToggleItem 
                        label="ارسال تصویر" icon={ImageIcon} 
                        checked={formData.canSendImage} 
                        onChange={(v: boolean) => setFormData({...formData, canSendImage: v})} 
                    />
                    <ToggleItem 
                        label="ارسال فایل" icon={FileText} 
                        checked={formData.canSendFile} 
                        onChange={(v: boolean) => setFormData({...formData, canSendFile: v})} 
                    />
                    <ToggleItem 
                        label="مشاهده تیم‌باکس" icon={Users} 
                        checked={formData.canViewInbox} 
                        onChange={(v: boolean) => setFormData({...formData, canViewInbox: v})} 
                    />
                    <ToggleItem 
                        label="مشاهده مخاطبین" icon={Eye} 
                        checked={formData.canViewContacts} 
                        onChange={(v: boolean) => setFormData({...formData, canViewContacts: v})} 
                    />
                    <ToggleItem 
                        label="رمز پویا (OTP)" icon={KeyRound} 
                        checked={formData.canUseOtp} 
                        onChange={(v: boolean) => setFormData({...formData, canUseOtp: v})} 
                    />
                </div>
              </div>

              <DialogFooter className="mt-2">
                <Button type="submit" disabled={submitLoading} className="w-full bg-blue-600 hover:bg-blue-700">
                  {submitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingAgent ? "بروزرسانی تغییرات" : t('dialog.submitBtn'))}
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
                        <TableHead className="w-[60px]">{t('table.image')}</TableHead>
                        <TableHead>{t('table.name')}</TableHead>
                        <TableHead className="hidden md:table-cell">{t('table.email')}</TableHead>
                        <TableHead>{t('table.permissions')}</TableHead>
                        <TableHead className="text-left">{t('table.actions')}</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {agents.map((agent) => (
                        <TableRow key={agent.id}>
                        <TableCell>
                            <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                                    {agent.name?.[0]?.toUpperCase() || "A"}
                                </AvatarFallback>
                            </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">
                            <div className="flex flex-col">
                                <span>{agent.name}</span>
                                <span className="md:hidden text-xs text-slate-400">{agent.email}</span>
                            </div>
                        </TableCell>
                        <TableCell className="font-mono text-slate-500 hidden md:table-cell text-xs">{agent.email || "-"}</TableCell>
                        
                        {/* ستون نمایش دسترسی‌ها */}
                        <TableCell>
                            <div className="flex flex-wrap gap-1">
                                {agent.canSendMessage && <Badge variant="secondary" className="text-[10px] px-1 bg-green-50 text-green-700 border-green-100">Msg</Badge>}
                                {agent.canSendFile && <Badge variant="secondary" className="text-[10px] px-1 bg-blue-50 text-blue-700 border-blue-100">File</Badge>}
                                {agent.canUseOtp && <Badge variant="outline" className="text-[10px] px-1 border-orange-200 text-orange-600 font-bold">OTP</Badge>}
                                {!agent.canSendMessage && !agent.canSendFile && !agent.canUseOtp && 
                                    <span className="text-xs text-slate-300">بدون دسترسی ویژه</span>
                                }
                            </div>
                        </TableCell>

                        <TableCell className="text-left">
                            <div className="flex items-center justify-end gap-1">
                                {/* دکمه ویرایش ✏️ */}
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-blue-500 hover:bg-blue-50 h-8 w-8"
                                    onClick={() => openEditModal(agent)}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>

                                {/* دکمه حذف 🗑️ */}
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-red-500 hover:bg-red-50 h-8 w-8"
                                    onClick={() => handleDelete(agent.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
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