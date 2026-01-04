"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Book, Key, Send, Home, LayoutDashboard } from "lucide-react";
import { usePathname } from "next/navigation";

export default function DocsPage() {
  const t = useTranslations('Docs');
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'fa';
  const isRtl = currentLocale === 'fa';

  const baseUrl = "http://localhost:3000"; // آدرس API شما

  // 1. cURL Example
  const curlExample = `curl -X POST "${baseUrl}/whatsapp/api/send" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"receptor": "09120000000", "message": "Hello World"}'`;

  // 2. Node.js Example
  const nodeExample = `const axios = require('axios');

await axios.post('${baseUrl}/whatsapp/api/send', {
  receptor: '09120000000',
  message: 'Hello World'
}, {
  headers: { 
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json' 
  }
});`;

  // 3. Python Example (Added ✅)
  const pythonExample = `import requests

url = "${baseUrl}/whatsapp/api/send"

headers = {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json"
}

data = {
    "receptor": "09120000000",
    "message": "Hello World"
}

response = requests.post(url, json=data, headers=headers)
print(response.json())`;

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col ${isRtl ? 'dir-rtl' : 'dir-ltr'}`}>
      
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <Book className="h-6 w-6" /> {t('title')}
          </div>
          <div className="flex gap-2">
            <Link href={`/${currentLocale}`}>
                <Button variant="ghost" size="sm"><Home className="w-4 h-4 mr-2"/>{t('back_home')}</Button>
            </Link>
            <Link href={`/${currentLocale}/dashboard`}>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white"><LayoutDashboard className="w-4 h-4 mr-2"/>{t('go_dashboard')}</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0">
          <Card className="sticky top-24 border-slate-200 dark:border-slate-800 shadow-sm">
             <CardContent className="p-4 space-y-1">
                <a href="#intro" className="block px-4 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">{t('menu_intro')}</a>
                <a href="#auth" className="block px-4 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">{t('menu_auth')}</a>
                <a href="#send" className="block px-4 py-2 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-sm font-medium transition-colors">{t('menu_send')}</a>
             </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-12 pb-20">
            
            {/* Introduction */}
            <section id="intro" className="scroll-mt-24">
                <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">{t('intro_title')}</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                    {t('intro_text')}
                </p>
            </section>

            {/* Authentication */}
            <section id="auth" className="scroll-mt-24">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-yellow-100 rounded-lg text-yellow-700"><Key className="h-6 w-6"/></div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('auth_title')}</h2>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-4">{t('auth_text')}</p>
                <div className="bg-slate-900 text-slate-300 p-4 rounded-lg font-mono text-sm border-l-4 border-yellow-500 shadow-inner">
                    header: <span className="text-green-400">x-api-key</span>: YOUR_SECRET_KEY
                </div>
            </section>

            {/* Send Message Endpoint */}
            <section id="send" className="scroll-mt-24">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-green-100 rounded-lg text-green-700"><Send className="h-6 w-6"/></div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('endpoint_send')}</h2>
                </div>
                
                <Card className="mb-6 overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 font-mono text-sm flex items-center gap-2 border-b border-slate-200 dark:border-slate-700">
                        <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs font-bold">POST</span>
                        <span className="text-slate-600 dark:text-slate-300 font-medium">/whatsapp/api/send</span>
                    </div>
                    <CardContent className="p-6">
                        <h4 className="font-bold mb-3 text-sm uppercase text-slate-500 tracking-wider">{t('params')}</h4>
                        <ul className="space-y-2 list-disc list-inside text-sm text-slate-700 dark:text-slate-300 mb-8 ml-2">
                            <li><code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-red-500 font-mono">receptor</code>: {t('param_receptor')}</li>
                            <li><code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-red-500 font-mono">message</code>: {t('param_message')}</li>
                        </ul>

                        <h4 className="font-bold mb-3 text-sm uppercase text-slate-500 tracking-wider">Example Code</h4>
                        
                        <Tabs defaultValue="curl" className="w-full">
                            <TabsList className="mb-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                <TabsTrigger value="curl" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">cURL</TabsTrigger>
                                <TabsTrigger value="node" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">Node.js</TabsTrigger>
                                <TabsTrigger value="python" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">Python</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="curl">
                                <div className="bg-slate-950 text-slate-300 p-4 rounded-lg font-mono text-sm overflow-x-auto dir-ltr text-left shadow-inner custom-scrollbar">
                                    <pre>{curlExample}</pre>
                                </div>
                            </TabsContent>
                            
                            <TabsContent value="node">
                                <div className="bg-slate-950 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto dir-ltr text-left shadow-inner custom-scrollbar">
                                    <pre>{nodeExample}</pre>
                                </div>
                            </TabsContent>
                            
                            <TabsContent value="python">
                                <div className="bg-slate-950 text-yellow-400 p-4 rounded-lg font-mono text-sm overflow-x-auto dir-ltr text-left shadow-inner custom-scrollbar">
                                    <pre>{pythonExample}</pre>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </section>

        </main>
      </div>
    </div>
  );
}