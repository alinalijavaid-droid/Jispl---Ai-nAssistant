import React from 'react';
import type { MenuItemConfig } from '../App';

interface MenuBarProps {
  items: MenuItemConfig[];
  activeItem: MenuItemConfig;
  onItemClick: (item: MenuItemConfig) => void;
}

const MenuBar: React.FC<MenuBarProps> = ({ items, activeItem, onItemClick }) => {
  return (
    <nav className="w-full bg-green-50 border border-green-200 rounded-lg shadow-sm p-2 flex flex-col sm:flex-row gap-3 items-center justify-between" aria-label="Main navigation">
      <ul className="flex flex-wrap items-center gap-2" role="tablist">
        {items.map((item) => {
          const isActive = item.name === activeItem.name;
          return (
            <li key={item.name} role="presentation">
              <button
                onClick={() => onItemClick(item)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isActive
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-green-100 hover:text-green-800'
                }`}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${item.name}`}
              >
                {item.name}
              </button>
            </li>
          );
        })}
      </ul>
      
      <div className="flex items-center gap-2 w-full sm:w-auto flex-1 justify-end">
        {/* URL search bar and Dark Mode button removed as requested */}
        <div className="text-[10px] font-bold text-green-700 uppercase tracking-widest opacity-40 px-3">
          JISPL Secure Environment
        </div>
      </div>
    </nav>
  );
};

export default MenuBar;