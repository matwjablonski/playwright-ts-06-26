import { Page } from "@playwright/test";

export class TodosPage {
    private form;
    private titleInput;
    private descriptionInput;
    private prioritySelect;
    private todoList;
    private addTodoButton;
    private removeTodoButtonSelector = '[data-testid^="todo-card-"] [data-action="remove"]';

    constructor(private page: Page) {
        this.form = page.getByTestId('todo-form');

        this.titleInput = this.form.getByLabel('Tytuł');
        this.descriptionInput = this.form.getByLabel('Opis');
        this.prioritySelect = this.form.getByLabel('Priorytet');
        this.addTodoButton = this.form.getByRole('button', { name: 'Dodaj zadanie' });
        this.todoList = page.getByTestId('todo-list');
    }

    async goto(): Promise<void> {
        await this.page.goto('http://localhost:5173/#/todos');
    }
    
    async addTodo(task: string, description: string, priority: '1' | '2' | '3'): Promise<void> {
        await this.titleInput.fill(task);
        await this.descriptionInput.fill(description);
        await this.prioritySelect.selectOption(priority);
        await this.addTodoButton.click();
    }
    
    async getTodoCount(): Promise<number> {
        return await this.page.locator('[data-testid^="todo-card-"]').count();
    }

    async removeTodoByName(task: string): Promise<void> {
        await this.todoList.getByText(task).locator(this.removeTodoButtonSelector).click();
    }
}