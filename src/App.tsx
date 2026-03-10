/**
 * TodoNotes - Clean Todo & Notes App
 * =================================
 * Mobile First, PWA, Light/Dark Mode
 */

import { useState, useEffect } from 'react';
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
  tags: string[];
  subtasks: { id: string; title: string; completed: boolean }[];
  createdAt: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Storage Keys
const TODOS_KEY = 'todonotes_todos';
const NOTES_KEY = 'todonotes_notes';
const THEME_KEY = 'todonotes_theme';

// Theme Hook
function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY);
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
  const [tab, setTab] = useState<'recent' | 'tasks' | 'notes'>('recent');
  const [todos, setTodos] = useState<Todo[]>(() => JSON.parse(localStorage.getItem(TODOS_KEY) || '[]'));
  const [notes, setNotes] = useState<Note[]>(() => JSON.parse(localStorage.getItem(NOTES_KEY) || '[]'));
  const [selectedItem, setSelectedItem] = useState<Todo | Note | null>(null);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  }, [notes]);

  // Delete functions
  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
    toast.success('Task gelöscht');
    setView('home');
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
    toast.success('Note gelöscht');
    setView('home');
  };

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
                {view === 'home' ? 'TodoNotes' : view.includes('todo') ? 'Task' : 'Note'}
              </h1>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-0.5">
              {view === 'home' && (
                <button className="btn-icon">
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
              <button className="btn-icon">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

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

              {/* Tab Switcher */}
              <div className="flex gap-2 mb-4 p-1 bg-background rounded-xl">
                {(['recent', 'tasks', 'notes'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                      tab === t 
                        ? 'bg-surface shadow-sm text-primary' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t === 'recent' ? 'Recent' : t === 'tasks' ? 'Tasks' : 'Notes'}
                  </button>
                ))}
              </div>

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
                          <p className="text-xs text-muted-foreground">Task • {new Date(item.createdAt).toLocaleDateString('de')}</p>
                        </div>
                      </div>
                    ) : (
                      <div key={item.id} onClick={() => { setSelectedItem(item as Note); setView('edit-note'); }} className="card p-4 cursor-pointer hover:border-primary/30">
                        <p className="font-medium truncate">{item.title || 'Untitled'}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{item.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">Note • {new Date(item.createdAt).toLocaleDateString('de')}</p>
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
                <div className="space-y-2">
                  {todos.map((todo) => (
                    <div key={todo.id} onClick={() => { setSelectedItem(todo); setView('edit-todo'); }} className="card p-4 flex items-center gap-3 cursor-pointer hover:border-primary/30">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setTodos(todos.map(t => t.id === todo.id ? { ...t, completed: !t.completed } : t)); }}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${todo.completed ? 'bg-primary border-primary' : 'border-muted-foreground'}`}
                      >
                        {todo.completed && <CheckSquare className="w-3 h-3 text-white" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>{todo.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            todo.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          }`}>{todo.priority}</span>
                          {todo.dueDate && <span className="text-xs text-muted-foreground">📅 {todo.dueDate}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                  {todos.length === 0 && <p className="text-center text-muted-foreground py-8">Keine Tasks</p>}
                </div>
              )}

              {tab === 'notes' && (
                <div className="space-y-2">
                  {notes.map((note) => (
                    <div key={note.id} onClick={() => { setSelectedItem(note); setView('edit-note'); }} className="card p-4 cursor-pointer hover:border-primary/30">
                      <p className="font-medium truncate">{note.title || 'Untitled'}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{note.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">{new Date(note.updatedAt).toLocaleDateString('de')}</p>
                    </div>
                  ))}
                  {notes.length === 0 && <p className="text-center text-muted-foreground py-8">Keine Notes</p>}
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

      {/* FAB */}
      {view === 'home' && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
          onClick={() => setTab(tab === 'tasks' ? (setSelectedItem(null), setView('new-note')) : (setSelectedItem(null), setView('new-todo')))}
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
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState(note?.tags.join(', ') || '');

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
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Titel..."
          className="input text-xl font-semibold"
          autoFocus
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Schreibe deine Note... (Markdown support)"
          className="input min-h-[300px] resize-none font-mono text-sm"
        />

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
