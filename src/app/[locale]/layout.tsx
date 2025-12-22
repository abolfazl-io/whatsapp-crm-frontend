import type { Metadata } from "next";
import "../globals.css"; // 👈 دقت کنید مسیر دو تا برگشت عقب (../..)
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export const metadata: Metadata = {
  title: "TeamInbox Global",
  description: "Enterprise WhatsApp CRM",
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>; // 👈 استفاده از Promise
}) {
  const messages = await getMessages();
  
  // 👈 در Next.js 15 پارامترها باید await شوند
  const { locale } = await params;
  
  const dir = locale === 'fa' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}