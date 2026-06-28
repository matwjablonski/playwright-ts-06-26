import { isAuthenticated } from './storage';

export type Route = 'login' | 'todos' | 'about';

export function getRoute(): Route {
  const hash = window.location.hash.replace('#/', '');

  if (hash === 'about') {
    return 'about';
  }

  if (hash === 'todos') {
    return 'todos';
  }

  return 'login';
}

export function navigate(route: Route): void {
  window.location.hash = `#/${route}`;
}

export function ensureRoute(): void {
  const route = getRoute();

  if (!isAuthenticated() && route !== 'login') {
    navigate('login');
    return;
  }

  if (isAuthenticated() && route === 'login') {
    navigate('todos');
  }
}
