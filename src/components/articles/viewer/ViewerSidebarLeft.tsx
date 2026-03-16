'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Compass, 
  Bookmark, 
  Settings, 
  Users, 
  Moon,
  Sun
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ViewerSidebarLeft: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Compass, label: 'Explore', href: '/explore' },
    { icon: Users, label: 'Communities', href: '/communities' },
    { icon: Bookmark, label: 'Bookmarks', href: '/bookmarks' },
  ];

  return (
    <aside className="flex h-full w-16 flex-col items-center border-r border-common-minimal bg-common-cardBackground py-4 shadow-sm">
      {/* Logo */}
      <Link href="/" className="mb-8">
        <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-functional-blue flex items-center justify-center">
            <span className="text-white font-bold text-xs">SC</span>
        </div>
      </Link>

      {/* Main Navigation */}
      <nav className="flex flex-1 flex-col gap-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              title={item.label}
              className={cn(
                "group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-functional-blue/10 text-functional-blue" 
                  : "text-text-tertiary hover:bg-common-minimal hover:text-text-secondary"
              )}
            >
              <item.icon size={20} />
              {isActive && (
                <div className="absolute left-0 h-5 w-1 rounded-r-full bg-functional-blue" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-4 mt-auto border-t border-common-minimal pt-4">
        <button 
          title="Toggle Theme"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-text-tertiary hover:bg-common-minimal transition-colors"
        >
          <Sun size={20} className="dark:hidden" />
          <Moon size={20} className="hidden dark:block" />
        </button>
        
        <Link 
          href="/settings"
          title="Settings"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-text-tertiary hover:bg-common-minimal transition-colors"
        >
          <Settings size={20} />
        </Link>

        {/* User Profile Avatar (Simplified) */}
        <div className="h-8 w-8 rounded-full bg-common-minimal border border-common-contrast overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
            <div className="h-full w-full bg-gradient-to-tr from-functional-blue to-cyan-400" />
        </div>
      </div>
    </aside>
  );
};

export default ViewerSidebarLeft;