# Productivity Hub ✅

**A lightweight, static Productivity web app** for managing tasks, notes, and goals. Built with plain HTML, CSS, and JavaScript — no build step required.

---

## 🔧 Features

- To-Do list with priorities (Low / Medium / High) and filter views (All / Active / Completed)
- Notes with title + content, edit modal, and character count
- Goals with category, optional deadline, and progress percentage
- Header stats: total tasks, completed tasks, and items remaining
- Data persistence using `localStorage` (works offline)
- Responsive layout and accessible UI patterns
- Security: basic XSS protection via `escapeHtml()` in `script.js`

---

## 🧭 Quick Start

1. Clone or download the repo
2. Open `index.html` in your browser (or run a local server):

```bash
# from project root (recommended for some browsers):
# Python 3
python -m http.server 8000
# then open http://localhost:8000
```

> Tip: The app is static — no backend required.

---

## 📝 Usage

- Add tasks via the **To-Do** tab. Set priority and press **Add Task** (or Enter).
- Use filter buttons to view **All**, **Active**, or **Completed** tasks.
- Click the checkbox to toggle completion, or **Delete** to remove a task.
- Save notes in the **Notes** tab. Use **Edit** to modify existing notes.
- Create goals with a category and deadline in **Goals**. Check them off when complete.
- Use **Clear Completed** (or **Clear All Notes**) to remove items in bulk (confirmation required).

---

## 🧩 Project Structure

- `index.html` — main markup and UI scaffolding
- `styles.css` — design system using CSS variables and responsive rules
- `script.js` — application logic (todos, notes, goals, storage, rendering)
- `readme.md` — this file

---

## 💡 Developer Notes

- Main entry points:
  - `initializeApp()` sets up event listeners
  - `addTodo()`, `addNote()`, `addGoal()` handle item creation
  - `renderTodos()`, `renderNotes()`, `renderGoals()` update the UI
- Data is stored in arrays (`todos`, `notes`, `goals`) and saved to `localStorage`
- Consider adding:
  - Dark mode toggle
  - Markdown support for notes
  - Sync to a backend / account-based storage
  - Due date picker or reminders

---

## ⚠️ Known Limitations

- No authentication or remote sync (local-only storage)
- No tests included yet
- Some UI features are marked TODO in the code (e.g., due date picker for todos)

---

## 🤝 Contributing

Open an issue or submit a PR. File a bug report or feature request with a short description and steps to reproduce.

---

## 📄 License

MIT License — feel free to reuse and adapt. If you'd like a different license, mention it in an issue.

---

Happy building! ✨


