import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
    // تنظیمات دیگر نکست جی‌اس
};

// 👇 نکته مهم: آدرس فایل i18n.ts را اینجا دقیق می‌دهیم
const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

export default withNextIntl(nextConfig);