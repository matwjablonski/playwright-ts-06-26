# TodoLab

Projekt startowy do szkolenia **Automatyzacja testów funkcjonalnych aplikacji internetowych z użyciem Playwright i TypeScript**.

## Uruchomienie

```sh
npm install
npm run dev
```

Aplikacja działa domyślnie pod adresem:

```txt
http://localhost:5173
```

Hasło logowania:

```txt
admin123
```

## Testy

```sh
npm test
npm run test:ui
```

## Funkcje do ćwiczeń

- logowanie i ochrona tras przez `sessionStorage`
- routing hash: `#/login`, `#/todos`, `#/about`
- pobieranie danych z `public/data.json`
- dodawanie, edycja, usuwanie i oznaczanie zadań
- walidacja formularza
- filtrowanie po statusie i priorytecie
- wyszukiwanie po tytule i opisie
- operacje masowe z `window.confirm`
- import JSON przez upload pliku
- eksport JSON przez download
- popup z raportem

Projekt celowo jest prosty i framework-free, żeby w trakcie szkolenia uwaga była na Playwright, a nie na frameworku UI.
