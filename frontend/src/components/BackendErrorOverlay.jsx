import { useEffect, useState } from 'react';

export function BackendErrorOverlay({ show, onRetry }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
      <div className="text-center">
        {/* Teal animated spinner */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-[#008080]/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-[#008080] border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-[#008080]/40 border-r-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        
        {/* Pulsing teal dot */}
        <div className="flex justify-center gap-2 mb-6">
          <div className="w-3 h-3 bg-[#008080] rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 bg-[#008080] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-[#008080] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
        
        <h2 className="text-2xl font-semibold text-[#2D3748] mb-2">Connecting to Server...</h2>
        <p className="text-[#718096] mb-6">Please wait while we reconnect to the backend</p>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-[#008080] text-white rounded-lg hover:bg-[#006666] transition-colors"
          >
            Retry Connection
          </button>
        )}
      </div>
    </div>
  );
}

