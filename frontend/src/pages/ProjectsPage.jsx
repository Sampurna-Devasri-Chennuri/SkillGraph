import React, { useState, useEffect } from 'react';
import { projectsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FolderGit2,
  Plus,
  GitBranch,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Star,
  Trash2,
  RefreshCw,
  X,
  Code2,
  Layers,
  Award,
} from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [extractingId, setExtractingId] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techInput, setTechInput] = useState('');
  const [technologies, setTechnologies] = useState([]);
  const [githubUrl, setGithubUrl] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadProjects = () => {
    setLoading(true);
    projectsAPI
      .getProjects()
      .then((res) => {
        setProjects(res.data.results || res.data || []);
      })
      .catch((err) => console.error('Failed to load projects', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleAddTech = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = techInput.trim().replace(/^,+|,+$/g, '');
      if (val && !technologies.includes(val)) {
        setTechnologies([...technologies, val]);
      }
      setTechInput('');
    }
  };

  const handleRemoveTech = (t) => {
    setTechnologies(technologies.filter((item) => item !== t));
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setFormError('Title and description are required.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      await projectsAPI.createProject({
        title,
        description,
        technologies: technologies.length > 0 ? technologies : ['Python', 'React'],
        github_url: githubUrl,
        live_demo_url: liveDemoUrl,
        status: 'COMPLETED',
      });

      setShowAddModal(false);
      setTitle('');
      setDescription('');
      setTechnologies([]);
      setGithubUrl('');
      setLiveDemoUrl('');
      loadProjects();
    } catch (err) {
      console.error('Failed to create project', err);
      setFormError('Failed to save project.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Delete this project and its evidence mappings?')) return;
    try {
      await projectsAPI.deleteProject(id);
      loadProjects();
    } catch (err) {
      console.error('Failed to delete project', err);
    }
  };

  const handleReExtractSkills = async (id) => {
    setExtractingId(id);
    try {
      await projectsAPI.extractSkills(id);
      loadProjects();
    } catch (err) {
      console.error('Failed to extract skills', err);
    } finally {
      setExtractingId(null);
    }
  };

  if (loading) return <LoadingSpinner message="Extracting NLP project-to-skill evidence mappings..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800/90 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
              Portfolio Evidence Grounding
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-1">
            Project-to-Skill Evidence Mapping
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Connect practical engineering codebases to technical competencies with NLP semantic skill extraction.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Add Practical Project
        </button>
      </div>

      {/* Projects List */}
      <div className="space-y-6">
        {projects.length > 0 ? (
          projects.map((project) => (
            <div
              key={project.id}
              className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-100">{project.title}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {project.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
                    {project.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleReExtractSkills(project.id)}
                    title="Re-run NLP extraction"
                    disabled={extractingId === project.id}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 border border-slate-700 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${extractingId === project.id ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    title="Delete Project"
                    className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Technologies Tag List */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-mono text-slate-400 mr-1 flex items-center gap-1">
                  <Code2 className="w-3 h-3 text-cyan-400" /> Stack:
                </span>
                {project.technologies?.map((tech, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Links Strip */}
              <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors"
                  >
                    <GitBranch className="w-3.5 h-3.5" /> Repository
                  </a>
                )}
                {project.live_demo_url && (
                  <a
                    href={project.live_demo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                  </a>
                )}
                <span className="ml-auto text-[11px] text-slate-500">
                  {project.skill_evidences?.length || 0} Skills Evidenced
                </span>
              </div>

              {/* NLP Demonstrated Skills Evidence Strip */}
              {project.skill_evidences && project.skill_evidences.length > 0 && (
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Verified NLP Evidences
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {project.skill_evidences.map((ev) => (
                      <div
                        key={ev.id}
                        className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-2"
                      >
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-slate-200">
                            {ev.skill.name}
                          </div>
                          <div className="text-[10px] text-slate-400 leading-tight">
                            {ev.evidence_snippet}
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-400 flex-shrink-0">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span className="text-[10px] font-mono">{ev.strength_rating}/5</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-12 text-center glass-card rounded-2xl border border-slate-800 text-slate-400 space-y-3">
            <FolderGit2 className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-300">No Projects Added Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Add your portfolio repositories and software engineering projects. Our engine will map
              your code to technical competencies automatically.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Add First Project
            </button>
          </div>
        )}
      </div>

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-[#0c1222] border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-emerald-400" /> Add Engineering Project
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Distributed Key-Value Store with Raft"
                  className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-100 px-3 py-2 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">
                  Architecture & Technical Description
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Engineered high-concurrency backend services with Python, Django REST, and Redis caching. Implemented relational PostgreSQL schemas..."
                  className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-100 p-3 focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500">
                  Tip: Detail action verbs (e.g. engineered, deployed, architected) to boost NLP evidence scoring.
                </span>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">
                  Technologies (Press Enter or Comma to tag)
                </label>
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={handleAddTech}
                  placeholder="e.g. Python, Docker, PostgreSQL, React..."
                  className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-100 px-3 py-2 focus:border-cyan-500 focus:outline-none"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {technologies.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-cyan-300 border border-blue-500/30 flex items-center gap-1"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTech(t)}
                        className="hover:text-rose-400"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-100 px-3 py-2 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Live Demo URL</label>
                  <input
                    type="url"
                    value={liveDemoUrl}
                    onChange={(e) => setLiveDemoUrl(e.target.value)}
                    placeholder="https://demo.app/..."
                    className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-100 px-3 py-2 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50"
                >
                  {submitting ? 'Extracting Skills...' : 'Save & Extract Skills'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
