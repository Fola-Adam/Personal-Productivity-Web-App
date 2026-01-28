// Data storage - everything lives here
let todos = [];
let notes = [];
let goals = [];
let currentFilter = 'all';
let editingNoteId = null;

// Load data from localStorage on page load
window.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    initializeApp();
});

/* Initialize app: bind UI event handlers, load initial state, and perform
   the first render. Responsible for wiring tabs, todo/note/goal controls,
   modal handlers, and updating header/goal stats. */
function initializeApp() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Todo section
    document.getElementById('add-todo-btn').addEventListener('click', addTodo);
    document.getElementById('todo-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });
    document.getElementById('clear-completed').addEventListener('click', clearCompletedTodos);

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => filterTodos(btn.dataset.filter));
    });

    // Notes section
    document.getElementById('add-note-btn').addEventListener('click', addNote);
    document.getElementById('clear-notes').addEventListener('click', clearAllNotes);
    document.getElementById('note-content').addEventListener('input', updateCharCount);

    // Modal handlers
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    document.getElementById('cancel-edit-btn').addEventListener('click', closeModal);
    document.getElementById('save-edit-btn').addEventListener('click', saveNoteEdit);

    // Goals section
    document.getElementById('add-goal-btn').addEventListener('click', addGoal);
    document.getElementById('goal-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addGoal();
    });
    document.getElementById('clear-goals').addEventListener('click', clearCompletedGoals);

    // Initial render
    renderTodos();
    renderNotes();
    renderGoals();
    updateStats();
}

// Tab switching: toggle the active tab button and associated content pane
// Keeps the UI in sync when the user switches between To-Dos, Notes, and Goals
function switchTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Add active class to clicked tab and corresponding content
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

// ========== TODO FUNCTIONS ==========
/*
 Add a new todo:
 - validate input and read priority
 - create a todo object with id, text, completed flag, priority, and timestamp
 - append to `todos`, persist to localStorage, and refresh UI and stats
*/
function addTodo() {
    const input = document.getElementById('todo-input');
    const priority = document.getElementById('todo-priority').value;
    const text = input.value.trim();

    if (text === '') return; // Don't add empty todos

    const todo = {
        id: Date.now(),
        text: text,
        completed: false,
        priority: priority,
        createdAt: new Date().toISOString()
    };

    todos.push(todo);
    input.value = '';
    saveToStorage();
    renderTodos();
    updateStats();
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveToStorage();
        renderTodos();
        updateStats();
    }
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveToStorage();
    renderTodos();
    updateStats();
}

function filterTodos(filter) {
    currentFilter = filter;

    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

    renderTodos();
}

function clearCompletedTodos() {
    if (confirm('Delete all completed tasks?')) {
        todos = todos.filter(t => !t.completed);
        saveToStorage();
        renderTodos();
        updateStats();
    }
}

/*
 Render todos according to `currentFilter` (all/active/completed).
 Updates the DOM list or shows an empty state and keeps action handlers
 (toggle/delete) wired via inline handlers in the generated HTML.
*/
function renderTodos() {
    const list = document.getElementById('todo-list');
    const emptyState = document.getElementById('empty-state-todos');

    // Filter todos based on current filter
    let filteredTodos = todos;
    if (currentFilter === 'active') {
        filteredTodos = todos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(t => t.completed);
    }

    // Show empty state if no todos
    if (filteredTodos.length === 0) {
        list.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    list.style.display = 'block';
    emptyState.style.display = 'none';

    list.innerHTML = filteredTodos.map(todo => `
        <li class="${todo.completed ? 'completed' : ''} priority-${todo.priority}">
            <input type="checkbox" class="item-checkbox" ${todo.completed ? 'checked' : ''} 
                   onchange="toggleTodo(${todo.id})">
            <span class="item-text">${escapeHtml(todo.text)}</span>
            <div class="item-actions">
                <button class="delete-btn" onclick="deleteTodo(${todo.id})">Delete</button>
            </div>
        </li>
    `).join('');
}

// ========== NOTES FUNCTIONS ==========
/*
 Add a new note:
 - validate title + content
 - create note object with id, title, content, and timestamp
 - append to `notes`, persist, and re-render notes list
*/
function addNote() {
    const titleInput = document.getElementById('note-title');
    const contentInput = document.getElementById('note-content');
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (title === '' || content === '') {
        alert('Please enter both title and content');
        return;
    }

    const note = {
        id: Date.now(),
        title: title,
        content: content,
        createdAt: new Date().toISOString()
    };

    notes.push(note);
    titleInput.value = '';
    contentInput.value = '';
    updateCharCount();
    saveToStorage();
    renderNotes();
}

function deleteNote(id) {
    if (confirm('Delete this note?')) {
        notes = notes.filter(n => n.id !== id);
        saveToStorage();
        renderNotes();
    }
}

function openEditModal(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    editingNoteId = id;
    document.getElementById('edit-note-title').value = note.title;
    document.getElementById('edit-note-content').value = note.content;
    document.getElementById('edit-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('edit-modal').classList.add('hidden');
    editingNoteId = null;
}

function saveNoteEdit() {
    if (!editingNoteId) return;

    const note = notes.find(n => n.id === editingNoteId);
    if (note) {
        note.title = document.getElementById('edit-note-title').value.trim();
        note.content = document.getElementById('edit-note-content').value.trim();

        if (note.title === '' || note.content === '') {
            alert('Title and content cannot be empty');
            return;
        }

        saveToStorage();
        renderNotes();
        closeModal();
    }
}

function clearAllNotes() {
    if (confirm('Delete all notes? This cannot be undone!')) {
        notes = [];
        saveToStorage();
        renderNotes();
    }
}

function updateCharCount() {
    const content = document.getElementById('note-content').value;
    document.getElementById('char-count').textContent = content.length;
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/*
 Render saved notes. Shows a grid of note cards or an empty state when none exist.
 Uses `formatDate()` for timestamps and escapes user content before inserting into HTML.
*/
function renderNotes() {
    const container = document.getElementById('notes-list');
    const emptyState = document.getElementById('empty-state-notes');

    if (notes.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    container.style.display = 'grid';
    emptyState.style.display = 'none';

    container.innerHTML = notes.map(note => `
        <div class="note-card">
            <div class="timestamp">${formatDate(note.createdAt)}</div>
            <h3>${escapeHtml(note.title)}</h3>
            <p>${escapeHtml(note.content)}</p>
            <div class="note-actions">
                <button class="edit-btn" onclick="openEditModal(${note.id})">Edit</button>
                <button class="delete-btn" onclick="deleteNote(${note.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// ========== GOALS FUNCTIONS ==========
/*
 Add a goal:
 - validate text, read optional deadline and category
 - create goal object and persist to `goals`
 - refresh UI and update goal progress stats
*/
function addGoal() {
    const input = document.getElementById('goal-input');
    const deadline = document.getElementById('goal-deadline').value;
    const category = document.getElementById('goal-category').value;
    const text = input.value.trim();

    if (text === '') return;

    const goal = {
        id: Date.now(),
        text: text,
        completed: false,
        deadline: deadline,
        category: category,
        createdAt: new Date().toISOString()
    };

    goals.push(goal);
    input.value = '';
    document.getElementById('goal-deadline').value = '';
    saveToStorage();
    renderGoals();
    updateGoalStats();
}

function toggleGoal(id) {
    const goal = goals.find(g => g.id === id);
    if (goal) {
        goal.completed = !goal.completed;
        saveToStorage();
        renderGoals();
        updateGoalStats();
    }
}

function deleteGoal(id) {
    if (confirm('Delete this goal?')) {
        goals = goals.filter(g => g.id !== id);
        saveToStorage();
        renderGoals();
        updateGoalStats();
    }
}

function clearCompletedGoals() {
    if (confirm('Delete all completed goals?')) {
        goals = goals.filter(g => !g.completed);
        saveToStorage();
        renderGoals();
        updateGoalStats();
    }
}

function isOverdue(deadline) {
    if (!deadline) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    return deadlineDate < today;
}

/*
 Render goals list. Shows each goal with category, deadline, overdue state, and completion checkbox.
 Updates empty state when there are no goals and applies overdue styling via `isOverdue()`.
*/
function renderGoals() {
    const list = document.getElementById('goals-list');
    const emptyState = document.getElementById('empty-state-goals');

    if (goals.length === 0) {
        list.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    list.style.display = 'block';
    emptyState.style.display = 'none';

    list.innerHTML = goals.map(goal => {
        const overdue = !goal.completed && isOverdue(goal.deadline);
        const deadlineText = goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No deadline';

        return `
            <li class="${goal.completed ? 'completed' : ''}">
                <div class="goal-header">
                    <input type="checkbox" class="item-checkbox" ${goal.completed ? 'checked' : ''} 
                           onchange="toggleGoal(${goal.id})">
                    <span class="goal-category ${goal.category}">${goal.category}</span>
                    <span class="goal-deadline ${overdue ? 'overdue' : ''}">${deadlineText}</span>
                </div>
                <div class="goal-content">
                    <span class="item-text">${escapeHtml(goal.text)}</span>
                    <div class="item-actions">
                        <button class="delete-btn" onclick="deleteGoal(${goal.id})">Delete</button>
                    </div>
                </div>
            </li>
        `;
    }).join('');
}

// ========== STATS & UTILITIES ==========

/*
 Update header stats: total tasks, completed tasks, and active (remaining) tasks.
 Called after any operation that mutates `todos` (add/toggle/delete/clear).
*/
function updateStats() {
    const totalTasks = todos.length;
    const completedTasks = todos.filter(t => t.completed).length;
    const activeTasks = totalTasks - completedTasks;

    document.getElementById('task-count').textContent = totalTasks;
    document.getElementById('completed-count').textContent = completedTasks;
    document.getElementById('active-count').textContent = activeTasks;
}

function updateGoalStats() {
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.completed).length;
    const percentage = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    document.getElementById('goals-progress').textContent = `${percentage}% Complete`;
}

// Escape text to prevent XSS when inserting user content into the DOM
// Uses a DOM text assignment to safely encode characters
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== LOCAL STORAGE ==========

function saveToStorage() {
    localStorage.setItem('productivity_todos', JSON.stringify(todos));
    localStorage.setItem('productivity_notes', JSON.stringify(notes));
    localStorage.setItem('productivity_goals', JSON.stringify(goals));
}

function loadFromStorage() {
    const savedTodos = localStorage.getItem('productivity_todos');
    const savedNotes = localStorage.getItem('productivity_notes');
    const savedGoals = localStorage.getItem('productivity_goals');

    if (savedTodos) todos = JSON.parse(savedTodos);
    if (savedNotes) notes = JSON.parse(savedNotes);
    if (savedGoals) goals = JSON.parse(savedGoals);
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('edit-modal');
    if (e.target === modal) {
        closeModal();
    }
});