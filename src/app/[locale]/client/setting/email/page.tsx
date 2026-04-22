export default function Page() {
  return (
    <div className=''>
      <div className='mb-8'>
        <div className='flex items-center justify-between'>
          <div>
            <div className='flex items-center gap-2 mb-2'>
              <h1 className='text-3xl font-bold'>Email Settings</h1>
            </div>
            <p className='text-gray-400 mt-1'>Manage your email and notification preferences</p>
          </div>
        </div>
      </div>
      <div className='rounded-lg border bg-card text-card-foreground shadow-sm'>
        <div className='p-6'>
          <h3 className='font-medium leading-none'>Email notifications include:</h3>
          <div className='mt-4 space-y-4'>
            <div className='flex items-center gap-3'>
              <div className=' h-2 w-2 rounded-full bg-primary' />
              <div className='text-sm text-muted-foreground'>
                <span className='font-medium text-foreground'>Post reviews</span> - Get notified when your posts are
                reviewed by our curators
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <div className=' h-2 w-2 rounded-full bg-primary' />
              <div className='text-sm text-muted-foreground'>
                <span className='font-medium text-foreground'>Comments</span> - Stay updated when someone comments on
                your posts
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <div className=' h-2 w-2 rounded-full bg-primary' />
              <div className='text-sm text-muted-foreground'>
                <span className='font-medium text-foreground'>New challenges</span> - Discover exciting new challenges
                that match your interests
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <div className=' h-2 w-2 rounded-full bg-primary' />
              <div className='text-sm text-muted-foreground'>
                <span className='font-medium text-foreground'>Social media features</span> - Know when we share your
                amazing work on our social media
              </div>
            </div>
          </div>
        </div>
      </div>
      <form className='space-y-6 mt-6' data-discover='true'>
        <div className='space-y-2'>
          <label
            className='text-sm text-gray-200 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
            htmlFor='email'
          >
            Email address
          </label>
          <input
            type='email'
            className='flex h-9 w-full rounded-md border-2 border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 max-w-[300px]'
            id='email'
            name='email'
            placeholder='Enter your email address'
            defaultValue='email@gmail.com'
          />
          <p className='text-xs text-muted-foreground mt-2'>
            We respect your privacy and will never share your email with third parties or send you marketing emails.
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <button
            type='button'
            role='switch'
            aria-checked='true'
            data-state='checked'
            value='on'
            className='peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input'
            id='emailNotifications'
          >
            <span
              data-state='checked'
              className='pointer-events-none block h-5 w-5 rounded-full bg-gray-100 shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
            />
          </button>
          <input
            type='checkbox'
            aria-hidden='true'
            name='emailNotifications'
            tabIndex={-1}
            defaultValue='on'
            style={{
              transform: 'translateX(-100%)',
              position: 'absolute',
              pointerEvents: 'none',
              opacity: 0,
              margin: 0,
              width: 44,
              height: 24
            }}
          />
          <label
            className='text-sm text-gray-200 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
            htmlFor='emailNotifications'
          >
            Receive email notifications
          </label>
        </div>
        <button
          className='inline-flex items-center gap-2 justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2'
          type='submit'
        >
          Save changes
        </button>
      </form>
    </div>
  )
}
