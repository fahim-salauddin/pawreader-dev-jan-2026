'use client';
import React, { useState, useEffect } from 'react';
import { validateUnlockCode, isUnlocked } from '@/lib/unlockCodes'; // Adjust path

export default function UnlockModal() {
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await validateUnlockCode(licenseKey);
    setLoading(false);
    if (!result.success) setError(result.error || 'Invalid key');
  };

  useEffect(() => {
    if (isUnlocked()) window.location.reload();
  }, []);

  if (isUnlocked()) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white to-gray-50 shadow-2xl rounded-2xl p-8 max-w-md w-full border border-gray-200">
        <div className="flex items-center mb-6 gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl shadow-lg">🐾</div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Unlock PawReader</h2>
            <p className="text-sm text-gray-500 mt-1">Lifetime access via Gumroad</p>
          </div>
        </div>

        <form onSubmit={handleUnlock} className="space-y-4">
          <input
            type="text"
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            placeholder="5A0C97AF-80CB40DA-99EE9571-BD644C58"
            className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all"
            disabled={loading}
          />
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading || !licenseKey.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {loading ? '🔄 Verifying...' : '🎉 Unlock Forever'}
          </button>
        </form>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          Need key? Buy at fahimprince8.gumroad.com/l/pawreader-premium
        </p>
      </div>
    </div>
  );
}
