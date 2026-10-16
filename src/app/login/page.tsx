"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from '@/components/layout/logo';
import { useState, Suspense } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ShieldCheck, Store, UserCheck } from 'lucide-react';
import { PasswordInput } from '@/components/ui/password-input';

function setSessionCookies(token: string) {
  if (typeof document === 'undefined') return;
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `__session=${token}; path=/; max-age=3600; SameSite=Lax${isSecure}`;
  document.cookie = `firebaseAuthSession=${token}; path=/; max-age=3600; SameSite=Lax${isSecure}`;
}

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Success", description: "Logged in successfully." });
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        toast({ title: "Success", description: "Account created successfully. Welcome!" });
      }

      const token = await userCredential.user.getIdToken();
      setSessionCookies(token);

      router.push(redirectTarget);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-12">
      <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-primary/20 card-glow">
        <CardHeader className="text-center">
          <Logo className="h-8 w-auto mx-auto mb-4" />
          <CardTitle className="text-2xl glow-primary">
            {isLogin ? 'Login to TechStore' : 'Create Account'}
          </CardTitle>
          <CardDescription>
            {isLogin ? 'Authorize access to your account.' : 'Join TechStore Marketplace.'}
          </CardDescription>

          {isLogin && (
            <div className="pt-3">
              <p className="text-xs text-muted-foreground mb-2">Quick Demo Credentials (password: password123):</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 gap-1 border-primary/40 text-primary"
                  onClick={() => handleQuickFill('admin@demo.com')}
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Admin
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 gap-1 border-accent/40 text-accent"
                  onClick={() => handleQuickFill('apple.vendor@techstore.co.ke')}
                >
                  <Store className="w-3.5 h-3.5" /> Vendor
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 gap-1 border-cyan-400/40 text-cyan-300"
                  onClick={() => handleQuickFill('client@demo.com')}
                >
                  <UserCheck className="w-3.5 h-3.5" /> Client
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@domain.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                required
                value={password}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
              {loading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Register')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            {isLogin ? "No account?" : "Already have an account?"}{' '}
            <Button variant="link" className="p-0 text-primary hover:underline" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Register here." : "Login here."}
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
