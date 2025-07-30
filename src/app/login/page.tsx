"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from '@/components/layout/logo';
import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Demo user hint
    if (email === 'admin@zizo.net' || email === 'vendor@zizo.net') {
      if (password.length === 0) setPassword('password');
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Success", description: "Logged in successfully." });
        router.push('/dashboard');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({ title: "Success", description: "Account created successfully. Welcome!" });
        router.push('/dashboard');
      }
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
            {isLogin ? 'Login to Zizo_OrderVerse' : 'Create Account'}
          </CardTitle>
          <CardDescription>
            {isLogin ? 'Authorize access to your account.' : 'Join the OrderVerse.'}
          </CardDescription>
           <CardDescription className="text-xs pt-2">
            Try `admin@zizo.net` or `vendor@zizo.net` with any password.
          </CardDescription>
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
                placeholder="agent@zizo.net"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                placeholder='••••••••'
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Establish Link' : 'Register')}
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
