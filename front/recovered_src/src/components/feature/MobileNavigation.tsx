
import { useState } from 'react';

export default function MobileNavigation() {
  const [activeTab, setActiveTab] = useState('home');

  const navItems = [
    { id: 'home', icon: 'ri-home-line', iconFilled: 'ri-home-fill', label: 'Home' },
    { id: 'practice', icon: 'ri-question-line', iconFilled: 'ri-question-fill', label: 'Practice' },
    { id: 'study', icon: 'ri-book-open-line', iconFilled: 'ri-book-open-fill', label: 'Study Path' },
    { id: 'analytics', icon: 'ri-bar-chart-line', iconFilled: 'ri-bar-chart-fill', label: 'Analytics' },
    { id: 'community', icon: 'ri-group-line', iconFilled: 'ri-group-fill', label: 'Community' }
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    // Add bounce animation
    const button = document.querySelector(`[data-tab="${tabId}"]`);
    if (button) {
      button.classList.add('animate-bounce');
      setTimeout(() => {
        button.classList.remove('animate-bounce');
      }, 600);
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            data-tab={item.id}
            onClick={() => handleTabClick(item.id)}
            className={`flex flex-col items-center justify-center p-2 min-w-0 flex-1 transition-all duration-200 ${
              activeTab === item.id
                ? 'text-primary'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className="w-6 h-6 flex items-center justify-center mb-1">
              <i className={`text-xl ${activeTab === item.id ? item.iconFilled : item.icon}`}></i>
            </div>
            <span className={`text-xs font-medium transition-all duration-200 ${
              activeTab === item.id 
                ? 'opacity-100 transform translate-y-0' 
                : 'opacity-0 transform translate-y-1'
            }`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}