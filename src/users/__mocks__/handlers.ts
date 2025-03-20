// __mocks__/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Handler para el endpoint de dólar
  http.get('https://mindicador.cl/api/dolar/:fecha', ({ params }) => {
    const { fecha } = params;

    // Respuestas específicas según la fecha
    if (fecha === '01-01-2023') {
      return HttpResponse.json({
        version: '1.6.0',
        autor: 'mindicador.cl',
        codigo: 'dolar',
        nombre: 'Dólar observado',
        unidad_medida: 'Pesos',
        serie: [
          {
            fecha: '2023-01-01T03:00:00.000Z',
            valor: 855.86,
          },
        ],
      });
    }

    // Escenario de error
    if (fecha === 'error') {
      return new HttpResponse(null, {
        status: 500,
        statusText: 'Error interno del servidor',
      });
    }

    // Escenario de no encontrado
    if (fecha === 'not-found') {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'No encontrado',
      });
    }

    // Respuesta por defecto
    return HttpResponse.json({
      version: '1.6.0',
      autor: 'mindicador.cl',
      codigo: 'dolar',
      nombre: 'Dólar observado',
      unidad_medida: 'Pesos',
      serie: [
        {
          fecha: `2023-${fecha}T03:00:00.000Z`,
          valor: 800.0,
        },
      ],
    });
  }),
];
