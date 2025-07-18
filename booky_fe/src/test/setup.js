// src/test/setup.js
import '@testing-library/jest-dom';

// Mock ResizeObserver for components that use it (e.g., from @headlessui/react)
const ResizeObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Stub the global ResizeObserver
vi.stubGlobal('ResizeObserver', ResizeObserver);
