import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Vitest n'expose pas afterEach globalement : on démonte explicitement les rendus.
afterEach(() => cleanup());

// jsdom n'implémente pas le défilement : on le neutralise pour éviter le bruit dans la console.
Object.defineProperty(window, 'scrollTo', { value: () => {}, writable: true });
