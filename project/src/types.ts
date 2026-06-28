export type Priority = 1 | 2 | 3;
export type FilterStatus = 'all' | 'active' | 'completed' | 'overdue';
export type FilterPriority = 'all' | '1' | '2' | '3';

export interface Todo {
  id: number;
  task: string;
  description: string;
  done: boolean;
  priority: Priority;
  due_date?: string;
  created_at: string;
}

export interface TodoDraft {
  task: string;
  description: string;
  priority: '' | Priority;
  due_date: string;
}
