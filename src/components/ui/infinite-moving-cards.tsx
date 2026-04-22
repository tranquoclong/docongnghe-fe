'use client'

import { cn } from '@/lib/utils'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'

export const InfiniteMovingCards = ({
  items,
  direction = 'left',
  speed = 'fast',
  pauseOnHover = true,
  className,
  logo = false
}: {
  items: {
    image: string
    // quote: string
    // name: string
    // title: string
  }[]
  direction?: 'left' | 'right'
  speed?: 'fast' | 'normal' | 'slow' | 'superSlow'
  pauseOnHover?: boolean
  className?: string
  logo?: boolean
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const scrollerRef = React.useRef<HTMLUListElement>(null)

  useEffect(() => {
    addAnimation()
  }, [])
  const [start, setStart] = useState(false)
  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children)

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true)
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem)
        }
      })

      getDirection()
      getSpeed()
      setStart(true)
    }
  }
  const getDirection = () => {
    if (containerRef.current) {
      if (direction === 'left') {
        containerRef.current.style.setProperty('--animation-direction', 'forwards')
      } else {
        containerRef.current.style.setProperty('--animation-direction', 'reverse')
      }
    }
  }
  const getSpeed = () => {
    if (containerRef.current) {
      if (speed === 'fast') {
        containerRef.current.style.setProperty('--animation-duration', '20s')
      } else if (speed === 'normal') {
        containerRef.current.style.setProperty('--animation-duration', '40s')
      } else if (speed === 'slow') {
        containerRef.current.style.setProperty('--animation-duration', '80s')
      } else if (speed === 'superSlow') {
        containerRef.current.style.setProperty('--animation-duration', '100s')
      }
    }
  }
  return (
    <div
      ref={containerRef}
      className={cn(
        'scroller relative z-20 py-5 overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]',
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          'flex w-max min-w-full shrink-0 flex-nowrap gap-4 py-4',
          start && 'animate-scroll',
          pauseOnHover && 'hover:[animation-play-state:paused]'
        )}
      >
        {items.map((item, idx) => (
          <li
            className={cn(
              'relative shrink-0',
              logo
                ? 'flex items-center justify-center h-[44px] md:h-[54px] px-4 bg-white border border-gray-200 dark:border-gray-100/20 rounded-xl shadow-sm'
                : 'w-[350px] h-[200px] md:w-[450px] md:h-[230px] overflow-hidden rounded-2xl'
            )}
            key={idx}
          >
            {logo ? (
              <Image
                src={item.image}
                width={120}
                height={40}
                quality={85}
                priority={true}
                alt='Logo'
                className='h-[32px] md:h-[40px] w-auto object-contain'
              />
            ) : (
              <Image
                src={item.image}
                fill
                quality={85}
                priority={true}
                alt='Banner'
                className='object-cover'
                sizes='(max-width: 768px) 350px, 450px'
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
