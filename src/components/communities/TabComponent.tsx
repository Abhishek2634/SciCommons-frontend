import React, { useEffect } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import clsx from 'clsx';

interface TabComponentProps<ActiveTabType extends string> {
  tabs: ActiveTabType[];
  activeTab: ActiveTabType;
  setActiveTab: React.Dispatch<React.SetStateAction<ActiveTabType>>;
  variant?: 'default' | 'minimal';
}

const TabComponent = <ActiveTabType extends string>({
  tabs,
  activeTab,
  setActiveTab,
  variant = 'default',
}: TabComponentProps<ActiveTabType>) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMinimal = variant === 'minimal';

  const handleTabClick = (tab: ActiveTabType) => {
    setActiveTab(tab);
    router.push(`${pathname}?tab=${tab}`);
  };

  useEffect(() => {
    const tab = searchParams?.get('tab');
    if (tab && tabs.includes(tab as ActiveTabType)) {
      setActiveTab(tab as ActiveTabType);
    }
  }, [searchParams]);

  return (
    <div
      className={clsx(
        'scrollbar-hide flex w-full gap-2 overflow-x-auto text-xs text-text-primary',
        isMinimal ? 'rounded-none border-b border-common-minimal pb-1' : 'rounded-full p-1'
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          className={clsx(
            'w-fit whitespace-nowrap capitalize transition-all duration-200',
            isMinimal
              ? [
                  'border-b-2 border-transparent pb-1 text-[13px] font-medium text-text-secondary',
                  tab === activeTab && 'border-text-primary text-text-primary',
                ]
              : [
                  'rounded-full border-b-2 border-transparent px-3 py-1.5',
                  tab === activeTab
                    ? 'border-text-primary bg-common-contrast'
                    : 'bg-common-minimal/40 text-text-secondary hover:bg-common-contrast/50',
                ]
          )}
          onClick={() => handleTabClick(tab as ActiveTabType)}
        >
          {tab.replace('_', ' ')}
        </button>
      ))}
    </div>
  );
};

export default TabComponent;
