import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, Activity, BarChart3 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function DashboardPage() {
  const t = useTranslations('Sidebar'); // یا یک کلید جدید Dashboard بسازید

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      {/* هدر صفحه */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">داشبورد</h2>
          <p className="text-muted-foreground mt-2">وضعیت کلی سیستم و فعالیت‌های اخیر ربات.</p>
        </div>
      </div>

      {/* کارت‌های آمار */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="کل پیام‌ها" 
          value="+12,300" 
          desc="۲۰٪ افزایش نسبت به ماه قبل" 
          icon={MessageSquare} 
        />
        <StatsCard 
          title="مخاطبین فعال" 
          value="+573" 
          desc="۱۵ مخاطب جدید امروز" 
          icon={Users} 
        />
        <StatsCard 
          title="وضعیت اتصال" 
          value="متصل" 
          desc="پینگ: 45ms" 
          icon={Activity} 
          success 
        />
        <StatsCard 
          title="کمپین‌ها" 
          value="3 فعال" 
          desc="۱۲۰۰ پیام در صف ارسال" 
          icon={BarChart3} 
        />
      </div>

      {/* فضای خالی برای نمودار آینده */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>نمودار پیام‌های هفته</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] flex items-center justify-center text-slate-400 bg-slate-50 rounded-md border border-dashed">
              نمودار اینجا قرار می‌گیرد...
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>آخرین فعالیت‌ها</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full ml-2"></span>
                  <p className="text-sm font-medium">علی به پیام 0912... پاسخ داد</p>
                  <span className="mr-auto text-xs text-muted-foreground">2 دقیقه پیش</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full ml-2"></span>
                  <p className="text-sm font-medium">کمپین "تخفیف یلدا" شروع شد</p>
                  <span className="mr-auto text-xs text-muted-foreground">1 ساعت پیش</span>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// کامپوننت کوچک برای کارت‌ها
function StatsCard({ title, value, desc, icon: Icon, success = false }: any) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${success ? 'text-green-500' : 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${success ? 'text-green-600' : ''}`}>{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{desc}</p>
      </CardContent>
    </Card>
  );
}