# TodoNotes App - SPEC.md

## ✅ Projekt Info
- **Name:** TodoNotes
- **Typ:** Todo + Notes Web App (PWA)
- **Tech:** React + TypeScript + Tailwind + Framer Motion
- **Focus:** Design & Usability (Mobile First)

---

## ✅ Anforderungen (Stand 09.03.2026)

### 1. Design
- [x] Mischung aus minimalistisch + Karten
- [x] Startseite: Switch zwischen New Task/Note + Bestehende
- [x] Light Mode (Default) + Dark Mode (System-Setting)
- [x] Notion-ähnliches Design mit Markdown
- [x] Modern & clean
- [x] Benutzer-definierbare Akzentfarben (Settings)

### 2. Todos Features
- [x] Checkbox
- [x] Prioritäten (High/Medium/Low)
- [x] Fälligkeitsdatum
- [x] Tags/Kategorien
- [x] Unter-Todos (Subtasks)
- [x] Überschriften & Formatierung (Markdown)

### 3. Notes Features
- [x] Text-Notes mit Markdown Support
- [x] Tags/Kategorien
- [x] Bilder support

### 4. Voice/Audio Features
- [x] Speech-to-Text (Diktierfunktion)
- [x] Lokal ohne Internet (Whisper)
- [x] KI-Integration für Strukturierung (AI-Button)
- [x] Sprachbefehle für schnelle Erstellung

### 5. Data Storage
- [x] Lokal (localStorage) - Phase 1
- [ ] Später: Supabase/Cloud Sync

### 6. Plattform
- [x] PWA (iPhone, Android, PC)
- [x] Responsive (Mobile First)

---

## 📱 UI/UX Plan

### Startseite:
```
┌─────────────────────┐
│  ☀️ TodoNotes      │
│  ─────────────     │
│  [+ New Task]      │
│  [+ New Note]      │
│                     │
│  ─── Recent ───    │
│  📝 Task 1        │
│  📄 Note 1        │
│  ...              │
│                     │
│  [Tasks] [Notes]   │  ← Bottom Nav
└─────────────────────┘
```

### New Task/Note Screen:
- Großer Input-Bereich
- Markdown Toolbar
- Voice Input Button (🎤)
- AI Optimize Button (✨)
- Save Button

---

## 🎯 MVP (Phase 1)

### Must-Have:
1. ✅ Create/Edit/Delete Todos
2. ✅ Create/Edit/Delete Notes
3. ✅ Markdown Support
4. ✅ Local Storage
5. ✅ Light/Dark Mode
6. ✅ Mobile Responsive
7. ✅ PWA (installierbar)

### Nice-to-Have (Phase 2):
- Voice Input (Speech-to-Text)
- AI Assistant
- Tags/Categories
- Subtasks
- Due Dates
- Export/Import
- Cloud Sync

---

## 🚀 Entwicklung

**Branch:** dev
**Main Agent:** Cody
**Subagents:** bis zu 5+ parallel

**Phasen:**
1. Setup + Basic UI
2. Todo Feature
3. Notes Feature  
4. Voice Input
5. Polish + PWA
6. Code Review + Debug
