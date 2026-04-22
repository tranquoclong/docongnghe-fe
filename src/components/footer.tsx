import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { FacebookIcon, GithubIcon, InstagramIcon, LinkedinIcon, TwitterIcon, YoutubeIcon } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  const company = [
    {
      title: 'About Us',
      href: '#'
    },
    {
      title: 'Careers',
      href: '#'
    },
    {
      title: 'Brand assets',
      href: '#'
    },
    {
      title: 'Privacy Policy',
      href: '#'
    },
    {
      title: 'Terms of Service',
      href: '#'
    }
  ]

  const resources = [
    {
      title: 'Blog',
      href: '#'
    },
    {
      title: 'Help Center',
      href: '#'
    },
    {
      title: 'Contact Support',
      href: '#'
    },
    {
      title: 'Community',
      href: '#'
    },
    {
      title: 'Security',
      href: '#'
    }
  ]

  const socialLinks = [
    {
      icon: <FacebookIcon className='size-6' />,
      link: '#'
    },
    {
      icon: <GithubIcon className='size-6' />,
      link: '#'
    },
    {
      icon: <InstagramIcon className='size-6' />,
      link: '#'
    },
    {
      icon: <LinkedinIcon className='size-6' />,
      link: '#'
    },
    {
      icon: <TwitterIcon className='size-6' />,
      link: '#'
    },
    {
      icon: <YoutubeIcon className='size-6' />,
      link: '#'
    }
  ]
  return (
    <footer className='relative'>
      <div className='bg-[radial-gradient(35%_80%_at_30%_0%,--theme(--color-foreground/.1),transparent)] mx-auto max-w-4xl md:border-x'>
        <div className='bg-border absolute inset-x-0 h-px w-full' />
        <div className='grid max-w-4xl grid-cols-6 gap-6 p-4'>
          <div className='col-span-6 flex flex-col gap-5 md:col-span-4'>
            <Link href='#' className='w-max'>
              <Image src='/logo.png' width={50} height={50} quality={85} priority={true} alt='logo' sizes='100vw' />
            </Link>
            <p className='text-muted-foreground max-w-sm text-sm'>ĐĂNG KÝ NHẬN TIN KHUYẾN MÃI</p>
            <div className='flex gap-2'>
              {socialLinks.map((item, i) => (
                <Link key={i} className='hover:bg-accent rounded-md border p-1.5' href={item.link}>
                  {item.icon}
                </Link>
              ))}
            </div>
          </div>
          <div className='col-span-3 w-full md:col-span-1'>
            <span className='text-muted-foreground mb-1 text-xs'>Resources</span>
            <div className='flex flex-col gap-1'>
              {resources.map(({ href, title }, i) => (
                <a key={i} className={`w-max py-1 text-sm duration-200 hover:underline`} href={href}>
                  {title}
                </a>
              ))}
            </div>
          </div>
          <div className='col-span-3 w-full md:col-span-1'>
            <span className='text-muted-foreground mb-1 text-xs'>Company</span>
            <div className='flex flex-col gap-1'>
              {company.map(({ href, title }, i) => (
                <Link key={i} className={`w-max py-1 text-sm duration-200 hover:underline`} href={href}>
                  {title}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className='bg-border absolute inset-x-0 h-px w-full' />
        <div className='flex max-w-4xl flex-col justify-between gap-2 pt-2 pb-5'>
          <p className='text-muted-foreground text-center'>
            © <a href='https://x.com/sshahaider'>Đỏ công nghệ</a>. All rights reserved {year}
          </p>
        </div>
      </div>
    </footer>
  )
}
