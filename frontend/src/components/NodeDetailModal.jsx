import React, { useState, useEffect } from 'react';
import { skillsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  X,
  BookOpen,
  ExternalLink,
  GitBranch,
  Target,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  Plus,
  Save,
} from 'lucide-react';

export default function NodeDetailModal({ skillId, onClose, onSkillUpdated, onSelectSkill }) {
  const { isAuthenticated } = useAuth();
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state for user skill update
  const [proficiency, setProficiency] = useState(1);
  const [status, setStatus] = useState('LEARNING');
  const [notes, setNotes] = useState('');
  const [userSkillId, setUserSkillId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    if (!skillId) return;

    let isMounted = true;
    setLoading(true);
    setFeedbackMsg('');

    skillsAPI
      .getSkillDetail(skillId)
      .then((res) => {
        if (!isMounted) return;
        setSkill(res.data);
        if (res.data.user_competency) {
          setUserSkillId(res.data.user_competency.id);
          setProficiency(res.data.user_competency.proficiency_level);
          setStatus(res.data.user_competency.status);
          setNotes(res.data.user_competency.notes || '');
        } else {
          setUserSkillId(null);
          setProficiency(1);
          setStatus('LEARNING');
          setNotes('');
        }
      })
      .catch((err) => {
        console.error('Failed to load skill details', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [skillId]);

  const handleSaveCompetency = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    setSaving(true);
    setFeedbackMsg('');

    try {
      if (userSkillId) {
        await skillsAPI.updateUserSkill(userSkillId, {
          proficiency_level: proficiency,
          status,
          notes,
        });
      } else {
        const res = await skillsAPI.addUserSkill({
          skill_id: skill.id,
          proficiency_level: proficiency,
          status,
          notes,
        });
        setUserSkillId(res.data.id);
      }
      setFeedbackMsg('Skill competency saved successfully!');
      if (onSkillUpdated) onSkillUpdated();
    } catch (err) {
      console.error('Error saving skill', err);
      setFeedbackMsg('Failed to update competency.');
    } finally {
      setSaving(false);
    }
  };

  if (!skillId) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-[#090d1a] border-l border-slate-800 shadow-2xl flex flex-col transform transition-transform duration-300 overflow-hidden">
      {/* Drawer Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: skill?.category?.color_hex || '#3b82f6' }}
          />
          <span className="text-xs font-mono font-medium text-slate-400">
            {skill?.category?.name || 'Skill Details'}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        </div>
      ) : !skill ? (
        <div className="flex-1 p-6 text-slate-400 text-sm">Skill information not found.</div>
      ) : (
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Skill Name & Badges */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-500/10 text-cyan-400 border border-blue-500/20">
                {skill.difficulty_level}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Importance: {skill.importance_weight}x
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-100">{skill.name}</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">{skill.description}</p>
          </div>

          {/* User Competency Editor */}
          {isAuthenticated && (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/90 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> My Competency
                </h4>
                {userSkillId && (
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Tracked
                  </span>
                )}
              </div>

              {feedbackMsg && (
                <div className="text-[11px] text-cyan-300 bg-cyan-950/40 p-2 rounded border border-cyan-800/50">
                  {feedbackMsg}
                </div>
              )}

              <form onSubmit={handleSaveCompetency} className="space-y-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Learning Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-200 px-2.5 py-1.5 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="WANT_TO_LEARN">Want to Learn</option>
                    <option value="LEARNING">Currently Learning</option>
                    <option value="PRACTICED">Practiced (Exercises / Labs)</option>
                    <option value="DEMONSTRATED">Demonstrated / Proficient (Projects)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                    <span>Proficiency Level</span>
                    <span className="text-cyan-400 font-mono">Level {proficiency} of 4</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    value={proficiency}
                    onChange={(e) => setProficiency(parseInt(e.target.value))}
                    className="w-full accent-cyan-400 bg-slate-700 h-1.5 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                    <span>1: Familiar</span>
                    <span>2: Practiced</span>
                    <span>3: Demonstrated</span>
                    <span>4: Mastered</span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Notes / Evidence</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Built portfolio API, read docs"
                    className="w-full text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-200 px-2.5 py-1.5 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Saving...' : userSkillId ? 'Update Competency' : 'Add to My Skills'}
                </button>
              </form>
            </div>
          )}

          {/* Direct Prerequisites */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-2.5 flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-amber-400" /> Prerequisite Skills (
              {skill.prerequisites?.length || 0})
            </h4>
            {skill.prerequisites && skill.prerequisites.length > 0 ? (
              <div className="space-y-1.5">
                {skill.prerequisites.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => onSelectSkill && onSelectSkill(p.id)}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer group"
                  >
                    <div>
                      <div className="text-xs font-medium text-slate-200 group-hover:text-cyan-400 transition-colors">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {p.dependency_type.replace('_', ' ')} • Strength {p.strength}/5
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-[11px] text-slate-500 italic">
                Foundational skill — no preceding prerequisites required.
              </div>
            )}
          </div>

          {/* Unlocked Downstream Skills */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-2.5 flex items-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5 text-purple-400" /> Unlocks Next (
              {skill.dependents?.length || 0})
            </h4>
            {skill.dependents && skill.dependents.length > 0 ? (
              <div className="space-y-1.5">
                {skill.dependents.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => onSelectSkill && onSelectSkill(d.id)}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer group"
                  >
                    <div>
                      <div className="text-xs font-medium text-slate-200 group-hover:text-purple-400 transition-colors">
                        {d.name}
                      </div>
                      <div className="text-[10px] text-slate-500">{d.category}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-[11px] text-slate-500 italic">
                Specialized terminal skill in the current curriculum.
              </div>
            )}
          </div>

          {/* Career Roles Requiring this Skill */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-2.5 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-cyan-400" /> Career Demand (
              {skill.career_roles?.length || 0})
            </h4>
            {skill.career_roles && skill.career_roles.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {skill.career_roles.map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-medium text-slate-200">{c.title}</div>
                      <div className="text-[10px] text-slate-400">
                        Avg: {c.salary_range}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        c.is_core
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                      }`}
                    >
                      {c.is_core ? 'Core' : 'Recommended'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 italic">Complementary skill.</div>
            )}
          </div>

          {/* Learning Resources */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-2.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" /> Curated Resources
            </h4>
            {skill.resources && skill.resources.length > 0 ? (
              <div className="space-y-2">
                {skill.resources.map((r) => (
                  <a
                    key={r.id}
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-lg bg-blue-950/20 border border-blue-800/30 hover:border-cyan-500/50 hover:bg-blue-950/40 transition-colors group"
                  >
                    <div>
                      <div className="text-xs font-medium text-cyan-300 group-hover:text-cyan-200 flex items-center gap-1">
                        {r.title}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {r.provider || r.resource_type} • {r.estimated_hours} hrs
                        {r.is_free && (
                          <span className="ml-1 text-emerald-400 font-medium">Free</span>
                        )}
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 italic">No resources attached yet.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
