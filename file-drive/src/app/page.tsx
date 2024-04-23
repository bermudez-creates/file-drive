'use client';

import { useOrganization, useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

import { UploadButton } from './upload-button';
import { FileCard } from './file-card';
import Image from 'next/image';
import { FileIcon, Loader, StarIcon } from 'lucide-react';
import { SearchBar } from './search-bar';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function Placeholder() {
  return (
    <div className="flex flex-col gap-8 items-center mt-20">
      <Image
        alt="Image of a physical file upload."
        width={300}
        height={300}
        src="/empty.svg"
      />
      <h2 className="text-2xl font-semibold text-purple-700">
        No files to display, begin uploading!
      </h2>
      <UploadButton />
    </div>
  );
}

export default function Home() {
  const organization = useOrganization();
  const user = useUser();
  const [query, setQuery] = useState('');

  let orgId: string | undefined = undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization?.organization?.id || user?.user?.id;
  }
  // sends data from frontend to back end
  // data must be same as their first shaped
  const files = useQuery(api.files.getFiles, orgId ? { orgId, query } : 'skip');
  const isLoading = files === undefined;

  return (
    <main className="container max-auto pt-12">
      <div className="flex gap-8">
        <div className="w-40 flex flex-col gap-4">
          <Link href="/dashboard/files">
            <Button variant="link" className="flex gap-2">
              <FileIcon /> All Files
            </Button>
          </Link>

          <Link href="/dashboard/favorites">
            <Button variant="link" className="flex gap-2">
              <StarIcon /> Your Favorites
            </Button>
          </Link>
        </div>
        <div className="w-full">
          {isLoading && (
            <div className="flex flex-col gap-8 items-center mt-20">
              <Loader className="h-30 w-30 animate-spin" />
              <div className="text-xl">Loading homepage...</div>
            </div>
          )}

          {!isLoading && (
            <>
              <div className="flex justify-between items-center mb-7">
                <h1 className="text-4xl font-bold">Files</h1>
                <SearchBar query={query} setQuery={setQuery} />
                <UploadButton />
              </div>

              {files.length === 0 && <Placeholder />}

              <div className="grid grid-cols-3 gap-4">
                {files?.map((file) => {
                  return <FileCard key={file._id} file={file} />;
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
