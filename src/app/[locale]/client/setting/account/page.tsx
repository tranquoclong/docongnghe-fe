import { User, Trash } from 'lucide-react'

export default function Page() {
  return (
    <div className=''>
      <div className='mb-8'>
        <div className='flex items-center justify-between'>
          <div>
            <div className='flex items-center gap-2 mb-2'>
              <h1 className='text-3xl font-bold'>Account Settings</h1>
            </div>
            <p className='text-gray-400 mt-1'>Manage your account preferences and data</p>
          </div>
        </div>
      </div>
      <div className='space-y-8'>
        <div>
          <div className='flex items-center gap-2 mb-4'>
            <User />
            <h2 className='text-lg font-semibold'>Account Information</h2>
          </div>
          <div className='bg-accent text-accent-foreground rounded-lg p-6 space-y-4'>
            <div>
              <label className='text-sm font-medium text-muted-foreground'>Username</label>
              <p className='text-foreground'>Username123</p>
            </div>
            <div>
              <label className='text-sm font-medium text-muted-foreground'>Email</label>
              <p className='text-foreground'>Username123@gmail.com</p>
            </div>
          </div>
        </div>
        <div>
          <h2 className='text-lg font-semibold  mb-2'>Danger Zone</h2>
          <p className='text-sm text-muted-foreground mb-4'>Irreversible and destructive actions</p>
          <div className='flex items-center justify-between p-6 bg-accent text-accent-foreground rounded-lg'>
            <div>
              <h4 className='font-medium'>Delete Account</h4>
              <p className='text-sm text-muted-foreground mt-1'>Permanently delete your account.</p>
            </div>
            <button
              className='inline-flex items-center gap-2 justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:pointer-events-none disabled:opacity-50 bg-red-500/20 text-red-400 hover:bg-red-500/30 h-10 px-4 py-2 ml-4'
              type='button'
              aria-haspopup='dialog'
              aria-expanded='false'
              aria-controls='radix-:rgv:'
              data-state='closed'
            >
              <Trash />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
