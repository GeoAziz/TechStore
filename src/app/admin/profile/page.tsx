
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

// Placeholder for a component to upload images
const ImageUploadModal = ({ onSave }) => (
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

const ChangePasswordModal = ({ open, onOpenChange }) => (
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
        <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold tracking-tight glow-primary">Admin Profile</h1>
                <p className="text-muted-foreground">Manage your account settings and security.</p>
            </motion.div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 space-y-6">
                    <Card className="glass-panel text-center">
                        <CardHeader>
                            <Dialog>
                                <div className="relative w-32 h-32 mx-auto">
                                    <Avatar className="w-32 h-32 border-4 border-primary shadow-neon-primary">
                                        <AvatarImage src={user?.photoURL || ''} />
                                        <AvatarFallback><UserCircle className="w-24 h-24 text-primary" /></AvatarFallback>
                                    </Avatar>
                                    <DialogTrigger asChild>
                                    <Button
                                        size="icon"
                                        className="absolute bottom-1 right-1 rounded-full w-8 h-8 bg-accent hover:bg-accent/80"
                                    >
                                        <Pen className="w-4 h-4" />
                                    </Button>
                                    </DialogTrigger>
                                </div>
                                <ImageUploadModal onSave={handleAvatarSave} />
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <h2 className="text-2xl font-bold glow-accent">{user?.displayName || 'Admin User'}</h2>
                            <p className="text-muted-foreground">{user?.email}</p>
                            <Badge variant="secondary" className="mt-4 bg-green-500/20 text-green-300 border-green-400/40">Online</Badge>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Right Panel */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-8">
                    {/* Settings Form */}
                    <Card className="glass-panel">
                        <CardHeader>
                            <CardTitle>Account Settings</CardTitle>
                            <CardDescription>Update your personal information and preferences.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="space-y-2">
                                <Label htmlFor="displayName">Display Name</Label>
                                <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                             </div>
                             <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" value={user?.email || ''} disabled />
                             </div>
                             <div className="flex items-center justify-between">
                                <Label>Interface Theme</Label>
                                <div className="flex items-center gap-2">
                                    <span>Light</span>
                                    <Switch checked={isDarkTheme} onCheckedChange={setIsDarkTheme} />
                                    <span>Dark</span>
                                </div>
                             </div>
                             <div className="flex items-center justify-between">
                                <Label>Push Notifications</Label>
                                <Switch defaultChecked />
                             </div>
                        </CardContent>
                        <CardHeader>
                            <Button onClick={handleProfileSave} className="w-full md:w-auto"><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
                        </CardHeader>
                    </Card>

                    {/* Security Panel */}
                    <Card className="glass-panel border-accent/40">
                         <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-accent glow-accent"><Shield /> Security</CardTitle>
                            <CardDescription>Manage your account security settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setIsPasswordModalOpen(true)}>
                                <KeyRound className="w-4 h-4"/> Change Password
                            </Button>
                             <Button variant="outline" className="w-full justify-start gap-2">
                                <LogOut className="w-4 h-4"/> Logout From All Devices
                            </Button>
                            <Separator />
                            <Button variant="destructive" className="w-full justify-start gap-2">
                                <Trash2 className="w-4 h-4"/> Delete Account
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Modals */}
            <ChangePasswordModal open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen} />
        </div>
    );
}
