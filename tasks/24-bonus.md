<!-- _class: time20 -->

## Zadanie nr 24

**Visual Regression Testing**

Dodaj screenshot testy dla:

- `/#/login`
- `/#/todos`
- formularza edycji
- pustej listy po mocku `/data.json`
- widoku mobilnego

Skonfiguruj:

```ts
animations: 'disabled'
maxDiffPixelRatio: 0.01
threshold: 0.2
```

Porównaj, które ustawienia ukrywają realne regresje.
