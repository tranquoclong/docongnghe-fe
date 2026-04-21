'use client'

import { GlowingEffect } from '@/components/ui/glowing-effect'
import Image from 'next/image'
export default function About() {
  return (
    <section className='py-16 px-4 md:px-8 bg-muted/30'>
      <ul className='grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2'>
        <GridItem
          area='md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/8]'
          image='https://cdn2.cellphones.com.vn/insecure/rs:fill:690:300/q:100/plain/https://dashboard.cellphones.com.vn/storage/apple-chinh-hang-home.jpg'
        />

        <GridItem
          area='md:[grid-area:1/7/2/13] xl:[grid-area:2/1/2/6]'
          image='https://cdn2.cellphones.com.vn/insecure/rs:fill:690:300/q:100/plain/https://dashboard.cellphones.com.vn/storage/SIS%20asus.png'
        />

        <GridItem
          area='md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]'
          image='https://cdn2.cellphones.com.vn/insecure/rs:fill:690:300/q:100/plain/https://dashboard.cellphones.com.vn/storage/gian-hang-samsung-home.png'
        />

        <GridItem
          area='md:[grid-area:2/1/3/7] xl:[grid-area:2/6/2/13]'
          image='https://cdn2.cellphones.com.vn/insecure/rs:fill:690:300/q:100/plain/https://dashboard.cellphones.com.vn/storage/xiaomi.png'
        />
      </ul>
    </section>
  )
}

interface GridItemProps {
  area: string
  image: string
}

const GridItem = ({ area, image }: GridItemProps) => {
  return (
    <li className={`min-h-[14rem] list-none ${area}`}>
      <div className='relative h-full rounded-2xl border p-2 md:rounded-3xl md:p-3'>
        <GlowingEffect
          blur={2}
          borderWidth={3}
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
        />
        <div className='border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6 dark:shadow-[0px_0px_27px_0px_#2D2D2D]'>
          <Image
            src={image}
            width={200}
            height={100}
            quality={85}
            priority={true}
            alt='Banner'
            className='absolute top-0 left-0 w-full h-full object-cover rounded-2xl'
            sizes='100vw'
          />
        </div>
      </div>
    </li>
  )
}
