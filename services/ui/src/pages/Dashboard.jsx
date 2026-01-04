import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import FileUpload from '../components/FileUpload';
import { Settings, Activity } from 'lucide-react';

const DashboardPage = ({ user, api, onLogout }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar user={user} onLogout={onLogout} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} closeMobile={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {activeTab === 'upload' && 'New Verification'}
                {activeTab === 'jobs' && 'Verification History'}
                {activeTab === 'settings' && 'Account Settings'}
              </h1>
              <p className="text-gray-500 text-sm">
                {activeTab === 'upload' && 'Upload and process a new batch of emails.'}
                {activeTab === 'jobs' && 'Track the status of your current and past jobs.'}
              </p>
            </div>

            {activeTab === 'upload' && (
              <FileUpload api={api} />
            )}
            
            {activeTab === 'jobs' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
                 <Activity size={48} className="mx-auto mb-4 opacity-20" />
                 <p>Jobs history functionality coming soon.</p>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
                <Settings size={48} className="mx-auto mb-4 opacity-20" />
                <p>Settings module would go here in the full implementation.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;