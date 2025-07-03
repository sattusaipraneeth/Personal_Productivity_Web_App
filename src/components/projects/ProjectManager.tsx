import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, FolderOpen, BarChart3, Calendar, CheckCircle } from 'lucide-react';
import { Project } from '../../types';
import { generateId } from '../../utils/dates';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import ProjectCard from './ProjectCard';
import ProjectForm from './ProjectForm';
import GlassCard from '../common/GlassCard';

export default function ProjectManager() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProjects: Project[] = data.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        color: project.color,
        status: project.status as any,
        startDate: project.start_date ? new Date(project.start_date) : undefined,
        endDate: project.end_date ? new Date(project.end_date) : undefined,
        progress: project.progress,
        createdAt: new Date(project.created_at),
        updatedAt: new Date(project.updated_at),
        userId: project.user_id,
      }));

      setProjects(formattedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: projectData.name,
          description: projectData.description,
          color: projectData.color,
          status: projectData.status,
          start_date: projectData.startDate?.toISOString(),
          end_date: projectData.endDate?.toISOString(),
          progress: projectData.progress,
          user_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      const newProject: Project = {
        id: data.id,
        name: data.name,
        description: data.description,
        color: data.color,
        status: data.status,
        startDate: data.start_date ? new Date(data.start_date) : undefined,
        endDate: data.end_date ? new Date(data.end_date) : undefined,
        progress: data.progress,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        userId: data.user_id,
      };

      setProjects(prev => [newProject, ...prev]);
      setShowForm(false);
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  const updateProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingProject) return;

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: projectData.name,
          description: projectData.description,
          color: projectData.color,
          status: projectData.status,
          start_date: projectData.startDate?.toISOString(),
          end_date: projectData.endDate?.toISOString(),
          progress: projectData.progress,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingProject.id);

      if (error) throw error;

      setProjects(prev => prev.map(project => 
        project.id === editingProject.id 
          ? { 
              ...project, 
              ...projectData,
              updatedAt: new Date()
            }
          : project
      ));
      setEditingProject(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const updateProgress = async (id: string, progress: number) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ 
          progress,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setProjects(prev => prev.map(project => 
        project.id === id 
          ? { ...project, progress, updatedAt: new Date() }
          : project
      ));
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProjects(prev => prev.filter(project => project.id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    avgProgress: projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) : 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Organize and track your projects
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProject(null);
            setShowForm(true);
          }}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <FolderOpen className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Projects
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.active}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Active Projects
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.completed}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Completed
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Calendar className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.avgProgress}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Avg Progress
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Filters and Search */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Project Form Modal */}
      {showForm && (
        <ProjectForm
          project={editingProject}
          onSubmit={editingProject ? updateProject : addProject}
          onCancel={() => {
            setShowForm(false);
            setEditingProject(null);
          }}
        />
      )}

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <div className="text-gray-400 dark:text-gray-500">
            <FolderOpen className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {projects.length === 0 ? 'No projects yet' : 'No projects match your filters'}
            </h3>
            <p className="text-sm">
              {projects.length === 0 
                ? 'Create your first project to start organizing your work!'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEditProject}
              onDelete={deleteProject}
              onUpdateProgress={updateProgress}
            />
          ))}
        </div>
      )}
    </div>
  );
}