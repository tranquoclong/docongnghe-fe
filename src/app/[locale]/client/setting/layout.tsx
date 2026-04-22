import SettingNav from './setting-nav'

export default async function Layout(
  props: Readonly<{
    children: React.ReactNode
    params: Promise<{ locale: string }>
  }>
) {
  const params = await props.params

  const { locale } = params

  const { children } = props

  return (
    <div className="px-5 py-0 data-[path='/']:px-0 root-container relative flex">
      <SettingNav />
      <div className='w-full min-w-0 z-10'>
        <main className='w-full'>{children}</main>
      </div>
    </div>
  )
}
