import { redirect } from 'next/navigation';

export default async function RootPage({ params }: { params: Promise<{ locale: string }> }) {
  // 👈 اینجا هم باید await شود
  const { locale } = await params;
  
  redirect(`/${locale}/login`);
}