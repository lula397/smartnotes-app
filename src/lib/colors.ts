// Color scheme for note categories with semantic meaning
export const categoryColors = {
  Work: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-gray-900',
    badge: 'bg-blue-100 text-gray-900',
    hover: 'hover:bg-blue-100'
  },
  Personal: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-gray-900',
    badge: 'bg-purple-100 text-gray-900',
    hover: 'hover:bg-purple-100'
  },
  Ideas: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-gray-900',
    badge: 'bg-green-100 text-gray-900',
    hover: 'hover:bg-green-100'
  },
  Tasks: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-gray-900',
    badge: 'bg-amber-100 text-gray-900',
    hover: 'hover:bg-amber-100'
  },
  Other: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-900',
    badge: 'bg-gray-100 text-gray-900',
    hover: 'hover:bg-gray-100'
  }
} as const;