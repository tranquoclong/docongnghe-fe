import { Link } from '@/i18n/routing'
import { Store, MapPin, Phone, Mail, Clock } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className='w-full border-t bg-muted/30'>
      <div className='p-6 text-center text-sm text-muted-foreground'>
        © {currentYear} Đỏ công nghệ. All rights reserved.
      </div>
    </footer>
  )
}
