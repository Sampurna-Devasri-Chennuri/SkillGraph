import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Code,
  CheckCircle2,
  Clock,
  Sparkles,
  Flame,
  Award,
  Layers,
  ArrowRight,
} from 'lucide-react';

const statusStyles = {
  DEMONSTRATED: {
    border: 'border-emerald-500/90 shadow-[0_0_18px_rgba(16,185,129,0.35)]',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    label: 'Demonstrated',
    icon: CheckCircle2,
    iconColor: 'text-emerald-400',
  },
  PRACTICED: {
    border: 'border-cyan-500/90 shadow-[0_0_18px_rgba(6,182,212,0.35)]',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    label: 'Practiced',
    icon: Award,
    iconColor: 'text-cyan-400',
  },
  LEARNING: {
    border: 'border-purple-500/90 shadow-[0_0_18px_rgba(168,85,247,0.35)]',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    label: 'Learning',
    icon: Clock,
    iconColor: 'text-purple-400',
  },
  TARGET_REQUIRED: {
    border: 'border-amber-500/80 shadow-[0_0_14px_rgba(245,158,11,0.25)]',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    label: 'Target Core',
    icon: Flame,
    iconColor: 'text-amber-400',
  },
  TARGET_RECOMMENDED: {
    border: 'border-blue-500/60 shadow-[0_0_12px_rgba(59,130,246,0.2)]',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    label: 'Recommended',
    icon: Sparkles,
    iconColor: 'text-blue-400',
  },
  UNACQUIRED: {
    border: 'border-slate-800 hover:border-slate-600',
    badge: 'bg-slate-800 text-slate-400 border-slate-700',
    label: 'Not Started',
    icon: Code,
    iconColor: 'text-slate-500',
  },
};

const difficultyColors = {
  Beginner: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Intermediate: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Advanced: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

function SkillNode({ data, selected }) {
  const statusConfig = statusStyles[data.userStatus] || statusStyles.UNACQUIRED;
  const StatusIcon = statusConfig.icon;

  return (
    <div
      className={`relative w-64 rounded-xl backdrop-blur-md p-3.5 transition-all duration-300 cursor-pointer ${
        selected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#070913] scale-105' : ''
      } ${statusConfig.border} bg-[#0c1222]/90 border`}
    >
      {/* Target input handle on left */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-[#070913] !-left-1.5 transition-transform hover:!scale-125"
      />

      {/* Header: Category & Status */}
      <div className="flex items-center justify-between gap-1.5 mb-2">
        <span
          className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full border"
          style={{
            borderColor: `${data.categoryColor || '#3b82f6'}40`,
            backgroundColor: `${data.categoryColor || '#3b82f6'}15`,
            color: data.categoryColor || '#3b82f6',
          }}
        >
          {data.category}
        </span>

        <span
          className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border ${statusConfig.badge}`}
        >
          <StatusIcon className={`w-3 h-3 ${statusConfig.iconColor}`} />
          {statusConfig.label}
        </span>
      </div>

      {/* Main Skill Name */}
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-bold text-slate-100 group-hover:text-cyan-400 transition-colors leading-snug">
          {data.name}
        </h4>
      </div>

      {/* Description Snippet */}
      <p className="text-[11px] text-slate-400 line-clamp-2 my-2 leading-relaxed">
        {data.description}
      </p>

      {/* Footer: Difficulty, Prereqs, and Proficiency */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
        <span
          className={`px-1.5 py-0.5 rounded border font-mono ${
            difficultyColors[data.difficulty] || 'text-slate-400'
          }`}
        >
          {data.difficulty}
        </span>

        {/* User Proficiency Stars/Dots if acquired */}
        {data.userProficiency > 0 ? (
          <div className="flex items-center gap-1 text-slate-300">
            <span className="text-[10px] text-slate-400">Lvl {data.userProficiency}/4</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4].map((lvl) => (
                <div
                  key={lvl}
                  className={`w-1.5 h-1.5 rounded-full ${
                    lvl <= data.userProficiency ? 'bg-cyan-400' : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-slate-500 font-mono">
            <span>{data.prereqCount} in</span>
            <span>•</span>
            <span>{data.dependentCount} out</span>
          </div>
        )}
      </div>

      {/* Source output handle on right */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-purple-500 !border-2 !border-[#070913] !-right-1.5 transition-transform hover:!scale-125"
      />
    </div>
  );
}

export default memo(SkillNode);
