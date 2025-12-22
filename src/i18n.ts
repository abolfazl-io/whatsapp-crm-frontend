import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

const locales = ['en', 'fa'];

export default getRequestConfig(async ({ requestLocale }) => {
  // دریافت زبان درخواستی
  const locale = await requestLocale;

  // اعتبارسنجی: اگر زبان معتبر نبود یا وجود نداشت
  if (!locale || !locales.includes(locale as string)) {
    notFound();
  }

  return {
    locale, // بازگرداندن لوکال برای اطمینان
    // ایمپورت از پوشه messages (دقت کنید که پوشه را rename کرده باشید)
    messages: (await import(`./messages/${locale}.json`)).default
  } as any; // 👈 این بخش "as any" باعث می‌شود تایپ‌اسکریپت دیگر گیر ندهد
});