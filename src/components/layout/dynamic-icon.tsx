import { Clock, House, Tv, Computer, Laptop, Smartphone, Headphones, Plug, Shirt } from 'lucide-react'

interface IconProps {
  name: string
}

export default function DynamicIcon({ name }: IconProps) {
  const icons: Record<string, React.ElementType> = {
    Clock,
    House,
    Tv,
    Computer,
    Laptop,
    Smartphone,
    Headphones,
    Plug,
    Shirt
  }

  const IconComponent = icons[name]

  return IconComponent ? <IconComponent /> : <div>?</div>
}
