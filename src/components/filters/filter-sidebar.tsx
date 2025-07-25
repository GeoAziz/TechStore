import React, { useState } from 'react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

const filters = [
  { label: 'Category', options: ['Laptops', 'Phones', 'Accessories'] },
  { label: 'Brand', options: ['Zizo', 'Techno', 'Verse'] },
  { label: 'Price', options: ['< $500', '$500-$1000', '> $1000'] },
];

interface FilterSidebarProps {
  selected: string[];
  onChange: (option: string) => void;
  mobile?: boolean;
  onMobileToggle?: () => void;
}

export default function FilterSidebar({
  selected,
  onChange,
  mobile = false,
  onMobileToggle,
}: FilterSidebarProps) {
  const [open, setOpen] = useState(true);
  return (
    <aside className={`w-64 bg-glass rounded-xl shadow-neon p-4 ${mobile ? 'fixed top-0 left-0 h-full z-40' : ''}`}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button className="mb-2 text-neon-blue font-bold w-full" onClick={() => setOpen(!open)}>
            {open ? 'Hide Filters' : 'Show Filters'}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div>
            {filters.map(f => (
              <div key={f.label} className="mb-4">
                <h3 className="font-bold text-neon-violet mb-2">{f.label}</h3>
                <div className="flex flex-wrap gap-2">
                  {f.options.map(opt => (
                    <button
                      key={opt}
                      className={`chip ${selected.includes(opt) ? 'chip-active' : ''}`}
                      onClick={() => onChange(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
      {/* Active filter chips */}
      {selected.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {selected.map(chip => (
            <span key={chip} className="chip chip-active">
              {chip}
              <button className="ml-1 text-xs" onClick={() => onChange(chip)}>&times;</button>
            </span>
          ))}
        </div>
      )}
      {/* Mobile drawer toggle */}
      {mobile && (
        <button className="absolute top-2 right-2 text-neon-violet" onClick={onMobileToggle}>Close</button>
      )}
    </aside>
  );
}
