'use client';

import { Button } from '@/components/ui/button';

import { useOrganization, useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function Home() {
  const organization = useOrganization();
  const user = useUser();
  let orgId: string | undefined = undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization?.organization?.id || user?.user?.id;
  }

  // sends data from frontend to back end
  // data must be same as their first shaped
  const files = useQuery(api.files.getFiles, orgId ? { orgId } : 'skip');
  const createFile = useMutation(api.files.createFile);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      {files?.map((file) => {
        return (
          <div key={file._id}>
            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
              {file.name}
            </h4>
          </div>
        );
      })}

      <Button
        onClick={(e) => {
          console.log(user);
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
