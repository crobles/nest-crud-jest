// __mocks__/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Configura un servidor para usar los handlers definidos
export const server = setupServer(...handlers);
