import {
  BookOpen,
  DeviceMobile,
  ForkKnife,
  Info,
  Package,
  Palette,
  TShirt,
  Wrench,
} from '@phosphor-icons/react/ssr'
import { getCategory } from '@/lib/categories'

export default function CategoryIcon({ category, className = 'h-4 w-4' }: { category: string; className?: string }) {
  const props = { className, size: 18, weight: 'regular' as const, 'aria-hidden': true as const }

  switch (getCategory(category)?.icon) {
    case 'book':
      return <BookOpen {...props} />
    case 'food':
      return <ForkKnife {...props} />
    case 'tools':
      return <Wrench {...props} />
    case 'shirt':
      return <TShirt {...props} />
    case 'device':
      return <DeviceMobile {...props} />
    case 'art':
      return <Palette {...props} />
    case 'box':
      return <Package {...props} />
    default:
      return <Info {...props} />
  }
}
