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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { useOrganization, useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

const formSchema = z.object({
  title: z.string().min(1).max(200),
  file: z
    .custom<FileList>((val) => val instanceof FileList, 'Required')
    .refine((files) => files.length > 0, 'Required'),
});

export default function Home() {
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
    console.log(values.file);
    const postUrl = await generateUploadUrl();

    const result = await fetch(postUrl, {
      method: 'POST',
      headers: { 'Content-Type': values.file[0]!.type },
      body: values.file[0],
    });
    const { storageId } = await result.json();

    await createFile({
      name: values.title,
      fileId: storageId,
      orgId,
    });

    form.reset();
    setFormDialogOpen(false);
    toast({
      variant: 'success',
      title: 'File Uploaded',
      description: 'Thanks for using our app, files are available for sharing!',
    });
  }

  let orgId: string | undefined = undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization?.organization?.id || user?.user?.id;
  }
  // sends data from frontend to back end
  // data must be same as their first shaped
  const files = useQuery(api.files.getFiles, orgId ? { orgId } : 'skip');
  const createFile = useMutation(api.files.createFile);

  return (
    <main className="container max-auto pt-12">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Files</h1>
        <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={(e) => {}}>Upload File</Button>
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
                    <Button type="submit">Submit</Button>
                  </form>
                </Form>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>

      {files?.map((file) => {
        return <div key={file._id}>{file.name}</div>;
      })}
    </main>
  );
}
