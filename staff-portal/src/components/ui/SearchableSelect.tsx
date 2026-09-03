import React, { useState } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search options...',
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedOption = options.find((o) => o.value === value) || options[0];

  const filteredOptions = options.filter((o) => {
    const q = searchQuery.toLowerCase();
    return (
      o.label.toLowerCase().includes(q) ||
      o.value.toLowerCase().includes(q) ||
      (o.description && o.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-left flex items-center justify-between font-bold text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors shadow-2xs ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <div className="flex items-center space-x-2.5 truncate pr-2">
          {selectedOption?.icon}
          <div>
            <span className="text-xs font-extrabold block truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            {selectedOption?.description && (
              <span className="text-[10px] text-slate-400 font-medium block truncate">
                {selectedOption.description}
              </span>
            )}
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-[#121824] rounded-xl shadow-2xl p-2.5 z-50 animate-fade-in space-y-2 border border-slate-100 dark:border-slate-800">
          {/* In-built Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-8 pr-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Filtered Options List */}
          <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400 font-medium">No matching options found</div>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className={`w-full p-2.5 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-lg transition-colors ${
                    opt.value === value
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold'
                      : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    {opt.icon}
                    <div>
                      <span className="text-xs font-bold block">{opt.label}</span>
                      {opt.description && (
                        <span className="text-[10px] text-slate-400 font-medium block">{opt.description}</span>
                      )}
                    </div>
                  </div>
                  {opt.value === value && <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
