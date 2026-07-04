"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api"; // فرض بر این است که نمونه axios شماست
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Zap, Ban, Unlock, ShieldAlert } from "lucide-react";

interface AdminUser {
  id: number;
  name: string | null;
  email: string;
  plan: string;
  isActive: boolean;
  subscriptionEnd: string | null;
  createdAt: string;
  _count: { agents: number };
}

export default function SuperAdminPanel() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // استیت‌های مربوط به فرم لاگین اختصاصی
  const [needsLogin, setNeedsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
      // 👈 اضافه کردن خودکار توکن به هدرِ تمام درخواست‌ها در لحظه لود صفحه
      const token = localStorage.getItem("token");
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
      
      fetchUsers();
    }, []);

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        
        // تلاش برای دریافت دیتا به همراه ارسال دستی توکن (برای اطمینان ۱۰۰٪)
        const res = await api.get("/crm/super-admin/users", {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        setUsers(res.data);
        setIsAuthorized(true);
        setNeedsLogin(false);
      } catch (error: any) {
        // 🚫 اگر توکن نامعتبر بود، فرم لاگین را نشان بده
        setIsAuthorized(false);
        setNeedsLogin(true);
      } finally {
        setLoading(false);
      }
    };

// 🔑 تابع لاگین اختصاصی مدیر کل
  // 🔑 تابع لاگین اختصاصی مدیر کل
  // 🔑 تابع لاگین اختصاصی مدیر کل
  const handleSuperAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await api.post("/auth/super-admin/login", { email, password });
      
      // تلاش برای پیدا کردن توکن در ساختارهای مختلف
      const token = res.data?.access_token || res.data?.token || res.data?.data?.token || res.data?.data?.access_token;
      
      if (token) {
        // ذخیره توکن
        localStorage.setItem("token", token);
        document.cookie = `token=${token}; path=/; max-age=86400;`;
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // رفرش صفحه برای بارگزاری داشبورد
        window.location.reload();
      } else {
        // 🛑 اگر توکن پیدا نشد، به جای رفرش کردن، ارور نشان بده!
        console.error("پاسخ سرور:", res.data);
        setLoginError("لاگین موفق بود اما توکنی از سرور دریافت نشد! (لطفا کنسول را چک کنید)");
        setLoginLoading(false);
      }
    } catch (error: any) {
      setLoginError(error.response?.data?.message || "ایمیل یا رمز عبور اشتباه است.");
      setLoginLoading(false);
    }
  };

  
  // ⚡ عملیات شارژ و مسدودسازی[cite: 13]
  const handleActivate = async (id: number) => {
    if (!window.confirm("آیا اکانت این کاربر ۳۰ روز شارژ شود؟")) return;
    try {
      await api.post(`/crm/super-admin/users/${id}/activate`, { days: 30, plan: "PRO" });
      alert("اشتراک ۳۰ روزه با موفقیت فعال شد.");
      fetchUsers();
    } catch (error) {
      alert("خطا در فعالسازی");
    }
  };

  const handleDeactivate = async (id: number) => {
    if (!window.confirm("آیا از مسدود کردن این شرکت اطمینان دارید؟")) return;
    try {
      await api.post(`/crm/super-admin/users/${id}/deactivate`);
      alert("اکانت مسدود شد.");
      fetchUsers();
    } catch (error) {
      alert("خطا در مسدودسازی");
    }
  };

  const handleFreePlan = async (id: number) => {
    if (!window.confirm("پلن این کاربر به رایگان (بدون انقضا) تغییر کند؟")) return;
    try {
      await api.post(`/crm/super-admin/users/${id}/free-plan`);
      alert("پلن کاربر رایگان شد.");
      fetchUsers();
    } catch (error) {
      alert("خطا در تغییر پلن");
    }
  };

  // ۱. حالت لودینگ اولیه
  if (loading && !needsLogin) {
    return (
      <div className="h-[80vh] w-full flex flex-col items-center justify-center animate-in fade-in duration-500">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
        <p className="text-slate-500 font-medium">در حال بررسی سطح دسترسی امنیتی...</p>
      </div>
    );
  }

  // ۲. نمایش فرم لاگین اگر کاربر مجاز نیست
  if (needsLogin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 animate-in zoom-in-95 duration-500">
        <Card className="w-full max-w-md shadow-lg border-red-100">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <div className="p-3 bg-red-50 rounded-full">
                <ShieldAlert className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">ورود مدیریت کل</CardTitle>
            <CardDescription>
              این بخش فقط برای مدیر اصلی سامانه (Super Admin) در دسترس است.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSuperAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">ایمیل مدیریت</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@example.com" 
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">رمز عبور</Label>
                <Input 
                  id="password" 
                  type="password" 
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              
              {loginError && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md">
                  {loginError}
                </div>
              )}

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loginLoading}>
                {loginLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                ورود به پنل ادمین
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ۳. نمایش پنل مدیریت کل (در صورت لاگین موفق)[cite: 13]
  return (
    <div className="max-w-7xl mx-auto py-10 space-y-8 px-4 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">پنل مدیریت کل (Super Admin)</h1>
        <p className="text-slate-500 mt-2">مدیریت اشتراک‌ها، مسدودسازی و کنترل دسترسی مشتریان.</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>لیست مشتریان ({users.length} شرکت)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>نام / ایمیل</TableHead>
                <TableHead>وضعیت کلی</TableHead>
                <TableHead>پلن</TableHead>
                <TableHead className="text-center">تعداد کارمند</TableHead>
                <TableHead>انقضای اشتراک</TableHead>
                <TableHead className="text-end rtl:text-left ltr:text-right">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const isExpired = user.subscriptionEnd && new Date(user.subscriptionEnd) < new Date();
                
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{user.name || "بدون نام"}</span>
                        <span className="text-xs text-slate-500">{user.email}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {user.isActive ? (
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">فعال</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">مسدود</Badge>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="secondary" className="font-mono text-[10px]">{user.plan}</Badge>
                    </TableCell>

                    <TableCell className="text-center">{user._count.agents} نفر</TableCell>
                    
                    <TableCell>
                      {user.plan === 'FREE' ? (
                        <span className="text-xs text-slate-400">بدون انقضا</span>
                      ) : (
                        <div className="flex flex-col">
                          <span className={`text-sm ${isExpired ? 'text-red-500 font-bold' : 'text-slate-700'}`}>
                            {user.subscriptionEnd ? new Date(user.subscriptionEnd).toLocaleDateString('fa-IR') : '-'}
                          </span>
                          {isExpired && <span className="text-[10px] text-red-400">منقضی شده</span>}
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="text-end rtl:text-left ltr:text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 h-8"
                          onClick={() => handleActivate(user.id)}
                          title="شارژ ۳۰ روزه"
                        >
                          <Zap className="h-3 w-3 ltr:mr-1 rtl:ml-1" /> شارژ
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 h-8"
                          onClick={() => handleFreePlan(user.id)}
                          title="تبدیل به رایگان"
                        >
                          <Unlock className="h-3 w-3 ltr:mr-1 rtl:ml-1" /> رایگان
                        </Button>

                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 h-8 w-8"
                          onClick={() => handleDeactivate(user.id)}
                          title="مسدود کردن"
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}