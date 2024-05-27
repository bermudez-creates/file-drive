'use client';

import { useQuery } from 'convex/react';
import FilesBrowser from '../_components/file-browser';
import { api } from '../../../../convex/_generated/api';

export default function TrashPage() {
  return (
    <div>
      <FilesBrowser title="Trashcan" deletedOnly />
    </div>
  );
}
