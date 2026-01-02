import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import FileUpload from '../components/FileUpload';
import StatusBadge from '../components/StatusBadge';
import { handleApiError } from '../api/client';

const DashboardPage = ({ user, api, onLogout, demoMode }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [jobs, setJobs] = useState([]);

  // Mock Jobs for Demo Mode
  const MOCK_JOBS = [
    { job_id: 'job-123', original_filename: 'leads_dec_2025.csv', status: 'COMPLETED', progress: '100%', created_at: '2025-12-22' },
    { job_id: 'job-124', original_filename: 'newsletter_subscribers.csv', status: 'PROCESSING', progress: '45%', created_at: '2026-01-02' },
  ];

  useEffect(() => {
    if (demoMode) {
      setJobs(MOCK_JOBS);
    }
  }, [demoMode]);

  const addJob = (newJob) => {
    setJobs(prev => [newJob, ...prev]);
    setActiveTab('jobs');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar 
        user={user} 
        onLogout={onLogout} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isOpen={isSidebarOpen}
          closeMobile={() => setIsSidebarOpen(false)}
        />
        
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
              <FileUpload api={api} addJob={addJob} demoMode={demoMode} handleApiError={handleApiError} />
            )}
            
            {activeTab === 'jobs' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                 <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Filename</th>
                        <th className="px-6 py-4">Submitted</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Progress</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {jobs.map((job) => (
                        <tr key={job.job_id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">{job.original_filename}</td>
                          <td className="px-6 py-4">{job.created_at}</td>
                          <td className="px-6 py-4"><StatusBadge status={job.status} /></td>
                          <td className="px-6 py-4 font-mono text-xs">{job.progress}</td>
                        </tr>
                      ))}
                      {jobs.length === 0 && (
                        <tr>
                          <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                             No jobs found. Start a new verification.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-400">
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