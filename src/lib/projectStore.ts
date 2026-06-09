export type Project = {
  id: string;
  name: string;
  icon: string;
  createdAt: number;
  pinned?: boolean;
  lastOpenedAt?: number;
};

export const getProjects = (): Project[] => {
  const data = localStorage.getItem('quantum_projects');
  if (!data) {
    const defaultProj = { id: 'default', name: 'Default Workspace', icon: 'Box', createdAt: Date.now() };
    localStorage.setItem('quantum_projects', JSON.stringify([defaultProj]));
    return [defaultProj];
  }
  return JSON.parse(data);
};

export const saveProject = (proj: Project) => {
  const projects = getProjects();
  projects.push(proj);
  localStorage.setItem('quantum_projects', JSON.stringify(projects));
  window.dispatchEvent(new Event('quantum_projects_changed'));
};

export const updateProject = (id: string, name: string, icon: string) => {
  const projects = getProjects();
  const idx = projects.findIndex(p => p.id === id);
  if (idx >= 0) {
    projects[idx].name = name;
    projects[idx].icon = icon;
    localStorage.setItem('quantum_projects', JSON.stringify(projects));
    window.dispatchEvent(new Event('quantum_projects_changed'));
  }
};

export const togglePinProject = (id: string) => {
  const projects = getProjects();
  const idx = projects.findIndex(p => p.id === id);
  if (idx >= 0) {
    projects[idx].pinned = !projects[idx].pinned;
    localStorage.setItem('quantum_projects', JSON.stringify(projects));
    window.dispatchEvent(new Event('quantum_projects_changed'));
  }
};

export const deleteProject = (id: string) => {
  let projects = getProjects();
  projects = projects.filter(p => p.id !== id);
  if (projects.length === 0) {
    projects.push({ id: 'default', name: 'Default Workspace', icon: 'Box', createdAt: Date.now() });
  }
  localStorage.setItem('quantum_projects', JSON.stringify(projects));
  window.dispatchEvent(new Event('quantum_projects_changed'));
};

export const getActiveProjectId = (): string => {
  return localStorage.getItem('quantum_active_project') || 'default';
};

export const setActiveProjectId = (id: string) => {
  localStorage.setItem('quantum_active_project', id);
  const projects = getProjects();
  const idx = projects.findIndex(p => p.id === id);
  if (idx >= 0) {
    projects[idx].lastOpenedAt = Date.now();
    localStorage.setItem('quantum_projects', JSON.stringify(projects));
  }
  window.dispatchEvent(new Event('quantum_active_project_changed'));
};
