import { Todo, TodoDraft } from "./types";

export function createTodoFactory(overrides: Partial<Todo> = {}): TodoDraft {
   return {
    id: Date.now(),
    task: '',
    description: '',
    done: false,
    priority: 'low',
    due_date: undefined,
    created_at: new Date().toISOString(),
    ...overrides,
   }
}

export function isTodo(value: unknown): value is Todo {
    if (
        typeof value === 'object' 
        && value !== null 
        && 'id' in value 
        && 'task' in value 
        && 'description' in value 
        && 'done' in value 
        && 'priority' in value 
        && 'created_at' in value
    ) {
        return true;
    }
    return false;

}