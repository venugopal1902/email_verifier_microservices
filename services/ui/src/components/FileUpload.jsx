const FileUpload = ({ api, addJob, demoMode, handleApiError }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setMessage(null);

    // --- DEMO MODE SIMULATION ---
    if (demoMode) {
      setTimeout(() => {
        setUploading(false);
        setMessage({ type: 'success', text: 'File uploaded successfully! Processing started.' });
        addJob({
          job_id: `job-${Date.now()}`,
          original_filename: file.name,
          status: 'QUEUED',
          progress: '0%',
          created_at: new Date().toISOString().split('T')[0]
        });
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }, 1500);
      return;
    }

    // --- REAL API CALL ---
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/api/verify/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage({ type: 'success', text: `Upload complete. Job ID: ${res.data.job_id}` });
      addJob({
        job_id: res.data.job_id,
        original_filename: file.name,
        status: 'QUEUED',
        progress: '0%',
        created_at: new Date().toISOString().split('T')[0]
      });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      const errorMsg = handleApiError(err);
      setMessage({ 
        type: 'error', 
        text: errorMsg === "NETWORK_ERROR" ? "Upload failed: Backend unreachable." : errorMsg 
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center max-w-2xl mx-auto mt-8">
      <div className="mb-8">
        <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
          <Upload size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Upload CSV List</h2>
        <p className="text-gray-500 mt-2">
          Upload your email list (CSV or TXT) to begin real-time verification. 
          <br/>We support files up to 100MB.
        </p>
      </div>

      <div 
        className="border-2 border-dashed border-gray-300 rounded-xl p-10 hover:bg-gray-50 hover:border-blue-400 transition-all cursor-pointer group"
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv,.txt"
          className="hidden" 
        />
        
        {file ? (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-200">
            <FileText size={48} className="text-emerald-500 mb-3" />
            <span className="font-semibold text-gray-800 text-lg">{file.name}</span>
            <span className="text-sm text-gray-400 mt-1">{(file.size / 1024).toFixed(1)} KB</span>
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-400 group-hover:text-blue-500 transition-colors">
            <span className="mb-2 font-medium">Click to browse or drag file here</span>
            <span className="text-xs text-gray-400">CSV, TXT</span>
          </div>
        )}
      </div>

      {message && (
        <div className={`mt-6 p-4 rounded-lg text-sm flex items-center justify-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {message.text}
        </div>
      )}

      <button 
        onClick={handleUpload}
        disabled={!file || uploading}
        className={`mt-8 w-full py-3.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
          !file || uploading 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 hover:shadow-blue-300 transform hover:-translate-y-0.5'
        }`}
      >
        {uploading && <Loader2 className="animate-spin" size={20} />}
        {uploading ? 'Processing File...' : 'Start Verification Job'}
      </button>
    </div>
  );
};
