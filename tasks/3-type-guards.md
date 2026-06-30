<!-- _class: time20 -->

## Zadanie nr 3a

W nowym pliku `src/todo-factory.ts` dodaj factory:

```ts
export function createTodo(overrides: Partial<Todo> = {}): Todo {
  // przygotuj domyślne dane i nadpisz je przez overrides
}
```

Dodaj type guard:

```ts
export function isTodo(value: unknown): value is Todo {
  // sprawdź minimalny kształt obiektu
}
```

- użyj `createTodo()` w krótkim przykładzie w `main.ts`
- użyj `isTodo()` przy parsowaniu nieznanego JSON-a
- uruchom `npm run build`
