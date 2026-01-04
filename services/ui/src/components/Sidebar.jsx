import React from 'react';
import { Upload, Activity, Settings, X } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, isOpen, closeMobile }) => {
  const NavItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => { setActiveTab(id); closeMobile(); }}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors mb-1 ${
        activeTab === id 
          ? 'bg-blue-50 text-blue-700' 
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-20 lg:hidden" onClick={closeMobile} />
      )}
      <aside className={`fixed inset-y-0 left-0 bg-white border-r w-64 transform transition-transform duration-200 ease-in-out z-30 lg:translate-x-0 lg:static lg:h-[calc(100vh-64px)] ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <span className="font-bold text-gray-800">Menu</span>
            <button onClick={closeMobile}><X size={20} /></button>
          </div>

          <div className="flex-1">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">Core</div>
            <NavItem id="upload" icon={Upload} label="New Verification" />
            <NavItem id="jobs" icon={Activity} label="Job History" />
            
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-3 px-4">Account</div>
            <NavItem id="settings" icon={Settings} label="Settings" />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;