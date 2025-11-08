import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getMessage } from '../../locales/investorProfile';
import type { ReactNode } from 'react';

interface TabConfig {
  id: string;
  label: string;
  content: ReactNode;
  icon?: string;
}

interface ProfileTabsProps {
  tabs: TabConfig[];
}

export function ProfileTabs({ tabs }: ProfileTabsProps) {
  const { language, direction } = useLanguage();
  const [activeTab, setActiveTab] = useState(tabs[0]?.id);

  return (
    <div style={{ direction }}>
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          borderBottom: '1px solid #E5E7EB',
          marginBottom: '1.5rem',
        }}
        role="tablist"
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.65rem 1.1rem',
              borderRadius: '0.75rem 0.75rem 0 0',
              border: 'none',
              borderBottom:
                activeTab === tab.id ? '3px solid #2D6FA3' : '3px solid transparent',
              background: activeTab === tab.id ? '#FFFFFF' : '#F3F4F6',
              color: activeTab === tab.id ? '#111418' : '#6B7280',
              fontWeight: activeTab === tab.id ? 600 : 500,
              cursor: 'pointer',
              boxShadow:
                activeTab === tab.id
                  ? '0 -4px 16px rgba(45, 111, 163, 0.08)'
                  : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {tab.icon ?? '•'}{' '}
            {getMessage(
              `tabs.${tab.label}` as
                | 'tabs.basic'
                | 'tabs.identity'
                | 'tabs.preferences',
              language
            )}
          </button>
        ))}
      </div>
      <div>
        {tabs.map(
          tab =>
            tab.id === activeTab && (
              <section key={tab.id} role="tabpanel">
                {tab.content}
              </section>
            )
        )}
      </div>
    </div>
  );
}

