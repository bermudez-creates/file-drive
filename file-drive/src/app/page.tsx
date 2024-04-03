'use client';

import { Button } from '@/components/ui/button';

import {
  SignInButton,
  SignOutButton,
  SignedIn,
  SignedOut,
  useOrganization,
  useSession,
} from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function Home() {
  const { organization } = useOrganization();

  // sends data from frontend to back end
  // data must be same as their first shaped
  const createFile = useMutation(api.files.createFile);
  const files = useQuery(
    api.files.getFiles,
    organization?.id ? { orgId: organization.id } : 'skip'
  );
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
            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
              {file.names}
              {file.orgId}
            </h4>
          </div>
        );
      })}

      <Button
        onClick={(e) => {
          if (!organization) return;
          createFile({
            name: 'Hello',
            orgId: organization?.id,
          });
        }}
        variant="ghost"
      >
        Home Button
      </Button>
    </main>
  );
}
