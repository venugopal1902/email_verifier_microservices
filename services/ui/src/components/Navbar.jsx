const Navbar = ({ user, onLogout, toggleSidebar }) => (
  <header className="bg-white border-b h-16 flex items-center justify-between px-4 sticky top-0 z-20">
    <div className="flex items-center gap-3">
      <button onClick={toggleSidebar} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
        <Menu size={20} />
      </button>
      <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
        <ShieldCheck /> <span className="hidden sm:inline">Email Verifier</span>
      </div>
    </div>
    
    <div className="flex items-center gap-4">
      <div className="hidden sm:block text-right">
        <div className="text-sm font-semibold text-gray-800">{user?.username || 'Guest'}</div>
        <div className="text-xs text-gray-500 uppercase tracking-wider">{user?.plan || 'Free Tier'}</div>
      </div>
      <button 
        onClick={onLogout}
        className="p-2 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-full transition-colors"
        title="Logout"
      >
        <LogOut size={20} />
      </button>
    </div>
  </header>
);