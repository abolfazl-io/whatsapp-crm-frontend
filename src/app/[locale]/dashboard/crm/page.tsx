"use client";

import Link from "next/link";
import { 
  Users, 
  Tags, 
  Briefcase, 
  Settings, 
  ArrowRight,
  UserPlus
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const crmSections = [
  {
    title: "مخاطبین",
    description: "مدیریت لیست مشتریان، افزودن یادداشت و مشاهده تاریخچه.",
    icon: Users,
    href: "/dashboard/crm/contacts",
    color: "text-blue-600 bg-blue-50",
    action: "مشاهده لیست"
  },
  {
    title: "تگ‌ها و دسته‌بندی",
    description: "تعریف برچسب‌های رنگی برای تفکیک مشتریان (VIP، جدید و...).",
    icon: Tags,
    href: "/dashboard/crm/tags",
    color: "text-purple-600 bg-purple-50",
    action: "مدیریت تگ‌ها"
  },
  {
    title: "اپراتورها",
    description: "مدیریت تیم پشتیبانی و اختصاص چت‌ها به افراد.",
    icon: Briefcase,
    href: "/dashboard/crm/agents",
    color: "text-orange-600 bg-orange-50",
    action: "مدیریت تیم"
  },
  {
    title: "تنظیمات CRM",
    description: "تنظیم فیلدهای اختصاصی و پیکربندی سیستم.",
    icon: Settings,
    href: "/dashboard/crm/settings",
    color: "text-slate-600 bg-slate-50",
    action: "تنظیمات"
  }
];

export default function CrmDashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 py-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            مرکز مدیریت مشتریان
          </h2>
          <p className="text-muted-foreground mt-1">
            از اینجا به تمام ابزارهای CRM دسترسی دارید.
          </p>
        </div>
        
        <Link href="/dashboard/crm/contacts/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="mr-2 h-4 w-4" />
                افزودن مشتری جدید
            </Button>
        </Link>
      </div>

      {/* کارت‌های ناوبری به زیربخش‌ها */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {crmSections.map((item) => (
          <Link key={item.title} href={item.href}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-slate-200 dark:border-slate-800 group">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className={`p-3 rounded-xl ${item.color}`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {item.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm font-medium text-slate-500 group-hover:text-blue-600 transition-colors">
                  {item.action} <ArrowRight className="mr-2 h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* بخش آمار سریع (مثال) */}
      <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-slate-50 dark:bg-slate-900 border-none">
              <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">1,240</div>
                  <div className="text-xs text-muted-foreground mt-1">کل مشتریان</div>
              </CardContent>
          </Card>
          <Card className="bg-slate-50 dark:bg-slate-900 border-none">
              <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600">85</div>
                  <div className="text-xs text-muted-foreground mt-1">مشتریان جدید (هفته)</div>
              </CardContent>
          </Card>
          <Card className="bg-slate-50 dark:bg-slate-900 border-none">
              <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600">12</div>
                  <div className="text-xs text-muted-foreground mt-1">تگ‌های فعال</div>
              </CardContent>
          </Card>
          <Card className="bg-slate-50 dark:bg-slate-900 border-none">
              <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-orange-600">5</div>
                  <div className="text-xs text-muted-foreground mt-1">اپراتورهای آنلاین</div>
              </CardContent>
          </Card>
      </div>

    </div>
  );
}