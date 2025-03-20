import { server } from './src/users/__mocks__/server';

// Establece el servidor para escuchar peticiones antes de las pruebas
beforeAll(() => server.listen());

// Resetea los handlers entre pruebas (para mantener aisladas las pruebas)
afterEach(() => server.resetHandlers());

// Cierra el servidor después de terminar las pruebas
afterAll(() => server.close());
