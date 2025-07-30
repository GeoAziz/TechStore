
import { ShieldCheck, Database, Cookie } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-2 glow-primary">Privacy Protocol</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Your data integrity is paramount. This document outlines our data handling procedures.
        </p>
      </div>

      <div className="space-y-8 max-w-4xl mx-auto">
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center gap-4">
            <ShieldCheck className="w-8 h-8 text-accent" />
            <CardTitle>1. Data We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <p>To provide our services, we collect account information (email, encrypted password), order history, and shipping details. All data is transmitted over secure, encrypted channels.</p>
            <p>We do not store your full payment card information. All transactions are handled by our secure, PCI-compliant payment processor.</p>
          </CardContent>
        </Card>
        
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center gap-4">
            <Database className="w-8 h-8 text-accent" />
            <CardTitle>2. How We Use Your Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <p>Your data is used exclusively to process orders, personalize your shopping experience, provide customer support, and communicate important system updates. We will never sell your personal information to third-party entities.</p>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center gap-4">
            <Cookie className="w-8 h-8 text-accent" />
            <CardTitle>3. Cookies and Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <p>We use essential cookies to manage your session, maintain your cart contents, and remember your preferences. These are vital for the core functionality of the OrderVerse. We do not use third-party tracking cookies for advertising purposes.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
