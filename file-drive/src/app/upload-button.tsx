'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { useOrganization, useUser } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Loader } from 'lucide-react';
import { Doc } from '../../convex/_generated/dataModel';

const formSchema = z.object({
  title: z.string().min(1).max(200),
  file: z
    .custom<FileList>((val) => val instanceof FileList, 'Required')
    .refine((files) => files.length > 0, 'Required'),
});

export function UploadButton() {
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const organization = useOrganization();
  const user = useUser();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      file: undefined,
    },
  });

  const fileRef = form.register('file');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!orgId) return;

    const postUrl = await generateUploadUrl();

    const fileType = values.file[0].type;

    const result = await fetch(postUrl, {
      method: 'POST',
      headers: { 'Content-Type': fileType },
      body: values.file[0],
    });
    const { storageId } = await result.json();

    const types = {
      'image/png': 'image',
      'application/pdf': 'pdf',
      'text/csv': 'csv',
    } as Record<string, Doc<'files_table'>['type']>;

    try {
      await createFile({
        name: values.title,
        fileId: storageId,
        orgId,
        type: types[fileType],
      });

      form.reset();
      setFormDialogOpen(false);
      toast({
        variant: 'success',
        title: 'File Uploaded',
        description:
          'Thanks for using our app, files are available for sharing!',
      });
    } catch (error) {
      form.reset();
      setFormDialogOpen(false);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'Oh no! Something went wrong, please try again later.',
      });
    }
  }

  let orgId: string | undefined = undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization?.organization?.id || user?.user?.id;
  }
  // sends data from frontend to back end
  // data must be same as their first shaped
  const createFile = useMutation(api.files.createFile);

  return (
    <Dialog
      open={formDialogOpen}
      onOpenChange={(isOpen) => {
        setFormDialogOpen(isOpen);
        form.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>Upload File</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-8">FileDrive Upload</DialogTitle>
          <DialogDescription>
            {/* Form for File Title */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8 pb-5"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="file name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
            {/* Form to upload a File */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8 cursor-pointer"
              >
                <FormField
                  control={form.control}
                  name="file"
                  render={() => (
                    <FormItem>
                      <FormLabel className="cursor-pointer">
                        Choose a file
                      </FormLabel>
                      <FormControl>
                        <Input type="file" {...fileRef} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="flex gap-1"
                >
                  {form.formState.isSubmitting && (
                    <Loader className="h-4 w-4 animate-spin" />
                  )}
                  Submit
                </Button>
              </form>
            </Form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
