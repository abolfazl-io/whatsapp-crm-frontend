import { Sidebar } from "@/components/layout/sidebar"; // مطمئن شو فایل sidebar.tsx درست باشد
import { ScrollArea } from "@/components/ui/scroll-area";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* 1. سایدبار ثابت */}
      <aside className="hidden md:flex h-full flex-col fixed inset-y-0 z-50">
        <Sidebar />
      </aside>

      {/* 2. محتوای اصلی (که اسکرول می‌خورد) */}
      {/* حاشیه سمت راست (mr-20) یا چپ (ml-20) بسته به زبان، توسط کلاس‌های CSS کنترل می‌شود */}
      <main className="flex-1 md:ms-20 h-full relative flex flex-col transition-all duration-300">
        <ScrollArea className="h-full w-full">
          <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}