import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Ziggy's global route() helper: return a readable fake URL.
vi.stubGlobal('route', (name: string, params?: unknown) => `/${name}${params !== undefined ? `/${String(params)}` : ''}`);

// Radix UI expects these browser APIs, which jsdom lacks.
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.hasPointerCapture = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();
vi.stubGlobal(
    'ResizeObserver',
    class {
        observe() {}
        unobserve() {}
        disconnect() {}
    },
);

afterEach(() => cleanup());
