<!-- _class: time25 -->

## Zadanie nr 25

**Performance Testing**

Przygotuj 100+ zadań w `localStorage` i zmierz:

- czas pierwszego renderowania listy
- czas filtrowania po priorytecie
- czas wyszukiwania
- czas operacji `Zaznacz wszystkie`

Wykorzystaj:

```ts
await context.tracing.start({ screenshots: true, snapshots: true });
// test actions
await context.tracing.stop({ path: 'trace.zip' });
```

Bonus: sprawdź, czy wielokrotne importowanie pliku JSON nie duplikuje nieoczekiwanie stanu.
