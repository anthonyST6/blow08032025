import React from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';
import { 
  BoltIcon, // Energy
  BuildingLibraryIcon, // Government
  ShieldCheckIcon // Insurance
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

export type VerticalType = 'energy' | 'government' | 'insurance';

export interface Vertical {
  id: VerticalType;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

const verticals: Vertical[] = [
  {
    id: 'energy',
    name: 'Energy',
    description: 'Power generation and distribution',
    icon: BoltIcon,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400',
  },
  {
    id: 'government',
    name: 'Government',
    description: 'Public sector and administration',
    icon: BuildingLibraryIcon,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400',
  },
  {
    id: 'insurance',
    name: 'Insurance',
    description: 'Risk assessment and coverage',
    icon: ShieldCheckIcon,
    color: 'text-green-400',
    bgColor: 'bg-green-400',
  },
];

export interface VerticalSelectorProps {
  selectedVertical: VerticalType | null;
  onVerticalChange: (vertical: VerticalType) => void;
  className?: string;
  disabled?: boolean;
}

export const VerticalSelector: React.FC<VerticalSelectorProps> = ({
  selectedVertical,
  onVerticalChange,
  className = '',
  disabled = false,
}) => {
  const selected = selectedVertical 
    ? verticals.find(v => v.id === selectedVertical) 
    : null;

  return (
    <Listbox 
      value={selectedVertical} 
      onChange={onVerticalChange}
      disabled={disabled}
    >
      <div className={clsx('relative', className)}>
        <Listbox.Button className={clsx(
          'relative w-full cursor-pointer rounded-lg',
          'bg-white/10 backdrop-blur-md border border-white/20',
          'py-2 pl-3 pr-10 text-left',
          'focus:outline-none focus-visible:border-seraphim-gold',
          'focus-visible:ring-2 focus-visible:ring-seraphim-gold/50',
          'transition-all duration-200',
          disabled && 'opacity-50 cursor-not-allowed'
        )}>
          <span className="flex items-center">
            {selected ? (
              <>
                <selected.icon className={clsx('h-5 w-5 mr-2', selected.color)} />
                <span className="block truncate text-seraphim-text">
                  {selected.name}
                </span>
              </>
            ) : (
              <span className="block truncate text-seraphim-text-dim">
                Select a vertical...
              </span>
            )}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon
              className="h-5 w-5 text-seraphim-text-dim"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>

        <Transition
          as={React.Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className={clsx(
            'absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg',
            'bg-seraphim-black/95 backdrop-blur-md',
            'border border-white/20 shadow-lg',
            'py-1 text-base',
            'focus:outline-none'
          )}>
            {verticals.map((vertical) => (
              <Listbox.Option
                key={vertical.id}
                className={({ active }) =>
                  clsx(
                    'relative cursor-pointer select-none py-2 pl-10 pr-4',
                    active ? 'bg-white/10 text-seraphim-text' : 'text-seraphim-text-dim'
                  )
                }
                value={vertical.id}
              >
                {({ selected, active }) => (
                  <>
                    <div className="flex items-center">
                      <vertical.icon 
                        className={clsx(
                          'h-5 w-5 mr-3',
                          selected ? vertical.color : 'text-gray-400'
                        )} 
                      />
                      <div>
                        <span className={clsx(
                          'block truncate',
                          selected ? 'font-medium' : 'font-normal'
                        )}>
                          {vertical.name}
                        </span>
                        <span className="block text-xs text-seraphim-text-dim">
                          {vertical.description}
                        </span>
                      </div>
                    </div>
                    {selected ? (
                      <span className={clsx(
                        'absolute inset-y-0 left-0 flex items-center pl-3',
                        vertical.color
                      )}>
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};

export default VerticalSelector;