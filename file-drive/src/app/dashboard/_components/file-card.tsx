import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Doc, Id } from '../../../../convex/_generated/dataModel';
import { Button } from '@/components/ui/button';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  FileTextIcon,
  GanttChartIcon,
  ImageIcon,
  List,
  StarsIcon,
  Trash2Icon,
  Undo2Icon,
} from 'lucide-react';
import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import { Protect } from '@clerk/nextjs';

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
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';

export function FileCardActions({
  file,
  isFavorited,
}: {
  file: Doc<'files_table'>;
  isFavorited: boolean;
}) {
  const deleteFile = useMutation(api.files.deleteFile);
  const restoreFile = useMutation(api.files.restoreFile);
  const toggleFavorite = useMutation(api.files.toggleFavorite);
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <>
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will mark this file to be deleted. This will place
              your file in the trashcan you can retrieve the file or remove the
              data from our servers.
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
                  title: 'File In Trashcan',
                  description:
                    'Your file was successfully placed in the trashccan',
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
          <List />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => {
              toggleFavorite({
                fileId: file._id,
              });

              toast({
                variant: 'success',
                title: 'Toggled favorites',
                description: 'File was added or removed from your favorites',
              });
            }}
            className="flex gap-1 text-blue-500 items-center cursor-pointer"
          >
            {isFavorited ? (
              <div className="flex gap-1 text-green-500 items-center cursor-pointer">
                <StarsIcon className="w-4 h-4 text-green-500 " /> Remove from
                favorites
              </div>
            ) : (
              <div className="flex gap-1 items-center cursor-pointer">
                <StarsIcon className="w-4 h-4" /> Add to favorites
              </div>
            )}
          </DropdownMenuItem>

          <Protect role="org:admin" fallback={<></>}>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                if (file.shouldDelete) {
                  restoreFile({
                    fileId: file._id,
                  });
                } else {
                  setConfirmDelete(true);
                }
              }}
              className="flex gap-1 items-center cursor-pointer"
            >
              {file.shouldDelete ? (
                <div className="flex gap-1 text-green-500 items-center cursor-pointer">
                  <Undo2Icon className="w-4 h-4" /> Restore
                </div>
              ) : (
                <div className="flex gap-1 text-red-500 items-center cursor-pointer">
                  <Trash2Icon className="w-4 h-4" /> Delete
                </div>
              )}
            </DropdownMenuItem>
          </Protect>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

// function Image({ message }: { message: { url: string } }) {
//   return <img src={message.url} height="300px" width="auto" />;
// }

function getFileUrl(fileId: Id<'_storage'>): string {
  return `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${fileId}`;
  // return value returns storage id instead of actual link to URL image like below value:
  // return `https://animated-mastiff-177.convex.cloud/api/storage/849e2b2c-92df-4d4a-ad01-f987eaa94979`;
}

export function FileCard({
  file,
  favorites,
}: {
  file: Doc<'files_table'>;
  favorites: Doc<'favorites'>[];
}) {
  // & { isFavorited: boolean; url: string | null };
  // const userProfile = useQuery(api.files.getUserProfile), {
  //   userId: file.userId,
  // });

  const typeIcons = {
    image: <ImageIcon />,
    pdf: <FileTextIcon />,
    csv: <GanttChartIcon />,
  } as Record<Doc<'files_table'>['type'], ReactNode>;

  const isFavorited = favorites.some(
    (favorite) => favorite.fileId === file._id
  );

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
          <FileCardActions isFavorited={isFavorited} file={file} />
        </div>
        {/* <CardDescription>Card Description</CardDescription> */}
      </CardHeader>
      <CardContent className="h-[200px] flex justify-center items-center">
        {file.type === 'image' && (
          <Image
            alt={file.name}
            width={200}
            height={200}
            src={getFileUrl(file.fileId)}
          />
        )}

        {file.type === 'csv' && <GanttChartIcon className="w-20 h-20" />}
        {file.type === 'pdf' && <FileTextIcon className="w-20 h-20" />}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button
          onClick={() => {
            window.open(getFileUrl(file.fileId), '_blank');
          }}
        >
          Download
        </Button>
      </CardFooter>
    </Card>
  );
}
