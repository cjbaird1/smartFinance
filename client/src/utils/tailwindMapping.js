// CSS to Tailwind mapping for gradual migration
export const CSS_TO_TAILWIND = {
  // Background colors
  'background-color: var(--bg-main)': 'bg-bg-main',
  'background-color: var(--bg-panel)': 'bg-bg-panel',
  'background-color: var(--bg-sidebar)': 'bg-bg-sidebar',
  
  // Text colors
  'color: var(--text-main)': 'text-text-main',
  'color: var(--text-muted)': 'text-text-muted',
  'color: var(--accent)': 'text-accent',
  
  // Borders
  'border: 1px solid var(--border)': 'border border-border',
  'border-color: var(--border)': 'border-border',
  
  // Spacing
  'padding: 24px': 'p-6',
  'padding: 16px': 'p-4',
  'padding: 12px': 'p-3',
  'padding: 8px': 'p-2',
  'margin: 24px': 'm-6',
  'margin: 16px': 'm-4',
  'margin: 12px': 'm-3',
  'margin: 8px': 'm-2',
  
  // Border radius
  'border-radius: var(--radius)': 'rounded-radius',
  'border-radius: 6px': 'rounded-md',
  'border-radius: 8px': 'rounded-lg',
  
  // Box shadow
  'box-shadow: var(--shadow)': 'shadow-shadow',
  
  // Font sizes
  'font-size: 14px': 'text-sm',
  'font-size: 16px': 'text-base',
  'font-size: 18px': 'text-lg',
  'font-size: 20px': 'text-xl',
  'font-size: 24px': 'text-2xl',
  
  // Font weights
  'font-weight: 600': 'font-semibold',
  'font-weight: 700': 'font-bold',
  
  // Display
  'display: flex': 'flex',
  'display: grid': 'grid',
  'display: none': 'hidden',
  
  // Flexbox
  'justify-content: center': 'justify-center',
  'justify-content: space-between': 'justify-between',
  'align-items: center': 'items-center',
  'flex-direction: column': 'flex-col',
  
  // Grid
  'grid-template-columns: 1fr 1fr': 'grid-cols-2',
  'grid-template-columns: 1fr': 'grid-cols-1',
  'gap: 16px': 'gap-4',
  'gap: 12px': 'gap-3',
  'gap: 8px': 'gap-2',
  
  // Width/Height
  'width: 100%': 'w-full',
  'height: 100%': 'h-full',
  'min-width: 200px': 'min-w-[200px]',
  'max-width: 1400px': 'max-w-[1400px]',
  
  // Position
  'position: relative': 'relative',
  'position: absolute': 'absolute',
  'position: fixed': 'fixed',
  
  // Overflow
  'overflow: auto': 'overflow-auto',
  'overflow: hidden': 'overflow-hidden',
  'overflow-y: auto': 'overflow-y-auto',
  
  // Z-index
  'z-index: 1000': 'z-[1000]',
  'z-index: 10': 'z-10',
};

// Common component patterns
export const COMPONENT_PATTERNS = {
  // Card pattern
  card: 'bg-bg-panel border border-border rounded-radius p-6 shadow-shadow',
  
  // Button pattern
  button: 'px-4 py-2 bg-accent text-white rounded-md font-semibold hover:bg-accent-hover transition-colors',
  
  // Input pattern
  input: 'px-3 py-2 bg-bg-main border border-border rounded-md text-text-main focus:outline-none focus:border-accent',
  
  // Modal pattern
  modal: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]',
  
  // Table pattern
  table: 'w-full border-collapse',
  tableHeader: 'bg-bg-panel text-text-main font-semibold p-4 border-b border-border',
  tableCell: 'p-4 border-b border-border text-text-main',
}; 