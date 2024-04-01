import Image from 'next/image';
import { Button, buttonVariants } from '@/components/ui/button';
import { Link } from 'lucide-react';

export default function Home() {
  return (
    <Button variant="destructive">
      Home Button
      <Link className={buttonVariants({ variant: 'ghost' })}>Click here</Link>
    </Button>
  );
}
