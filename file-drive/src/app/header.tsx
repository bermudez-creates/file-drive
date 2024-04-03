import { OrganizationSwitcher, UserButton } from '@clerk/nextjs';

export function Header() {
  return (
    <div className="border-b p-4 bg-purple-200">
      <div className="items-center container mx-auto justify-between flex mt-2">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          FileDrive
        </h2>{' '}
        <div className="flex gap-2">
          <OrganizationSwitcher />
          <UserButton />
        </div>
      </div>
    </div>
  );
}
