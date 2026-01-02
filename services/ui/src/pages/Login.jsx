const LoginPage = ({ onLogin, loading, error, setDemoMode }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-center">
          <div className="mx-auto bg-white/20 w-14 h-14 rounded-full flex items-center justify-center mb-4 text-white backdrop-blur-sm">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Email Verifier Pro</h1>
          <p className="text-blue-100 text-sm mt-1">Enterprise Grade Verification</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>

            {error && !error.includes("Switch to Demo") && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg flex items-start gap-2 border border-red-100">
                <AlertCircle size={16} className="mt-0.5 shrink-0" /> 
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
             <button 
                onClick={() => setDemoMode(true)}
                className="text-xs text-gray-500 hover:text-blue-600 underline transition-colors"
              >
                Having connection issues? Try Demo Mode
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};
