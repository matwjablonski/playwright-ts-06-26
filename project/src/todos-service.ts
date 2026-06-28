import { getTodosKey, readJson, writeJson } from './storage';
import type { FilterPriority, FilterStatus, Priority, Todo, TodoDraft } from './types';

const priorityLabels: Record<Priority, string> = {
  1: 'Niski',
  2: 'Średni',
  3: 'Wysoki',
};

export async function loadInitialTodos(): Promise<Todo[]> {
  const cached = readJson<Todo[] | null>(getTodosKey(), null);

  if (cached) {
    return cached;
  }

  const response = await fetch('/data.json');

  if (!response.ok) {
    throw new Error(`Nie udało się pobrać danych: ${response.status}`);
  }

  const todos = await response.json() as Todo[];
  writeJson(getTodosKey(), todos);

  return todos;
}

export function saveTodos(todos: Todo[]): void {
  writeJson(getTodosKey(), todos);
}

export function createTodo(draft: TodoDraft): Todo {
  return {
    id: Date.now(),
    task: draft.task.trim(),
    description: draft.description.trim(),
    done: false,
    priority: Number(draft.priority) as Priority,
    due_date: draft.due_date || undefined,
    created_at: new Date().toISOString(),
  };
}

export function isOverdue(todo: Todo): boolean {
  if (!todo.due_date || todo.done) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return new Date(todo.due_date) < today;
}

export function filterTodos(
  todos: Todo[],
  status: FilterStatus,
  priority: FilterPriority,
  query: string,
): Todo[] {
  const normalizedQuery = query.trim().toLowerCase();

  return todos.filter((todo) => {
    const statusMatches =
      status === 'all'
      || (status === 'active' && !todo.done && !isOverdue(todo))
      || (status === 'completed' && todo.done)
      || (status === 'overdue' && isOverdue(todo));

    const priorityMatches = priority === 'all' || String(todo.priority) === priority;
    const queryMatches =
      !normalizedQuery
      || todo.task.toLowerCase().includes(normalizedQuery)
      || todo.description.toLowerCase().includes(normalizedQuery);

    return statusMatches && priorityMatches && queryMatches;
  });
}

export function getPriorityLabel(priority: Priority): string {
  return priorityLabels[priority];
}

export function validateDraft(draft: TodoDraft): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!draft.task.trim()) {
    errors.task = 'Tytuł jest wymagany.';
  }

  if (!draft.priority) {
    errors.priority = 'Priorytet jest wymagany.';
  }

  if (draft.due_date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (new Date(draft.due_date) < today) {
      errors.due_date = 'Data wykonania nie może być z przeszłości.';
    }
  }

  return errors;
}
