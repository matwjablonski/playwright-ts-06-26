import './styles.css';
import { ensureRoute, getRoute, navigate } from './router';
import { isAuthenticated, setAuthenticated } from './storage';
import {
  createTodo,
  filterTodos,
  getPriorityLabel,
  isOverdue,
  loadInitialTodos,
  saveTodos,
  validateDraft,
} from './todos-service';
import type { FilterPriority, FilterStatus, Priority, Todo, TodoDraft } from './types';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Missing #app element');
}

let todos: Todo[] = [];
let loadError = '';
let statusFilter: FilterStatus = 'all';
let priorityFilter: FilterPriority = 'all';
let searchQuery = '';
let editingId: number | null = null;
let draft: TodoDraft = emptyDraft();
let formErrors: Record<string, string> = {};
let message = '';

window.addEventListener('hashchange', render);

ensureRoute();
render();

function emptyDraft(): TodoDraft {
  return {
    task: '',
    description: '',
    priority: '',
    due_date: '',
  };
}

async function hydrateTodos(): Promise<void> {
  if (todos.length || loadError) {
    return;
  }

  try {
    todos = await loadInitialTodos();
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Nieznany błąd pobierania danych.';
  }
}

async function render(): Promise<void> {
  ensureRoute();
  const route = getRoute();

  if (route === 'login') {
    renderLogin();
    return;
  }

  await hydrateTodos();

  if (route === 'about') {
    renderShell(renderAbout());
    return;
  }

  renderShell(renderTodos());
}

function renderLogin(): void {
  app.innerHTML = `
    <main class="login-page">
      <form class="login-panel" data-testid="login-form" novalidate>
        <h1 class="page-title">TodoLab</h1>
        <p class="muted">Zaloguj się, aby przejść do aplikacji testowej.</p>
        <div class="field">
          <label for="password">Hasło</label>
          <input id="password" name="password" type="password" autocomplete="current-password" required />
        </div>
        <button class="primary" type="submit">Zaloguj</button>
        <p class="error-message" role="alert" data-testid="login-error"></p>
      </form>
    </main>
  `;

  const form = app.querySelector<HTMLFormElement>('form');
  const input = app.querySelector<HTMLInputElement>('#password');
  const error = app.querySelector<HTMLElement>('[data-testid="login-error"]');

  form?.addEventListener('submit', (event) => {
    event.preventDefault();

    if (input?.value === 'admin123') {
      setAuthenticated(true);
      navigate('todos');
      return;
    }

    if (error) {
      error.textContent = 'Nieprawidłowe hasło.';
    }
  });
}

function renderShell(content: string): void {
  const route = getRoute();

  app.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <h1 class="brand">TodoLab</h1>
        <nav class="nav" aria-label="Główna nawigacja">
          <a href="#/todos" ${route === 'todos' ? 'aria-current="page"' : ''}>Lista zadań</a>
          <a href="#/about" ${route === 'about' ? 'aria-current="page"' : ''}>O aplikacji</a>
          <button type="button" data-action="logout">Wyloguj</button>
        </nav>
      </header>
      <main class="main">
        ${content}
      </main>
    </div>
  `;

  app.querySelector('[data-action="logout"]')?.addEventListener('click', () => {
    setAuthenticated(false);
    navigate('login');
  });

  bindCurrentRoute();
}

function renderTodos(): string {
  if (!isAuthenticated()) {
    return '';
  }

  const visibleTodos = filterTodos(todos, statusFilter, priorityFilter, searchQuery);
  const activeCount = todos.filter((todo) => !todo.done).length;
  const completedCount = todos.filter((todo) => todo.done).length;
  const overdueCount = todos.filter(isOverdue).length;

  return `
    <section aria-labelledby="todos-title">
      <div class="page-header">
        <div>
          <h2 id="todos-title" class="page-title">Lista zadań</h2>
          <p class="muted">Aplikacja warsztatowa do ćwiczenia testów Playwright.</p>
        </div>
        <div class="button-row">
          <button type="button" data-action="export">Eksportuj JSON</button>
          <button type="button" data-action="report">Otwórz raport</button>
        </div>
      </div>

      ${message ? `<p class="status-message" role="status">${message}</p>` : ''}
      ${loadError ? `<p class="error-message" role="alert">${loadError}</p>` : ''}

      <div class="stats" data-testid="todo-stats">
        <div class="stat"><strong>${todos.length}</strong><span>Wszystkie</span></div>
        <div class="stat"><strong>${activeCount}</strong><span>Aktywne</span></div>
        <div class="stat"><strong>${completedCount}</strong><span>Ukończone</span></div>
        <div class="stat"><strong>${overdueCount}</strong><span>Przeterminowane</span></div>
      </div>

      <div class="layout">
        ${renderForm()}
        <div>
          ${renderToolbar()}
          ${renderList(visibleTodos)}
        </div>
      </div>
    </section>
  `;
}

function renderForm(): string {
  const isEditing = editingId !== null;

  return `
    <form class="todo-form" data-testid="todo-form" novalidate>
      <h2>${isEditing ? 'Edycja zadania' : 'Dodaj zadanie'}</h2>
      <div class="field">
        <label for="task">Tytuł</label>
        <input id="task" name="task" value="${escapeHtml(draft.task)}" aria-describedby="task-error" />
        <p id="task-error" class="error-message">${formErrors.task ?? ''}</p>
      </div>
      <div class="field">
        <label for="description">Opis</label>
        <textarea id="description" name="description">${escapeHtml(draft.description)}</textarea>
      </div>
      <div class="field">
        <label for="priority">Priorytet</label>
        <select id="priority" name="priority" aria-describedby="priority-error">
          <option value="">Wybierz priorytet</option>
          <option value="1" ${draft.priority === "low" ? 'selected' : ''}>Niski</option>
          <option value="2" ${draft.priority === "medium" ? 'selected' : ''}>Średni</option>
          <option value="3" ${draft.priority === "high" ? 'selected' : ''}>Wysoki</option>
        </select>
        <p id="priority-error" class="error-message">${formErrors.priority ?? ''}</p>
      </div>
      <div class="field">
        <label for="due_date">Data wykonania</label>
        <input id="due_date" name="due_date" type="date" value="${draft.due_date}" aria-describedby="due-date-error" />
        <p id="due-date-error" class="error-message">${formErrors.due_date ?? ''}</p>
      </div>
      <div class="form-actions">
        <button class="primary" type="submit">${isEditing ? 'Zapisz zmiany' : 'Dodaj zadanie'}</button>
        ${isEditing ? '<button type="button" data-action="cancel-edit">Anuluj</button>' : ''}
      </div>
    </form>
  `;
}

function renderToolbar(): string {
  return `
    <section class="toolbar" aria-label="Filtrowanie i operacje masowe">
      <div class="filters">
        <div class="field">
          <label for="status-filter">Status</label>
          <select id="status-filter" data-testid="status-filter">
            <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>Wszystkie</option>
            <option value="active" ${statusFilter === 'active' ? 'selected' : ''}>Aktywne</option>
            <option value="completed" ${statusFilter === 'completed' ? 'selected' : ''}>Ukończone</option>
            <option value="overdue" ${statusFilter === 'overdue' ? 'selected' : ''}>Przeterminowane</option>
          </select>
        </div>
        <div class="field">
          <label for="priority-filter">Priorytet</label>
          <select id="priority-filter" data-testid="priority-filter">
            <option value="all" ${priorityFilter === 'all' ? 'selected' : ''}>Wszystkie</option>
            <option value="1" ${priorityFilter === '1' ? 'selected' : ''}>Niski</option>
            <option value="2" ${priorityFilter === '2' ? 'selected' : ''}>Średni</option>
            <option value="3" ${priorityFilter === '3' ? 'selected' : ''}>Wysoki</option>
          </select>
        </div>
        <div class="field">
          <label for="search">Szukaj</label>
          <input id="search" data-testid="search-input" type="search" value="${escapeHtml(searchQuery)}" />
        </div>
      </div>

      <div class="bulk-actions">
        <button type="button" data-action="complete-all" ${todos.some((todo) => !todo.done) ? '' : 'disabled'}>Zaznacz wszystkie</button>
        <button type="button" data-action="uncomplete-all" ${todos.some((todo) => todo.done) ? '' : 'disabled'}>Odznacz wszystkie</button>
        <button class="danger" type="button" data-action="clear-completed" ${todos.some((todo) => todo.done) ? '' : 'disabled'}>Usuń ukończone</button>
      </div>

      <div class="field">
        <label for="import-file">Import zadań z JSON</label>
        <input id="import-file" type="file" accept="application/json" data-testid="import-file" />
      </div>
    </section>
  `;
}

function renderList(items: Todo[]): string {
  if (!items.length) {
    return '<div class="empty-state" data-testid="empty-state">Brak zadań dla wybranych filtrów.</div>';
  }

  return `
    <ul class="todo-list" data-testid="todo-list">
      ${items.map(renderTodo).join('')}
    </ul>
  `;
}

function renderTodo(todo: Todo): string {
  return `
    <li
      class="todo-card"
      data-testid="todo-card-${todo.id}"
      data-done="${todo.done}"
      data-priority="${todo.priority}"
    >
      <div>
        <h3 data-testid="todo-title">${escapeHtml(todo.task)}</h3>
        <p>${escapeHtml(todo.description)}</p>
        <strong><p>Przypisano do: ${todo.owner ? escapeHtml(todo.owner.name) : 'Brak'}</p></strong>
        <div class="todo-meta">
          <span class="badge" data-testid="todo-priority">Priorytet: ${getPriorityLabel(todo.priority)}</span>
          <span class="badge" data-testid="todo-done">${todo.done ? 'Ukończone' : 'Aktywne'}</span>
          ${todo.due_date ? `<span class="badge ${isOverdue(todo) ? 'overdue' : ''}">Termin: ${todo.due_date}</span>` : ''}
        </div>
      </div>
      <div class="card-actions">
        <button type="button" data-action="toggle" data-id="${todo.id}">${todo.done ? 'Oznacz jako aktywne' : 'Oznacz jako ukończone'}</button>
        <button type="button" data-action="edit" data-id="${todo.id}" ${todo.done ? 'disabled' : ''}>Edytuj</button>
        <button class="danger" type="button" data-action="remove" data-id="${todo.id}">Usuń</button>
      </div>
    </li>
  `;
}

function renderAbout(): string {
  return `
    <section class="about-panel" aria-labelledby="about-title">
      <h2 id="about-title" class="page-title">O aplikacji</h2>
      <p>TodoLab to mała aplikacja do ćwiczenia testów funkcjonalnych z Playwright i TypeScript.</p>
      <p>Projekt zawiera logowanie, routing, formularze, filtry, operacje masowe, upload, download i popup raportu.</p>
      <button type="button" data-action="report">Otwórz raport</button>
    </section>
  `;
}

function bindCurrentRoute(): void {
  if (getRoute() === 'about') {
    bindReportButtons();
    return;
  }

  bindTodoForm();
  bindFilters();
  bindTodoActions();
  bindBulkActions();
  bindImportExport();
  bindReportButtons();
}

function bindTodoForm(): void {
  const form = app.querySelector<HTMLFormElement>('[data-testid="todo-form"]');

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);

    draft = {
      task: String(data.get('task') ?? ''),
      description: String(data.get('description') ?? ''),
      priority: formValueToPriority(data.get('priority')),
      due_date: String(data.get('due_date') ?? ''),
    };

    formErrors = validateDraft(draft);

    if (Object.keys(formErrors).length) {
      render();
      return;
    }

    if (editingId) {
      todos = todos.map((todo) =>
        todo.id === editingId
          ? { ...todo, ...createTodo(draft), id: todo.id, done: todo.done, created_at: todo.created_at }
          : todo,
      );
      message = 'Zadanie zaktualizowane.';
    } else {
      todos = [createTodo(draft), ...todos];
      message = 'Zadanie dodane.';
    }

    saveAndResetForm();
  });

  app.querySelector('[data-action="cancel-edit"]')?.addEventListener('click', () => {
    editingId = null;
    draft = emptyDraft();
    formErrors = {};
    render();
  });
}

function bindFilters(): void {
  app.querySelector<HTMLSelectElement>('#status-filter')?.addEventListener('change', (event) => {
    statusFilter = (event.target as HTMLSelectElement).value as FilterStatus;
    render();
  });

  app.querySelector<HTMLSelectElement>('#priority-filter')?.addEventListener('change', (event) => {
    priorityFilter = (event.target as HTMLSelectElement).value as FilterPriority;
    render();
  });

  app.querySelector<HTMLInputElement>('#search')?.addEventListener('input', async (event) => {
    const input = event.target as HTMLInputElement;
    const cursorPosition = input.selectionStart ?? input.value.length;

    searchQuery = input.value;
    await render();

    const nextInput = app.querySelector<HTMLInputElement>('#search');
    nextInput?.focus();
    nextInput?.setSelectionRange(cursorPosition, cursorPosition);
  });
}

function bindTodoActions(): void {
  app.querySelectorAll<HTMLElement>('[data-action="toggle"]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = Number(button.dataset.id);
      todos = todos.map((todo) => todo.id === id ? { ...todo, done: !todo.done } : todo);
      saveAndRender('Status zadania zmieniony.');
    });
  });

  app.querySelectorAll<HTMLElement>('[data-action="edit"]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = Number(button.dataset.id);
      const todo = todos.find((item) => item.id === id);

      if (!todo) {
        return;
      }

      editingId = todo.id;
      draft = {
        task: todo.task,
        description: todo.description,
        priority: todo.priority,
        due_date: todo.due_date ?? '',
      };
      formErrors = {};
      render();
    });
  });

  app.querySelectorAll<HTMLElement>('[data-action="remove"]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = Number(button.dataset.id);
      todos = todos.filter((todo) => todo.id !== id);
      saveAndRender('Zadanie usunięte.');
    });
  });
}

function bindBulkActions(): void {
  app.querySelector('[data-action="complete-all"]')?.addEventListener('click', () => {
    todos = todos.map((todo) => ({ ...todo, done: true }));
    saveAndRender('Wszystkie aktywne zadania zostały ukończone.');
  });

  app.querySelector('[data-action="uncomplete-all"]')?.addEventListener('click', () => {
    todos = todos.map((todo) => ({ ...todo, done: false }));
    saveAndRender('Ukończone zadania zostały oznaczone jako aktywne.');
  });

  app.querySelector('[data-action="clear-completed"]')?.addEventListener('click', () => {
    if (!window.confirm('Czy na pewno usunąć ukończone zadania?')) {
      return;
    }

    todos = todos.filter((todo) => !todo.done);
    saveAndRender('Ukończone zadania zostały usunięte.');
  });
}

function bindImportExport(): void {
  app.querySelector('[data-action="export"]')?.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(todos, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'todos-export.json';
    link.click();
    URL.revokeObjectURL(url);
  });

  app.querySelector<HTMLInputElement>('#import-file')?.addEventListener('change', async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (!file) {
      return;
    }

    try {
      const imported = JSON.parse(await file.text()) as Todo[];
      todos = imported;
      saveAndRender('Zadania zaimportowane.');
    } catch {
      message = '';
      loadError = 'Nie udało się zaimportować pliku JSON.';
      render();
    }
  });
}

function bindReportButtons(): void {
  app.querySelectorAll('[data-action="report"]').forEach((button) => {
    button.addEventListener('click', openReportPopup);
  });
}

function openReportPopup(): void {
  const popup = window.open('', 'todolab-report', 'width=720,height=520');

  if (!popup) {
    message = 'Przeglądarka zablokowała popup.';
    render();
    return;
  }

  const completed = todos.filter((todo) => todo.done).length;
  const overdue = todos.filter(isOverdue).length;

  popup.document.write(`
    <!doctype html>
    <html lang="pl">
      <head>
        <title>Raport TodoLab</title>
        <style>
          body { font-family: system-ui, sans-serif; margin: 32px; color: #1d2733; }
          h1 { margin-top: 0; }
          li { margin: 8px 0; }
        </style>
      </head>
      <body>
        <h1>Raport TodoLab</h1>
        <ul>
          <li>Wszystkie zadania: ${todos.length}</li>
          <li>Ukończone: ${completed}</li>
          <li>Aktywne: ${todos.length - completed}</li>
          <li>Przeterminowane: ${overdue}</li>
        </ul>
      </body>
    </html>
  `);
  popup.document.close();
}

function saveAndResetForm(): void {
  saveTodos(todos);
  editingId = null;
  draft = emptyDraft();
  formErrors = {};
  render();
}

function saveAndRender(nextMessage: string): void {
  saveTodos(todos);
  message = nextMessage;
  render();
}

function formValueToPriority(value: FormDataEntryValue | null): '' | Priority {
  if (value === 'low' || value === 'medium' || value === 'high') {
    return value as Priority;
  }

  return '';
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
