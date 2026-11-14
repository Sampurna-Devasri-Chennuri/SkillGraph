import React from 'react';

export default function LoadingSpinner({ message = 'Resolving skill dependency graph...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[350px]">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping"></div>
        <div className="absolute inset-0 rounded-full border-2 border-t-cyan-400 border-r-purple-500 border-b-blue-600 border-l-transparent animate-spin"></div>
      </div>
      <p className="mt-4 text-xs font-mono text-slate-400 tracking-wide animate-pulse">{message}</p>
    </div>
  );
}
