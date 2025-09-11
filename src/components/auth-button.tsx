'use client';

import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase-config';
import useAuth from '@/hooks/use-auth';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { LogIn, LogOut } from 'lucide-react';

export default function AuthButton() {
  const { user, loading } = useAuth();

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error during sign-in:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error during sign-out:', error);
    }
  };

  if (loading) {
    return <Button variant="outline" size="sm" disabled>Authenticating...</Button>;
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
              <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button variant="default" onClick={handleSignIn}>
      <LogIn className="mr-2 h-4 w-4" /> Sign in with Google
    </Button>
  );
}
