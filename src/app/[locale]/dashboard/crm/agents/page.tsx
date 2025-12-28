"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
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
import { Plus, User, Mail, Shield, Loader2, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Agent {
  id: number;
  name: string;
  email?: string;
}

export default function AgentsPage() {
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
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'ADMIN') {
    alert("شما دسترسی به این صفحه ندارید");
    window.location.href = "/dashboard"; // ریدارکت به خانه
    }
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await api.get("/crm/agents");
      setAgents(res.data);
    } catch (error) {
      console.error("خطا در دریافت لیست", error);
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
      alert("ایجنت با موفقیت ساخته شد!");
    } catch (error) {
      alert("خطا در ساخت ایجنت.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // 👇 تابع جدید برای حذف
  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("آیا از حذف این اپراتور اطمینان دارید؟ این عملیات قابل بازگشت نیست.");
    if (!confirmDelete) return;

    try {
        await api.delete(`/crm/agents/${id}`);
        // حذف موفقیت آمیز -> رفرش لیست
        setAgents(prev => prev.filter(agent => agent.id !== id));
        alert("اپراتور حذف شد.");
    } catch (error) {
        console.error(error);
        // خطای رایج: اگر ایجنت چت‌های متصل داشته باشد
        alert("خطا در حذف. ممکن است این اپراتور دارای چت‌های فعال باشد و دیتابیس اجازه حذف ندهد.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-8 animate-in fade-in duration-500">
      
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">مدیریت اپراتورها</h1>
            <p className="text-slate-500 mt-1">لیست همکارانی که به چت‌ها پاسخ می‌دهند.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              افزودن اپراتور جدید
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>تعریف اپراتور جدید</DialogTitle>
              <DialogDescription>اطلاعات ورود همکار جدید را وارد کنید.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">نام نمایشی</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">ایمیل</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">رمز عبور</Label>
                <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required minLength={6} />
              </div>
              <DialogFooter className="mt-4">
                <Button type="submit" disabled={submitLoading} className="w-full bg-blue-600 hover:bg-blue-700">
                  {submitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "ثبت اپراتور"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>لیست پرسنل ({agents.length})</CardTitle></CardHeader>
        <CardContent>
            {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
            ) : agents.length === 0 ? (
                <div className="text-center py-10 text-slate-500">هنوز هیچ اپراتوری تعریف نشده است.</div>
            ) : (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">تصویر</TableHead>
                        <TableHead>نام</TableHead>
                        <TableHead>ایمیل</TableHead>
                        <TableHead className="text-left">عملیات</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {agents.map((agent) => (
                        <TableRow key={agent.id}>
                        <TableCell>
                            <Avatar><AvatarFallback className="bg-blue-100 text-blue-700">{agent.name?.[0] || "U"}</AvatarFallback></Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{agent.name}</TableCell>
                        <TableCell className="font-mono text-slate-500">{agent.email || "-"}</TableCell>
                        <TableCell className="text-left">
                            {/* 👇 دکمه حذف به تابع متصل شد */}
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