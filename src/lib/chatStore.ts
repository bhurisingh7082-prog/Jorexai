import { MessageNode } from "./types";

export type ChatSession = {
  id: string;
  title: string;
  updatedAt: number;
  projectId?: string;
};

export const getSessions = (projectId?: string): ChatSession[] => {
  const data = localStorage.getItem('quantum_sessions_public');
  const items = data ? JSON.parse(data) : [];
  if (projectId) {
    return items.filter((s: ChatSession) => (s.projectId || 'default') === projectId);
  }
  return items;
};

export const saveSession = (session: ChatSession) => {
  const sessions = localStorage.getItem('quantum_sessions_public') ? JSON.parse(localStorage.getItem('quantum_sessions_public')!) : [];
  const existing = sessions.findIndex((s: ChatSession) => s.id === session.id);
  if (existing >= 0) sessions[existing] = session;
  else sessions.push(session);
  sessions.sort((a: ChatSession, b: ChatSession) => b.updatedAt - a.updatedAt);
  localStorage.setItem('quantum_sessions_public', JSON.stringify(sessions));
  window.dispatchEvent(new Event('quantum_sessions_changed'));
};

export const renameSession = (id: string, newTitle: string) => {
  const sessions = getSessions();
  const existing = sessions.findIndex(s => s.id === id);
  if (existing >= 0) {
    sessions[existing].title = newTitle;
    localStorage.setItem('quantum_sessions_public', JSON.stringify(sessions));
    window.dispatchEvent(new Event('quantum_sessions_changed'));
  }
}

export const deleteSession = (id: string) => {
  const sessions = getSessions().filter(s => s.id !== id);
  localStorage.setItem('quantum_sessions_public', JSON.stringify(sessions));
  localStorage.removeItem(`quantum_chat_public_${id}`);
  window.dispatchEvent(new Event('quantum_sessions_changed'));
}

export const getMessages = (id: string): MessageNode[] => {
  const data = localStorage.getItem(`quantum_chat_public_${id}`);
  return data ? JSON.parse(data) : [];
};

export const saveMessages = (id: string, messages: MessageNode[]) => {
  localStorage.setItem(`quantum_chat_public_${id}`, JSON.stringify(messages));
};
