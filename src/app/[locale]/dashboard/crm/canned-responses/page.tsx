"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
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
import { Loader2, Plus, MessageSquareText, Trash2, Zap, Copy } from "lucide-react";

interface CannedResponse {
  id: number;
  shortcut: string;
  content: string;
}

export default function CannedResponsesPage() {
  const [responses, setResponses] = useState<CannedResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  // استیت‌های فرم ساخت
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newResponse, setNewResponse] = useState({ shortcut: "", content: "" });
  const [submitLoading, setSubmitLoading] = useState(false);

  // دریافت اطلاعات از سرور
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

  // ارسال فرم ساخت پاسخ جدید
  const handleCreate = async () => {
    if (!newResponse.shortcut || !newResponse.content) return;
    
    setSubmitLoading(true);
    try {
      const res = await api.post("/crm/canned-responses", newResponse);
      setResponses([res.data, ...responses]); // افزودن به ابتدای لیست
      setIsDialogOpen(false); // بستن مودال
      setNewResponse({ shortcut: "", content: "" }); // پاک کردن فرم
      alert("پاسخ آماده با موفقیت ساخته شد.");
    } catch (error) {
      alert("خطا در ذخیره پاسخ آماده");
    } finally {
      setSubmitLoading(false);
    }
  };

    const handleDelete = async (id: number) => {
        // 1. تاییدیه گرفتن از کاربر
        const confirmDelete = window.confirm("آیا از حذف این مورد اطمینان دارید؟");
        if (!confirmDelete) return;
        
        try {
            // 2. فراخوانی API
            // دقت کنید که از id استفاده شده باشد
            await api.delete(`/crm/canned-responses/${id}`);
            
            // 3. آپدیت لیست در صورت موفقیت (حذف از آرایه state)
            setResponses(prev => prev.filter(item => item.id !== id));
            
            // پیام موفقیت (اختیاری)
            // alert("حذف شد"); 
        } catch (error) {
            console.error("خطا در حذف:", error);
            alert("خطا در حذف آیتم. لطفا کنسول مرورگر را چک کنید.");
        }
    };

  // کپی کردن متن (قابلیت اضافی)
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("متن کپی شد!");
  };
  

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-6 animate-in fade-in duration-500">
      
      {/* هدر صفحه */}
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="h-8 w-8 text-yellow-500" />
                پاسخ‌های آماده
            </h1>
            <p className="text-slate-500 mt-1">مدیریت متن‌های پرتکرار برای پاسخ‌دهی سریع‌تر.</p>
        </div>

        {/* دکمه افزودن */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    افزودن پاسخ جدید
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>ساخت پاسخ آماده جدید</DialogTitle>
                    <DialogDescription>
                        یک میانبر کوتاه و متن کامل پیام را وارد کنید.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>کد میانبر (Shortcut)</Label>
                        <Input 
                            placeholder="مثلا: /hi" 
                            value={newResponse.shortcut}
                            onChange={(e) => setNewResponse({...newResponse, shortcut: e.target.value})}
                        />
                        <p className="text-xs text-slate-400">از این کد برای پیدا کردن سریع پیام استفاده می‌شود.</p>
                    </div>
                    <div className="space-y-2">
                        <Label>متن پیام</Label>
                        <Textarea 
                            placeholder="متن کامل پیام خود را اینجا بنویسید..." 
                            className="h-32 resize-none"
                            value={newResponse.content}
                            onChange={(e) => setNewResponse({...newResponse, content: e.target.value})}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>انصراف</Button>
                    <Button onClick={handleCreate} disabled={submitLoading || !newResponse.shortcut || !newResponse.content}>
                        {submitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "ذخیره"}
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
                        <TableHead className="w-[150px]">میانبر</TableHead>
                        <TableHead>متن پیام</TableHead>
                        <TableHead className="w-[100px] text-left">عملیات</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center text-slate-500">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                در حال بارگذاری...
                            </TableCell>
                        </TableRow>
                    ) : responses.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center text-slate-500">
                                هیچ پاسخ آماده‌ای تعریف نشده است.
                            </TableCell>
                        </TableRow>
                    ) : (
                        responses.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-700 text-sm">
                                        {item.shortcut}
                                    </span>
                                </TableCell>
                                <TableCell className="max-w-md truncate" title={item.content}>
                                    {item.content}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center justify-end gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => handleCopy(item.content)} title="کپی متن">
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