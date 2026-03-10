/**
 * TodoNotes ✅ - Clean Todo & Notes App
 * =================================
 * Mobile First, PWA, Light/Dark Mode
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, CheckSquare, FileText, Settings, 
  Sun, Moon, Search, Mic, Sparkles,
  ChevronLeft, MoreVertical, Trash2, Edit3
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

// Types
interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  reminder?: string;
  repeat?: 'daily' | 'weekly' | 'monthly';
  duration?: number;
  cost?: number;
  location?: string;
  tags: string[];
  color?: string;
  subtasks: { id: string; title: string; completed: boolean }[];
  createdAt: string;
  pinned?: boolean;
  parentId?: string;
  dependsOn?: string[];
  isHabit?: boolean;
  emoji?: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  notebook?: string;
  notebookColor?: string;
  dueTime?: string;
  category?: string;
  recurringRule?: string;
  context?: string;
  project?: string;
  waitingFor?: string;
  startDate?: string;
  endDate?: string;
  status?: 'todo' | 'in_progress' | 'done';
  assignee?: string;
  estimatedCost?: number;
  actualCost?: number;
  effort?: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  pinned?: boolean;
  parentId?: string;
  dependsOn?: string[];
  isHabit?: boolean;
  emoji?: string;
  starred?: boolean;
  links?: string[];
  url?: string;
  collaborators?: string[];
  followers?: string[];
  meetingLink?: string;
  address?: string;
  recordingUrl?: string;
  checklist?: {id: string, text: string, done: boolean}[];
  section?: string;
  bucket?: string;
  sprint?: string;
  theme?: string;
  coverImage?: string;
  icon?: string;
  excerpt?: string;
  source?: string;
  language?: string;
  timezone?: string;
  reminderDate?: string;
  recurrenceEnd?: string;
  completedAt?: string;
  lastModifiedBy?: string;
}

// Relative time helper
const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return 'yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('de');
};

// Simple markdown preview
const renderMarkdown = (text: string) => {
  if (!text) return '';
  return text
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-2">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-2">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-medium mt-1">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-secondary px-1 rounded">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="ml-2">$1</li>')
    .replace(/\n/g, '<br/>');
};

// Storage Keys
const TODOS_KEY = 'todonotes_todos';
const NOTES_KEY = 'todonotes_notes';
const THEME_KEY = 'todonotes_theme';

// Theme Hook
function useTheme() {
  const [isDark, setIsDark] = useState(() => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [accentColor, setAccentColor] = useState("blue");
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'auto') return window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return { isDark, setIsDark };
}

// Main App
export default function App() {
  const { isDark, setIsDark } = useTheme();
  const [view, setView] = useState<'home' | 'new-todo' | 'new-note' | 'edit-todo' | 'edit-note'>('home');
  const [tab, setTab] = useState<'recent' | 'tasks' | 'notes' | 'today' | 'weekly'>('recent');
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [todoOrder, setTodoOrder] = useState<string[]>([]);

  // Initialize todo order
  useEffect(() => {
    if (todoOrder.length === 0 && todos.length > 0) {
      setTodoOrder(todos.map(t => t.id));
    }
  }, [todos]);
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'title'>('date');
  const [todos, setTodos] = useState<Todo[]>(() => JSON.parse(localStorage.getItem(TODOS_KEY) || '[]'));
  
  // Calculate streak

  const getStorageUsage = () => {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length * 2;
      }
    }
    return (total / 1024).toFixed(1);
  };
  const getStreak = () => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const day = new Date(today);
      day.setDate(day.getDate() - i);
      const dayStr = day.toISOString().split('T')[0];
      const completedToday = todos.some(t => t.completed && t.createdAt.startsWith(dayStr));
      if (completedToday) streak++;
      else if (i > 0) break;
    }
    return streak;
  };
  const [deletedItems, setDeletedItems] = useState<{type: 'todo' | 'note', item: Todo | Note, deletedAt: string}[]>(() => JSON.parse(localStorage.getItem('todonotes_trash') || '[]'));
  const [notes, setNotes] = useState<Note[]>(() => JSON.parse(localStorage.getItem(NOTES_KEY) || '[]'));
  const [selectedItem, setSelectedItem] = useState<Todo | Note | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [ultraFocusTask, setUltraFocusTask] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [pomodoroSessions, setPomodoroSessions] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds(s => s - 1), 1000);
    } else if (timerSeconds === 0 && timerActive) {
      setTimerActive(false);
      toast.success('Timer complete! 🎉'); setPomodoroSessions(s => s + 1);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  const startTimer = (mins: number) => {
    setTimerSeconds(mins * 60);
    setTimerActive(true);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [lastTapTime, setLastTapTime] = useState(0);

  // Export functions
  const exportData = (format: 'json' | 'markdown' | 'csv') => {
    const data = { todos, notes, exportedAt: new Date().toISOString() };
    
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `todonotes-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Exported as JSON');
    } else if (format === 'csv') {
      let csv = 'Type,Title,Completed,Priority,DueDate,Created\n';
      todos.forEach(t => {
        csv += `Task,${t.title},${t.completed},${t.priority},${t.dueDate || ''},${t.createdAt}\n`;
      });
      notes.forEach(n => {
        csv += `Note,"${n.title || 'Untitled'}",,,,${n.createdAt}\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `todonotes-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Exported as CSV');
    } else {
      let md = '# TodoNotes ✅ Export\n\n';
      md += '## Tasks\n\n';
      todos.forEach(t => {
        md += `- [${t.completed ? 'x' : ' '}] ${t.title} (${t.priority})\n`;
      });
      md += '\n## Notes\n\n';
      notes.forEach(n => {
        md += `### ${n.title || 'Untitled'}\n\n${n.content}\n\n`;
      });
      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `todonotes-export-${new Date().toISOString().split('T')[0]}.md`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Exported as Markdown');
    }
    setShowExportMenu(false);
  };

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('todonotes_trash', JSON.stringify(deletedItems));
  }, [deletedItems]);

  // Delete functions
  const deleteTodo = (id: string) => {
    const deletedTodo = todos.find(t => t.id === id);
    setTodos(todos.filter(t => t.id !== id));
    toast.success('Task gelöscht', {
      action: {
        label: 'Undo',
        onClick: () => {
          if (deletedTodo) setTodos([deletedTodo, ...todos]);
        }
      },
      duration: 4000
    });
    setView('home');
  };

  const deleteAllCompleted = () => {
    const completed = todos.filter(t => t.completed);
    setTodos(todos.filter(t => !t.completed));
    toast.success(`${completed.length} completed tasks deleted`);
  };

  const archiveAllCompleted = () => {
    setTodos(todos.map(t => t.completed ? { ...t, archived: true } : t));
    toast.success('All completed tasks archived');
  };

  // Duplicate functions
  const duplicateTodo = (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      const newTodo = { ...todo, id: Date.now().toString(), title: `${todo.title} (copy)`, createdAt: new Date().toISOString() };
      setTodos([newTodo, ...todos]);
      toast.success('Task duplicated');
    }
  };

  const archiveTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: true, archived: true } : t));
    toast.success('Task archived');
  };

  const shareNote = async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note && navigator.share) {
      try {
        await navigator.share({
          title: note.title || 'Note',
          text: `${note.title}\n\n${note.content}`,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${note?.title}\n\n${note?.content}`);
      toast.success('Copied to clipboard!');
    }
  };

  const duplicateNote = (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      const newNote = { ...note, id: Date.now().toString(), title: note.title ? `${note.title} (copy)` : 'Copy', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      setNotes([newNote, ...notes]);
      toast.success('Note duplicated');
    }
  };

  const deleteNote = (id: string) => {
    const deletedNote = notes.find(n => n.id === id);
    setNotes(notes.filter(n => n.id !== id));
    toast.success('Note gelöscht', {
      action: {
        label: 'Undo',
        onClick: () => {
          if (deletedNote) setNotes([deletedNote, ...notes]);
        }
      },
      duration: 4000
    });
    setView('home');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + N = New Note
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setSelectedItem(null);
        setView('new-note');
      }
      // Cmd/Ctrl + T = New Task
      if ((e.metaKey || e.ctrlKey) && e.key === 't') {
        e.preventDefault();
        setSelectedItem(null);
        setView('new-todo');
      }
      // Cmd/Ctrl + / = Search
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setShowSearch(true);
      }
      // Cmd/Ctrl + D = Toggle Dark Mode
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        setIsDark(!isDark);
      }
      // Cmd+1/2/3 = Switch tabs
      if ((e.metaKey || e.ctrlKey) && e.key === '1') { e.preventDefault(); setTab('recent'); }
      if ((e.metaKey || e.ctrlKey) && e.key === '2') { e.preventDefault(); setTab('tasks'); }
      if ((e.metaKey || e.ctrlKey) && e.key === '3') { e.preventDefault(); setTab('notes'); }
      // ? = Show shortcuts
      if (e.key === '?' || (e.metaKey && e.key === '/')) { e.preventDefault(); setShowShortcuts(true); }
      // Cmd+Shift+N = Quick Note
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        setSelectedItem(null);
        setView('new-note');
      }
      // Escape = Close search or go home
      if (e.key === 'Escape') {
        if (showSearch) {
          setShowSearch(false);
          setSearchQuery('');
        } else if (view !== 'home') {
          setView('home');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, showSearch, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-center" />
      
      {/* Premium Header - Craft Style */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              {view !== 'home' && (
                <button 
                  onClick={() => setView('home')} 
                  className="btn-icon -ml-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <h1 className="text-lg font-semibold tracking-tight">
                {view === 'home' ? 'TodoNotes ✅' : view.includes('todo') ? 'Task' : 'Note'}
              </h1>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-0.5">
              {view === 'home' && (
                <button 
                  onClick={() => setShowSearch(true)} 
                  className="btn-icon"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
              <button 
                onClick={() => setIsDark(!isDark)} 
                className="btn-icon"
                title={isDark ? 'Light Mode' : 'Dark Mode'}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => setFocusMode(!focusMode)} 
                className="btn-icon"
                title={focusMode ? 'Exit Focus Mode' : 'Focus Mode'}
              >
                {focusMode ? <Sun className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
              </button>
              <div className="relative">
                <button 
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="btn-icon"
                  title="Export"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </button>
                {showExportMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-40 bg-surface border border-border rounded-xl shadow-lg overflow-hidden z-50"
                  >
                    <button onClick={() => exportData('json')} className="w-full px-4 py-2 text-left text-sm hover:bg-secondary/50">
                      📄 Export as JSON
                    </button>
                    <button onClick={() => exportData('markdown')} className="w-full px-4 py-2 text-left text-sm hover:bg-secondary/50">
                      📝 Export as Markdown
                    </button>
                    <button onClick={() => toast.success('PDF coming soon!')} className="w-full px-4 py-2 text-left text-sm hover:bg-secondary/50">
                      📄 Export as PDF
                    </button>
                    <button onClick={() => exportData('csv')} className="w-full px-4 py-2 text-left text-sm hover:bg-secondary/50">
                      📊 Export as CSV
                    </button>
                  </motion.div>
                )}
              </div>
              <button className="btn-icon">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl"
          >
            <div className="max-w-md mx-auto pt-16 px-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes and tasks..."
                  className="input pl-12 pr-4 py-4 text-lg"
                  autoFocus
                />
                <button
                  onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              {/* Search Results */}
              <div className="mt-6 space-y-2">
                {searchQuery && (
                  <>
                    {/* Tasks */}
                    {todos.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase())).map(todo => (
                      <motion.div
                        key={todo.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => { setSelectedItem(todo); setView('edit-todo'); setShowSearch(false); setSearchQuery(''); }}
                        className="card p-4 flex items-center gap-3 cursor-pointer"
                      >
                        <CheckSquare className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">{todo.title}</p>
                          <p className="text-xs text-muted-foreground">Task • {todo.priority}</p>
                        </div>
                      </motion.div>
                    ))}
                    {/* Notes */}
                    {notes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase())).map(note => (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => { setSelectedItem(note); setView('edit-note'); setShowSearch(false); setSearchQuery(''); }}
                        className="card p-4 flex items-center gap-3 cursor-pointer"
                      >
                        <FileText className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">{note.title || 'Untitled'}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{renderMarkdown(note.content.slice(0, 80))}</p>
                        </div>
                      </motion.div>
                    ))}
                    {todos.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && 
                     notes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No results found</p>
                    )}
                  </>
                )}
                {!searchQuery && (
                  <div className="text-center text-muted-foreground py-8">
                    <p>Start typing to search</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Help Modal */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center"
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="card p-6 max-w-sm w-full mx-4"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold mb-4">⌨️ Keyboard Shortcuts</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>New Note</span><kbd className="bg-secondary px-2 py-1 rounded">⌘ N</kbd></div>
                <div className="flex justify-between"><span>New Task</span><kbd className="bg-secondary px-2 py-1 rounded">⌘ T</kbd></div>
                <div className="flex justify-between"><span>Search</span><kbd className="bg-secondary px-2 py-1 rounded">⌘ /</kbd></div>
                <div className="flex justify-between"><span>Dark Mode</span><kbd className="bg-secondary px-2 py-1 rounded">⌘ D</kbd></div>
                <div className="flex justify-between"><span>Recent</span><kbd className="bg-secondary px-2 py-1 rounded">⌘ 1</kbd></div>
                <div className="flex justify-between"><span>Tasks</span><kbd className="bg-secondary px-2 py-1 rounded">⌘ 2</kbd></div>
                <div className="flex justify-between"><span>Notes</span><kbd className="bg-secondary px-2 py-1 rounded">⌘ 3</kbd></div>
              </div>
              <button onClick={() => setShowShortcuts(false)} className="btn-primary w-full mt-4">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-4 pb-24">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Daily Tip */}
              <div className="mb-4 p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl border border-primary/10">
                <p className="text-sm italic text-foreground/80">"{['Every day is a fresh start', 'Stay focused and never give up', 'Small steps lead to big changes', 'Your potential is limitless'][Math.floor(Math.random() * 4)]}"</p>
              </div>

              {/* Weather Widget */}
              <div className="mb-4 p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl border border-blue-500/20">
                <p className="text-sm">🌤️ Weather widget coming soon</p>
              </div>

              {/* Quick Actions - Craft Style */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setSelectedItem(null); setView('new-todo'); }}
                  className="card card-hover p-5 flex flex-col items-center gap-3"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center">
                    <CheckSquare className="w-7 h-7 text-primary" />
                  </div>
                  <div className="text-center">
                    <span className="font-semibold block">New Task</span>
                    <span className="text-xs text-muted-foreground">Add a to-do</span>
                  </div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setSelectedItem(null); setView('new-note'); }}
                  className="card card-hover p-5 flex flex-col items-center gap-3"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center">
                    <FileText className="w-7 h-7 text-primary" />
                  </div>
                  <div className="text-center">
                    <span className="font-semibold block">New Note</span>
                    <span className="text-xs text-muted-foreground">Capture ideas</span>
                  </div>
                </motion.button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="card p-3 text-center">
                  <p className="text-2xl font-bold text-primary">{todos.length}</p>
                  <p className="text-xs text-muted-foreground">Tasks</p>
                </div>
                <div className="card p-3 text-center">
                  <p className="text-2xl font-bold text-green-500">{todos.filter(t => t.completed).length}</p>
                  <p className="text-xs text-muted-foreground">Done</p>
                </div>
                <div className="card p-3 text-center">
                  <p className="text-2xl font-bold text-blue-500">{notes.length}</p>
                  <p className="text-xs text-muted-foreground">Notes</p>
                </div>
                <div className="card p-3 text-center">
                  <p className="text-2xl font-bold text-orange-500">🔥 {getStreak()}</p>
                  <p className="text-xs text-muted-foreground">Streak</p>
                </div>
                <div className="card p-3 text-center">
                  <p className="text-2xl font-bold text-yellow-500">🏆 {getStreak() > 0 ? Math.floor(getStreak() / 7) : 0}</p>
                  <p className="text-xs text-muted-foreground">Badges</p>
                </div>
              </div>

              {/* Progress Bar */}
              {todos.length > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{todos.filter(t => t.completed).length}/{todos.length}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-green-500 transition-all duration-500"
                      style={{ width: `${(todos.filter(t => t.completed).length / todos.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Daily Goals */}
              <div className="mb-4 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/20">
                <p className="text-sm font-medium mb-2">🎯 Daily Goals</p>
                <p className="text-xs text-muted-foreground">Complete 3 tasks to reach your daily goal!</p>
              </div>

              {/* Timer */}
              <div className="mb-4 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl border border-green-500/20">
                {timerActive || timerSeconds > 0 ? (
                  <div className="text-center">
                    <p className="text-3xl font-bold font-mono">{Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}</p>
                    <div className="flex gap-2 justify-center mt-2">
                      <button onClick={() => setTimerActive(!timerActive)} className="btn-secondary text-xs px-3 py-1">{timerActive ? '⏸️ Pause' : '▶️ Resume'}</button>
                      <button onClick={() => { setTimerActive(false); setTimerSeconds(0); }} className="btn-secondary text-xs px-3 py-1">⏹️ Stop</button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm font-medium mb-2">⏱️ Focus Timer</p>
                    <div className="flex gap-2 justify-center">
                      <button onClick={() => startTimer(5)} className="btn-secondary text-xs px-3 py-1">5m</button>
                      <button onClick={() => startTimer(15)} className="btn-secondary text-xs px-3 py-1">15m</button>
                      <button onClick={() => startTimer(25)} className="btn-secondary text-xs px-3 py-1">25m</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Tab Switcher - Premium Style */}
              {!focusMode && (
              <div className="flex gap-1 mb-4 p-1 bg-secondary/50 rounded-2xl">
                {(['recent', 'tasks', 'notes', 'today', 'weekly'] as const).map((t) => (
                  <motion.button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all ${
                      tab === t 
                        ? 'bg-surface shadow-sm text-foreground' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    whileTap={{ scale: 0.97 }}
                  >
                    {t === 'recent' ? 'Recent' : t === 'tasks' ? 'Tasks' : 'Notes'}
                  </motion.button>
                ))}
              </div>
              )}

              {/* Lists */}
              {tab === 'recent' && (
                <div className="space-y-2">
                  {[...todos.slice(0, 5), ...notes.slice(0, 5)]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 10)
                    .map((item) => ('title' in item && 'completed' in item ? (
                      <div key={item.id} onClick={() => { setSelectedItem(item as Todo); setView('edit-todo'); }} className="card p-4 flex items-center gap-3 cursor-pointer hover:border-primary/30">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${(item as Todo).completed ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                          {(item as Todo).completed && <CheckSquare className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate ${(item as Todo).completed ? 'line-through text-muted-foreground' : ''}`}>{item.title}</p>
                          <p className="text-xs text-muted-foreground">Task • {getRelativeTime(item.createdAt)}</p>
                        </div>
                      </div>
                    ) : (
                      <div key={item.id} onClick={() => { setSelectedItem(item as Note); setView('edit-note'); }} className="card p-4 cursor-pointer hover:border-primary/30">
                        <p className="font-medium truncate">{item.title || 'Untitled'}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{item.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">Note • {getRelativeTime(item.createdAt)}</p>
                      </div>
                    ))
                  )}
                  {todos.length === 0 && notes.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>Noch keine Einträge</p>
                      <p className="text-sm">Erstelle deinen ersten Task oder Note!</p>
                    </div>
                  )}
                </div>
              )}

              {tab === 'tasks' && (
                <div>
                  {/* Tag filter */}
                  {todos.flatMap(t => t.tags).filter((v, i, a) => a.indexOf(v) === i).length > 0 && (
                    <div className="flex gap-1 mb-3 overflow-x-auto pb-2">
                      <button
                        onClick={() => setFilterTag(null)}
                        className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                          !filterTag ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        All
                      </button>
                      {todos.flatMap(t => t.tags).filter((v, i, a) => a.indexOf(v) === i).map(tag => (
                        <button
                          key={tag}
                          onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                          className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                            filterTag === tag ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Show/hide completed toggle */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">
                      {todos.filter(t => !t.completed).length} remaining
                    </span>
                    <div className="flex items-center gap-2">
                      {/* Sort buttons */}
                      <div className="flex bg-secondary/50 rounded-lg p-0.5">
                        {(['date', 'priority', 'title'] as const).map((s) => (
                          <button
                            key={s}
                            onClick={() => setSortBy(s)}
                            className={`px-2 py-1 text-xs rounded-md transition-colors ${
                              sortBy === s ? 'bg-surface shadow-sm' : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {s === 'date' ? '📅' : s === 'priority' ? '🔺' : '📝'}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setShowCompleted(!showCompleted)}
                        className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        {showCompleted ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                  {todos
                    .filter(todo => showCompleted || !todo.completed)
                    .filter(todo => !todo.archived)
                    .filter(todo => !filterTag || todo.tags.includes(filterTag))
                    .sort((a, b) => {
                      // Pinned always first
                      if (a.pinned && !b.pinned) return -1;
                      if (!a.pinned && b.pinned) return 1;
                      if (sortBy === 'priority') {
                        const priorityOrder = { high: 0, medium: 1, low: 2 };
                        return priorityOrder[a.priority] - priorityOrder[b.priority];
                      } else if (sortBy === 'title') {
                        return a.title.localeCompare(b.title);
                      }
                      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    })
                    .map((todo) => (
                    <motion.div
                      key={todo.id}
                      drag="x"
                      dragConstraints={{ left: 0, right: 100 }}
                      onDragEnd={(e, { offset, velocity }) => {
                        if (offset.x > 100) {
                          // Swipe right - mark complete
                          setTodos(todos.map(t => t.id === todo.id ? { ...t, completed: !t.completed } : t));
                        } else if (offset.x < -100) {
                          // Swipe left - delete
                          deleteTodo(todo.id);
                        }
                      }}
                      className={`card p-4 flex items-center gap-3 cursor-pointer hover:border-primary/30 ${todo.color ? 'border-l-4' : ''}`}
                      style={{ borderLeftColor: todo.color || undefined }}
                    >
                      <button 
                        onClick={(e) => { e.stopPropagation(); setTodos(todos.map(t => t.id === todo.id ? { ...t, completed: !t.completed } : t)); }}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${todo.completed ? 'bg-primary border-primary' : 'border-muted-foreground'}`}
                      >
                        {todo.completed && <CheckSquare className="w-3 h-3 text-white" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setTodos(todos.map(t => t.id === todo.id ? { ...t, pinned: !t.pinned } : t))}
                            className={`text-lg ${todo.pinned ? 'text-primary' : 'text-muted-foreground/30'}`}
                          >
                            {todo.pinned ? '📌' : '📍'}
                          </button>
                          <p className={`font-medium truncate ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>{todo.title}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1 ml-6">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            todo.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          }`}>{todo.priority}</span>
                          {todo.dueDate && (() => {
                            const today = new Date().toISOString().split('T')[0];
                            const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
                            const isDueSoon = todo.dueDate === today || todo.dueDate === tomorrow;
                            return <span className={`text-xs ${isDueSoon ? 'text-orange-500 font-medium' : 'text-muted-foreground'}`}>📅 {todo.dueDate}</span>;
                          })()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {todos.filter(todo => showCompleted || !todo.completed).length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary/50 flex items-center justify-center">
                        <CheckSquare className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground font-medium">No tasks yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Tap + to create your first task</p>
                    </div>
                  )}
                  </div>
                </div>
              )}

              {tab === 'notes' && (
                <div className="space-y-2">
                  {/* Sort for notes */}
                  <div className="flex justify-end mb-2">
                    <div className="flex bg-secondary/50 rounded-lg p-0.5">
                      {(['date', 'title'] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => setSortBy(s)}
                          className={`px-2 py-1 text-xs rounded-md transition-colors ${
                            sortBy === s ? 'bg-surface shadow-sm' : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {s === 'date' ? '📅' : '📝'}
                        </button>
                      ))}
                    </div>
                  </div>
                  {notes
                    .sort((a, b) => {
                      // Pinned always first
                      if (a.pinned && !b.pinned) return -1;
                      if (!a.pinned && b.pinned) return 1;
                      if (sortBy === 'title') {
                        return (a.title || '').localeCompare(b.title || '');
                      }
                      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                    })
                    .map((note) => (
                      <motion.div
                        key={note.id}
                        drag="x"
                        dragConstraints={{ left: 0, right: 100 }}
                        onDragEnd={(e, { offset }) => {
                          if (offset.x > 100) {
                            duplicateNote(note.id);
                          } else if (offset.x < -100) {
                            deleteNote(note.id);
                          } else if (offset.x > 30 && offset.x < 100) {
                            shareNote(note.id);
                          }
                        }}
                        className="card p-4 cursor-pointer hover:border-primary/30"
                        onClick={() => { setSelectedItem(note); setView('edit-note'); }}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); setNotes(notes.map(n => n.id === note.id ? { ...n, pinned: !n.pinned } : n)); }}
                            className={`text-lg ${note.pinned ? 'text-primary' : 'text-muted-foreground/30'}`}
                          >
                            {note.pinned ? '📌' : '📍'}
                          </button>
                          <p className="font-medium truncate">{note.title || 'Untitled'}</p>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1 ml-6">{note.content}</p>
                        <p className="text-xs text-muted-foreground mt-2 ml-6">{getRelativeTime(note.updatedAt)}</p>
                      </motion.div>
                    ))}
                  {notes.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary/50 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground font-medium">No notes yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Tap + to capture your first note</p>
                    </div>
                  )}
                </div>
              )}

              {tab === 'today' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Today's Focus</h2>
                  {todos.filter(t => {
                    if (t.completed) return false;
                    const due = t.dueDate;
                    if (!due) return t.priority === 'high';
                    const today = new Date().toISOString().split('T')[0];
                    return due === today;
                  }).length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-500/10 flex items-center justify-center">
                        <span className="text-4xl">🎉</span>
                      </div>
                      <p className="text-muted-foreground font-medium">All done for today!</p>
                      <p className="text-xs text-muted-foreground mt-1">Enjoy your day! 🌟</p>
                    </div>
                  ) : (
                    todos.filter(t => {
                      if (t.completed) return false;
                      const due = t.dueDate;
                      if (!due) return t.priority === 'high';
                      const today = new Date().toISOString().split('T')[0];
                      return due === today;
                    }).map(todo => (
                      <div key={todo.id} onClick={() => { setSelectedItem(todo); setView('edit-todo'); }} className="card p-4 flex items-center gap-3 cursor-pointer hover:border-primary/30">
                        <button onClick={(e) => { e.stopPropagation(); setTodos(todos.map(t => t.id === todo.id ? { ...t, completed: true } : t)); }} className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${todo.completed ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                        </button>
                        <div>
                          <p className="font-medium">{todo.title}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${todo.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{todo.priority}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === 'weekly' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">📅 This Week</h2>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => {
                    const dayDate = new Date();
                    dayDate.setDate(dayDate.getDate() - dayDate.getDay() + i);
                    const dayStr = dayDate.toISOString().split('T')[0];
                    const dayTodos = todos.filter(t => t.dueDate === dayStr);
                    return dayTodos.length > 0 ? (
                      <div key={day} className="card p-3">
                        <p className="font-medium text-sm mb-2">{day} {dayDate.getDate()}</p>
                        {dayTodos.map(t => (
                          <div key={t.id} className="text-sm py-1">{t.title}</div>
                        ))}
                      </div>
                    ) : null;
                  })}
                  {todos.filter(t => t.dueDate).length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No tasks with due dates</p>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {(view === 'new-todo' || view === 'edit-todo') && (
            <TodoEditor
              key="todo-editor"
              todo={view === 'edit-todo' ? selectedItem as Todo : null}
              onSave={(todo) => {
                if (view === 'edit-todo' && selectedItem) {
                  setTodos(todos.map(t => t.id === selectedItem.id ? todo : t));
                } else {
                  setTodos([todo, ...todos]);
                }
                toast.success(view === 'edit-todo' ? 'Task aktualisiert' : 'Task erstellt');
                setView('home');
              }}
              onDelete={view === 'edit-todo' ? () => deleteTodo((selectedItem as Todo).id) : undefined}
            />
          )}

          {(view === 'new-note' || view === 'edit-note') && (
            <NoteEditor
              key="note-editor"
              note={view === 'edit-note' ? selectedItem as Note : null}
              onSave={(note) => {
                if (view === 'edit-note' && selectedItem) {
                  setNotes(notes.map(n => n.id === selectedItem.id ? note : n));
                } else {
                  setNotes([note, ...notes]);
                }
                toast.success(view === 'edit-note' ? 'Note aktualisiert' : 'Note erstellt');
                setView('home');
              }}
              onDelete={view === 'edit-note' ? () => deleteNote((selectedItem as Note).id) : undefined}
            />
          )}
        </AnimatePresence>
      </main>

      {/* FAB - Quick Capture */}
      {view === 'home' && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-primary to-primary/80 text-white rounded-2xl shadow-lg shadow-primary/25 flex items-center justify-center"
          aria-label="Add new item"
          onClick={() => {
            const now = Date.now();
            if (now - lastTapTime < 400) {
              // Double tap - quick add modal could go here
              toast.success('Tap + to add new item');
            }
            setLastTapTime(now);
            // Toggle between task and note based on last tab
            if (tab === 'tasks') {
              setSelectedItem(null);
              setView('new-note');
            } else {
              setSelectedItem(null);
              setView('new-todo');
            }
          }}
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      )}
    </div>
  );
}

// Todo Editor Component
function TodoEditor({ todo, onSave, onDelete }: { todo: Todo | null; onSave: (todo: Todo) => void; onDelete?: () => void }) {
  const [title, setTitle] = useState(todo?.title || '');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>(todo?.priority || 'medium');
  const [dueDate, setDueDate] = useState(todo?.dueDate || '');
  const [tags, setTags] = useState(todo?.tags.join(', ') || '');
  const [subtasks, setSubtasks] = useState(todo?.subtasks || []);
  const [newSubtask, setNewSubtask] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!title && subtasks.length === 0) return;
    
    const autoSaveTimer = setTimeout(() => {
      setIsSaving(true);
      localStorage.setItem('todonotes_todo_autosave', JSON.stringify({ title, priority, dueDate, tags, subtasks, savedAt: new Date().toISOString() }));
      setLastSaved(new Date());
      setTimeout(() => setIsSaving(false), 500);
    }, 30000);
    
    return () => clearTimeout(autoSaveTimer);
  }, [title, priority, dueDate, tags, subtasks]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      id: todo?.id || Date.now().toString(),
      title,
      completed: todo?.completed || false,
      priority,
      dueDate: dueDate || undefined,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      subtasks,
      createdAt: todo?.createdAt || new Date().toISOString(),
    });
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks([...subtasks, { id: Date.now().toString(), title: newSubtask, completed: false }]);
    setNewSubtask('');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      {/* Auto-save indicator */}
      <div className="flex items-center justify-between mb-2">
        {isSaving ? (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1 }}>●</motion.span> Saving...
          </span>
        ) : lastSaved ? (
          <span className="text-xs text-muted-foreground">✓ Saved</span>
        ) : <span />}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task Titel..."
            className="input text-xl font-semibold"
            autoFocus
          />
          {/* Quick templates */}
          <div className="flex gap-2 flex-wrap">
            {['📋 Meeting', '💻 Code', '📞 Call', '📧 Email', '🛒 Shopping', '🏋️ Gym', '📚 Study', '🎵 Practice'].map(t => (
              <button key={t} onClick={() => setTitle(t)} className="text-xs bg-secondary px-2 py-1 rounded-full">{t}</button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          {(['high', 'medium', 'low'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={`flex-1 py-2 rounded-lg font-medium capitalize transition-all ${
                priority === p
                  ? p === 'high' ? 'bg-red-500 text-white' : p === 'medium' ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'
                  : 'bg-background border border-border text-muted-foreground'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Fälligkeitsdatum</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Tags (kommagetrennt)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="z.B. Arbeit, Privat, Wichtig"
            className="input"
          />
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Unteraufgaben</label>
          <div className="space-y-2">
            {subtasks.map((st, i) => (
              <div key={st.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={st.completed}
                  onChange={() => setSubtasks(subtasks.map((s, idx) => idx === i ? { ...s, completed: !s.completed } : s))}
                  className="w-4 h-4 rounded"
                />
                <span className={st.completed ? 'line-through text-muted-foreground' : ''}>{st.title}</span>
                <button type="button" onClick={() => setSubtasks(subtasks.filter((_, idx) => idx !== i))} className="ml-auto text-red-500">×</button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Neue Unteraufgabe..."
                className="input flex-1"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
              />
              <button type="button" onClick={addSubtask} className="btn-secondary px-4">+</button>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          {onDelete && (
            <button type="button" onClick={onDelete} className="btn-secondary text-red-500 border-red-200 dark:border-red-800">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button type="submit" className="btn-primary flex-1">
            Speichern
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// Note Editor Component
function NoteEditor({ note, onSave, onDelete }: { note: Note | null; onSave: (note: Note) => void; onDelete?: () => void }) {
  const [title, setTitle] = useState(note?.title || '');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const commonEmojis = ['📝', '💡', '🎯', '🔥', '⭐', '💰', '📚', '🏃', '🎉', '❤️'];
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState(note?.tags.join(', ') || '');
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
  const [selectedSlashIndex, setSelectedSlashIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Voice recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;
    const SpeechRecognition = (window.SpeechRecognition || window.webkitSpeechRecognition);
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setContent(prev => prev + ' ' + transcript);
    };
    if (isListening) recognition.start();
    else recognition.stop();
    return () => recognition.stop();
  }, [isListening]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!title && !content) return;
    
    const autoSaveTimer = setTimeout(() => {
      setIsSaving(true);
      // Auto-save to localStorage
      localStorage.setItem('todonotes_autosave', JSON.stringify({ title, content, tags, savedAt: new Date().toISOString() }));
      setLastSaved(new Date());
      setTimeout(() => setIsSaving(false), 500);
    }, 30000);
    
    return () => clearTimeout(autoSaveTimer);
  }, [title, content, tags]);

  // Handle image paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const base64 = event.target?.result as string;
              // Insert image markdown at cursor position
              const imageMarkdown = `\n![image](${base64})\n`;
              setContent(prev => prev + imageMarkdown);
            };
            reader.readAsDataURL(file);
          }
          break;
        }
      }
    };
    
    const textarea = textareaRef.current;
    textarea?.addEventListener('paste', handlePaste);
    return () => textarea?.removeEventListener('paste', handlePaste);
  }, []);

  const slashCommands = [
    { icon: '📝', label: 'Text', description: 'Plain text', insert: '' },
    { icon: '📋', label: 'List', description: 'Bullet list', insert: '\n- ' },
    { icon: '☑️', label: 'Checklist', description: 'Todo list', insert: '\n- [ ] ' },
    { icon: '🔖', label: 'Heading 1', description: 'Large heading', insert: '\n# ' },
    { icon: '🔖', label: 'Heading 2', description: 'Medium heading', insert: '\n## ' },
    { icon: '🔖', label: 'Heading 3', description: 'Small heading', insert: '\n### ' },
    { icon: '💬', label: 'Quote', description: 'Quote block', insert: '\n> ' },
    { icon: '```', label: 'Code', description: 'Code block', insert: '\n```\n\n```' },
  ];

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    
    // Check for slash command
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPos);
    const lastSlashIndex = textBeforeCursor.lastIndexOf('\n');
    const currentLine = textBeforeCursor.slice(lastSlashIndex);
    
    if (currentLine.startsWith('/')) {
      setShowSlashMenu(true);
      setSelectedSlashIndex(0);
    } else if (showSlashMenu && !currentLine.startsWith('/')) {
      setShowSlashMenu(false);
    }
  };

  const insertSlashCommand = (insert: string) => {
    const cursorPos = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = content.slice(0, cursorPos);
    const lastNewline = textBeforeCursor.lastIndexOf('\n');
    const newContent = textBeforeCursor.slice(0, lastNewline) + insert + content.slice(cursorPos);
    setContent(newContent);
    setShowSlashMenu(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSlashMenu) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSlashIndex(i => (i + 1) % slashCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSlashIndex(i => (i - 1 + slashCommands.length) % slashCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        insertSlashCommand(slashCommands[selectedSlashIndex].insert);
      } else if (e.key === 'Escape') {
        setShowSlashMenu(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: note?.id || Date.now().toString(),
      title,
      content,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: note?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      {/* Auto-save indicator */}
      <div className="flex items-center justify-between mb-2">
        {isSaving ? (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1 }}>●</motion.span> Saving...
          </span>
        ) : lastSaved ? (
          <span className="text-xs text-muted-foreground">✓ Saved</span>
        ) : <span />}
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(`${title}\n\n${content}`);
            toast.success('Copied to clipboard!');
          }}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          📋 Copy
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      🖨️ Print
                    </button>
        </button>
        <button
          type="button"
          onClick={() => setIsListening(!isListening)}
          className={`text-xs ${isListening ? 'text-red-500' : 'text-muted-foreground'}`}
        >
          {isListening ? '🎙️ Stop' : '🎙️ Voice'}
        </button>
        <span className="text-xs text-muted-foreground">
          {content.split(/\s+/).filter(Boolean).length} words
        </span>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Titel..."
          className="input text-xl font-semibold"
          autoFocus
        />
        <div className="flex gap-1 mb-2">
          {commonEmojis.map(e => (
            <button key={e} onClick={() => setTitle(title + ' ' + e)} className="hover:bg-secondary p-1 rounded">{e}</button>
          ))}
        </div>

        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          placeholder="Schreibe deine Note... (Markdown support)"
          className="input min-h-[300px] resize-none font-mono text-sm"
        />

        {/* Slash Command Menu */}
        {showSlashMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute z-50 w-64 bg-surface border border-border rounded-xl shadow-lg overflow-hidden"
            style={{ bottom: '50%', left: '50%', transform: 'translateX(-50%)' }}
          >
            <div className="p-2 border-b border-border">
              <p className="text-xs text-muted-foreground">Commands</p>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {slashCommands.map((cmd, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => insertSlashCommand(cmd.insert)}
                  className={`w-full px-3 py-2 flex items-center gap-3 text-left transition-colors ${
                    i === selectedSlashIndex ? 'bg-primary/10' : 'hover:bg-secondary/50'
                  }`}
                >
                  <span className="text-lg">{cmd.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{cmd.label}</p>
                    <p className="text-xs text-muted-foreground">{cmd.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (kommagetrennt)"
          className="input"
        />

        <div className="flex gap-2 pt-4">
          {onDelete && (
            <button type="button" onClick={onDelete} className="btn-secondary text-red-500 border-red-200 dark:border-red-800">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button type="submit" className="btn-primary flex-1">
            Speichern
          </button>
        </div>
      </form>
    </motion.div>
  );
}
