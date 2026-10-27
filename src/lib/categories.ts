export const CATEGORIES = [
  { value: 'Textbooks', icon: 'book', tone: 'blue' },
  { value: 'Food', icon: 'food', tone: 'sky' },
  { value: 'Services', icon: 'tools', tone: 'navy' },
  { value: 'Apparel', icon: 'shirt', tone: 'ice' },
  { value: 'Electronics', icon: 'device', tone: 'deep' },
  { value: 'Art', icon: 'art', tone: 'frost' },
  { value: 'Other', icon: 'box', tone: 'slate' },
] as const

export type CategoryValue = (typeof CATEGORIES)[number]['value']
export type CategoryTone = (typeof CATEGORIES)[number]['tone']

export function getCategory(value: string | null | undefined) {
  return CATEGORIES.find((category) => category.value === value)
}

export function getCategoryToneClasses(tone: CategoryTone) {
  switch (tone) {
    case 'blue':
      return { soft: 'bg-indigo-50 text-indigo-800 border-indigo-200', solid: 'bg-indigo-600 text-white', canvas: 'bg-[#faf9ff]' }
    case 'sky':
      return { soft: 'bg-orange-50 text-orange-800 border-orange-200', solid: 'bg-orange-600 text-white', canvas: 'bg-[#fffaf5]' }
    case 'navy':
      return { soft: 'bg-teal-50 text-teal-800 border-teal-200', solid: 'bg-teal-700 text-white', canvas: 'bg-[#f7fcfa]' }
    case 'ice':
      return { soft: 'bg-rose-50 text-rose-800 border-rose-200', solid: 'bg-rose-600 text-white', canvas: 'bg-[#fff9f9]' }
    case 'deep':
      return { soft: 'bg-sky-50 text-sky-800 border-sky-200', solid: 'bg-sky-600 text-white', canvas: 'bg-[#f7fbff]' }
    case 'frost':
      return { soft: 'bg-violet-50 text-violet-800 border-violet-200', solid: 'bg-violet-600 text-white', canvas: 'bg-[#fbf9ff]' }
    case 'slate':
      return { soft: 'bg-slate-50 text-slate-700 border-slate-200', solid: 'bg-slate-700 text-white', canvas: 'bg-[#f9fafc]' }
  }
}