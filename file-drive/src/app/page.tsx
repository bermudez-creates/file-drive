'use client';

import { Button } from '@/components/ui/button';

import {
  SignInButton,
  SignOutButton,
  SignedIn,
  SignedOut,
  useOrganization,
  useSession,
  useUser,
} from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function Home() {
  const organization = useOrganization();
  const user = useUser();
  let orgId: string | undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization?.organization?.id || user?.user?.id;
  }

  // sends data from frontend to back end
  // data must be same as their first shaped
  const createFile = useMutation(api.files.createFile);
  const files = useQuery(api.files.getFiles, orgId ? { orgId } : 'skip');

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
            </h4>
          </div>
        );
      })}

      <Button
        onClick={(e) => {
          console.log(organization);
          if (!orgId) return;

          createFile({
            name: 'Hello',
            orgId,
          });
        }}
        variant="ghost"
      >
        Home Button
      </Button>
    </main>
  );
}
