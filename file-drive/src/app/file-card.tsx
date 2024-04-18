import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Doc } from '../../convex/_generated/dataModel';
import { Button } from '@/components/ui/button';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FileTextIcon,
  GanttChartIcon,
  ImageIcon,
  ListX,
  Trash2Icon,
} from 'lucide-react';
import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ReactNode, useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';

export function FileCardActions({ file }: { file: Doc<'files_table'> }) {
  const deleteFile = useMutation(api.files.deleteFile);
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <>
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              file and remove the data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await deleteFile({
                  fileId: file._id,
                });

                toast({
                  variant: 'delete',
                  title: 'File Deleted',
                  description:
                    'Your file was successfully removed from the server',
                });
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <ListX />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => setConfirmDelete(true)}
            className="flex gap-1 text-red-500 items-center cursor-pointer"
          >
            <Trash2Icon className="w-4 h-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

// function getFileUrl(fileId: <Doc>"files_table">["_id"]): string {

// }

export function FileCard({ file }: { file: Doc<'files_table'> }) {
  const typeIcons = {
    image: <ImageIcon />,
    pdf: <FileTextIcon />,
    csv: <GanttChartIcon />,
  } as Record<Doc<'files_table'>['type'], ReactNode>;

  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle className="flex gap-2">
          <div className="flex justify-center">
            {' '}
            <p>{typeIcons[file.type]}</p>
          </div>
          {file.name}
        </CardTitle>
        <div className="absolute top-2 right-2 text-red-300">
          <FileCardActions file={file} />
        </div>
        {/* <CardDescription>Card Description</CardDescription> */}
      </CardHeader>
      <CardContent>
        {file.type === 'image' && (
          <Image alt={file.name} width={200} height={200} src="" />
        )}
      </CardContent>
      <CardFooter>
        <Button>Download</Button>
      </CardFooter>
    </Card>
  );
}
