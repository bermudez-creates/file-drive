'use client';

import { Button } from '@/components/ui/button';

import {
  SignInButton,
  SignOutButton,
  SignedIn,
  SignedOut,
  useSession,
} from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function Home() {
  const session = useSession();
  // sends data from frontend to back end
  // data must be same as their first shaped
  const createFile = useMutation(api.files.createFile);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <SignedIn>
        <SignOutButton>
          <Button>Sign Out</Button>
        </SignOutButton>
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <Button>Sign In</Button>
        </SignInButton>
      </SignedOut>
      <Button
        onClick={(e) => {
          createFile({
            name: 'Hello Again !',
            age: 47,
          });
        }}
        variant="ghost"
      >
        Home Button
      </Button>
    </main>
  );
}
