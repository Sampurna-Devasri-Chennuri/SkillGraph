import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI, skillsAPI, careersAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  User,
  GraduationCap,
  Target,
  Briefcase,
  Save,
  CheckCircle2,
  Trash2,
  Plus,
  Award,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUserProfile } = useAuth();

  const [careers, setCareers] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [educationDegree, setEducationDegree] = useState('');
  const [educationInstitution, setEducationInstitution] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Beginner');
  const [careerInterests, setCareerInterests] = useState('');
  const [targetCareerId, setTargetCareerId] = useState('');

  // Add Skill quick state
  const [newSkillId, setNewSkillId] = useState('');
  const [newSkillProf, setNewSkillProf] = useState(2);
  const [newSkillStatus, setNewSkillStatus] = useState('LEARNING');

  const loadProfileData = () => {
    setLoading(true);
    Promise.all([
      authAPI.getProfile(),
      careersAPI.getCareers(),
      skillsAPI.getUserSkills(),
      skillsAPI.getSkills(),
    ])
      .then(([profRes, carRes, usRes, sRes]) => {
        const u = profRes.data;
        setFirstName(u.first_name || '');
        setLastName(u.last_name || '');
        setEmail(u.email || '');
        if (u.profile) {
          setHeadline(u.profile.headline || '');
          setBio(u.profile.bio || '');
          setEducationDegree(u.profile.education_degree || '');
          setEducationInstitution(u.profile.education_institution || '');
          setExperienceLevel(u.profile.experience_level || 'Beginner');
          setCareerInterests(u.profile.career_interests || '');
          setTargetCareerId(u.profile.target_career || '');
        }

        setCareers(carRes.data.results || carRes.data || []);
        setUserSkills(usRes.data.results || usRes.data || []);
        setAllSkills(sRes.data.results || sRes.data || []);
      })
      .catch((err) => console.error('Failed to load profile details', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setStatusMsg('');

    try {
      await authAPI.updateProfile({
        first_name: firstName,
        last_name: lastName,
        email,
        headline,
        bio,
        education_degree: educationDegree,
        education_institution: educationInstitution,
        experience_level: experienceLevel,
        career_interests: careerInterests,
        target_career: targetCareerId ? parseInt(targetCareerId) : null,
      });

      setStatusMsg('Profile details updated successfully!');
      refreshUserProfile();
    } catch (err) {
      console.error('Failed to save profile', err);
      setStatusMsg('Error updating profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddUserSkill = async (e) => {
    e.preventDefault();
    if (!newSkillId) return;

    try {
      await skillsAPI.addUserSkill({
        skill_id: parseInt(newSkillId),
        proficiency_level: newSkillProf,
        status: newSkillStatus,
      });
      setNewSkillId('');
      // Refresh skills
      const usRes = await skillsAPI.getUserSkills();
      setUserSkills(usRes.data.results || usRes.data || []);
    } catch (err) {
      console.error('Failed to add skill', err);
    }
  };

  const handleUpdateSkillProficiency = async (id, prof) => {
    try {
      await skillsAPI.updateUserSkill(id, { proficiency_level: prof });
      const usRes = await skillsAPI.getUserSkills();
      setUserSkills(usRes.data.results || usRes.data || []);
    } catch (err) {
      console.error('Failed to update proficiency', err);
    }
  };

  const handleDeleteSkill = async (id) => {
    try {
      await skillsAPI.deleteUserSkill(id);
      const usRes = await skillsAPI.getUserSkills();
      setUserSkills(usRes.data.results || usRes.data || []);
    } catch (err) {
      console.error('Failed to delete skill', err);
    }
  };

  if (loading) return <LoadingSpinner message="Loading user competency profile..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800/90 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
              Profile Management
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400"></span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-1">
            User Skill Profile
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure your technical background, target career aspiration, and demonstrated competency levels.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Settings Form */}
        <div className="lg:col-span-1 glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" /> Career Profile
          </h3>

          {statusMsg && (
            <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800 text-xs text-cyan-300">
              {statusMsg}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-100 px-3 py-2 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-100 px-3 py-2 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-100 px-3 py-2 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Target Career Role</label>
              <select
                value={targetCareerId}
                onChange={(e) => setTargetCareerId(e.target.value)}
                className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-100 px-3 py-2 focus:border-cyan-500 focus:outline-none font-medium"
              >
                <option value="">None Selected</option>
                {careers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-100 px-3 py-2 focus:border-cyan-500 focus:outline-none"
              >
                <option value="Beginner">Beginner (0-1 yrs)</option>
                <option value="Intermediate">Intermediate (1-3 yrs)</option>
                <option value="Advanced">Advanced (3-5 yrs)</option>
                <option value="Lead">Lead / Principal (5+ yrs)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Education / Degree</label>
              <input
                type="text"
                value={educationDegree}
                onChange={(e) => setEducationDegree(e.target.value)}
                placeholder="B.S. in Computer Science"
                className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-100 px-3 py-2 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Aspiring AI Engineer"
                className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-100 px-3 py-2 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief summary of engineering experience and learning targets..."
                className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-100 p-2.5 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
            >
              <Save className="w-3.5 h-3.5" />
              {savingProfile ? 'Saving...' : 'Update Career Profile'}
            </button>
          </form>
        </div>

        {/* User Skills Management Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Add Skill Card */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-cyan-400" /> Add Skill to Profile
            </h3>

            <form onSubmit={handleAddUserSkill} className="flex flex-wrap items-center gap-2">
              <select
                required
                value={newSkillId}
                onChange={(e) => setNewSkillId(e.target.value)}
                className="flex-1 min-w-[180px] text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 focus:border-cyan-500 focus:outline-none"
              >
                <option value="">Select Technical Skill...</option>
                {allSkills
                  .filter((s) => !userSkills.some((us) => us.skill?.id === s.id))
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category_name})
                    </option>
                  ))}
              </select>

              <select
                value={newSkillStatus}
                onChange={(e) => setNewSkillStatus(e.target.value)}
                className="text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 focus:border-cyan-500 focus:outline-none"
              >
                <option value="WANT_TO_LEARN">Want to Learn</option>
                <option value="LEARNING">Currently Learning</option>
                <option value="PRACTICED">Practiced</option>
                <option value="DEMONSTRATED">Demonstrated / Proficient</option>
              </select>

              <select
                value={newSkillProf}
                onChange={(e) => setNewSkillProf(parseInt(e.target.value))}
                className="text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 focus:border-cyan-500 focus:outline-none font-mono"
              >
                <option value={1}>Lvl 1 (Familiar)</option>
                <option value={2}>Lvl 2 (Practiced)</option>
                <option value={3}>Lvl 3 (Demonstrated)</option>
                <option value={4}>Lvl 4 (Mastered)</option>
              </select>

              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono"
              >
                Add Skill
              </button>
            </form>
          </div>

          {/* User Skills Inventory */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">
                  Competency Inventory
                </span>
                <h3 className="text-base font-bold text-slate-100">
                  Tracked Skills ({userSkills.length})
                </h3>
              </div>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {userSkills.map((us) => (
                <div
                  key={us.id}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-200 flex items-center gap-2">
                      {us.skill?.name}
                      <span className="text-[10px] font-normal text-slate-400 font-mono">
                        ({us.skill?.category_name})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Status: <span className="text-cyan-300">{us.status}</span>
                      {us.notes && ` • "${us.notes}"`}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Proficiency Adjuster */}
                    <div className="flex items-center gap-1 font-mono text-xs">
                      {[1, 2, 3, 4].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => handleUpdateSkillProficiency(us.id, lvl)}
                          className={`w-6 h-6 rounded-md font-bold transition-all ${
                            lvl <= us.proficiency_level
                              ? 'bg-cyan-500 text-slate-950'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handleDeleteSkill(us.id)}
                      title="Remove skill"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
