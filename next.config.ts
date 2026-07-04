import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
    // تنظیمات دیگر نکست جی‌اس
    allowedDevOrigins: ["127.0.0.1", "localhost"],
};

// 👇 نکته مهم: آدرس فایل i18n.ts را اینجا دقیق می‌دهیم
const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

export default withNextIntl(nextConfig);