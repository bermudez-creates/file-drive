'use client';

import { Button } from '@/components/ui/button';

import {
  SignInButton,
  SignOutButton,
  SignedIn,
  SignedOut,
  useSession,
} from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function Home() {
  const session = useSession();
  // sends data from frontend to back end
  // data must be same as their first shaped
  const createFile = useMutation(api.files.createFile);
  const files = useQuery(api.files.getFiles);
  console.log(`Files`, files);

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

      {files?.map((file) => {
        return (
          <div key={file._id}>
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
              {file.names}
              {file.age}
            </h1>
          </div>
        );
      })}

      <Button
        onClick={(e) => {
          createFile({
            name: 'Hello America!',
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
