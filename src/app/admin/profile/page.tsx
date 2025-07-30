"use client";

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Loader2, UserCircle, Pen, Shield, Trash2, KeyRound, LogOut, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';

// Fix: Add types to modal props
const ImageUploadModal = ({ onSave }: { onSave: () => void }) => (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Change Avatar</DialogTitle>
        <DialogDescription>Upload a new image for your profile.</DialogDescription>
      </DialogHeader>
      <div className="py-4">
        {/* Basic file input for demonstration */}
        <Input type="file" />
      </div>
      <DialogFooter>
        <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
        </DialogClose>
        <Button onClick={onSave}>Save</Button>
      </DialogFooter>
    </DialogContent>
);

const ChangePasswordModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Change Password</DialogTitle>
        <DialogDescription>Enter your old and new passwords.</DialogDescription>
      </DialogHeader>
      <div className="py-4 space-y-4">
        <Input type="password" placeholder="Old Password" />
        <Input type="password" placeholder="New Password" />
        <Input type="password" placeholder="Confirm New Password" />
      </div>
      <DialogFooter>
        <Button onClick={() => onOpenChange(false)} variant="ghost">Cancel</Button>
        <Button>Change Password</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);


export default function AdminProfilePage() {
    const { user, loading, updateUserProfile } = useAuth();
    const { toast } = useToast();
    
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    
    const [isDarkTheme, setIsDarkTheme] = useState(true);

    const handleProfileSave = async () => {
        try {
            await updateUserProfile({ displayName });
            toast({
                title: "Profile Updated",
                description: "Your changes have been saved successfully.",
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: "Update Failed",
                description: "Could not save your profile.",
            });
        }
    };
    
    const handleAvatarSave = () => {
        // This would be handled by the quick edit dialog for now.
        // In a more complex app, this could trigger a dedicated upload flow.
        toast({ title: "Avatar Updated" });
    };

    if (loading) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-8" role="main" aria-label="Admin Profile Main Content">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold tracking-tight glow-primary" tabIndex={0} aria-label="Admin Profile Heading">Admin Profile</h1>
            <p className="text-muted-foreground" tabIndex={0}>Manage your account settings and security.</p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 space-y-6">
              <Card className="glass-panel text-center" role="region" aria-label="Profile Card">
                <CardHeader>
                  <Dialog>
                    <div className="relative w-32 h-32 mx-auto" tabIndex={0} aria-label="Profile Avatar">
                      <Avatar className="w-32 h-32 border-4 border-primary shadow-neon-primary">
                        <AvatarImage src={user?.photoURL || ''} alt="User Avatar" />
                        <AvatarFallback><UserCircle className="w-24 h-24 text-primary" aria-label="Default User Icon" /></AvatarFallback>
                      </Avatar>
                      <DialogTrigger asChild>
                        <Button
                          size="icon"
                          aria-label="Change Avatar"
                          className="absolute bottom-1 right-1 rounded-full w-8 h-8 bg-accent hover:bg-accent/80 focus:ring-2 focus:ring-accent"
                        >
                          <Pen className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                    </div>
                    <ImageUploadModal onSave={handleAvatarSave} />
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <h2 className="text-2xl font-bold glow-accent" tabIndex={0}>{user?.displayName || 'Admin User'}</h2>
                  <p className="text-muted-foreground" tabIndex={0}>{user?.email}</p>
                  <Badge variant="secondary" className="mt-4 bg-green-500/20 text-green-300 border-green-400/40" aria-label="Online Status">Online</Badge>
                </CardContent>
              </Card>
            </motion.div>
            {/* Right Panel */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-8">
              {/* Settings Form */}
              <Card className="glass-panel" role="form" aria-label="Account Settings">
                <CardHeader>
                  <CardTitle tabIndex={0}>Account Settings</CardTitle>
                  <CardDescription tabIndex={0}>Update your personal information and preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} aria-label="Display Name Input" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" value={user?.email || ''} disabled aria-label="Email Address Input" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="theme-switch">Interface Theme</Label>
                    <div className="flex items-center gap-2">
                      <span>Light</span>
                      <Switch id="theme-switch" checked={isDarkTheme} onCheckedChange={setIsDarkTheme} aria-label="Toggle theme" />
                      <span>Dark</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications-switch">Push Notifications</Label>
                    <Switch id="notifications-switch" defaultChecked aria-label="Toggle push notifications" />
                  </div>
                </CardContent>
                <CardHeader>
                  <Button onClick={handleProfileSave} className="w-full md:w-auto" aria-label="Save Profile Changes"><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
                </CardHeader>
              </Card>
              {/* Security Panel */}
              <Card className="glass-panel border-accent/40" role="region" aria-label="Security Panel">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-accent glow-accent" tabIndex={0}><Shield /> Security</CardTitle>
                  <CardDescription tabIndex={0}>Manage your account security settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setIsPasswordModalOpen(true)} aria-label="Change Password">
                    <KeyRound className="w-4 h-4"/> Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" aria-label="Logout From All Devices">
                    <LogOut className="w-4 h-4"/> Logout From All Devices
                  </Button>
                  <Separator />
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="w-full justify-start gap-2" aria-label="Delete Account">
                        <Trash2 className="w-4 h-4"/> Delete Account
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle tabIndex={0}>Are you absolutely sure?</DialogTitle>
                        <DialogDescription tabIndex={0}>
                          This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="ghost" aria-label="Cancel Delete Account">Cancel</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={() => toast({variant: 'destructive', title: "Action not implemented"})} aria-label="Confirm Delete Account">Delete Account</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          {/* Modals */}
          <ChangePasswordModal open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen} />
        </div>
    );
}
