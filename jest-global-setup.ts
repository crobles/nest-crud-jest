import { execSync } from 'child_process';

module.exports = async () => {
  console.log(
    '🚀 Iniciando MySQL con Docker Compose para todas las pruebas...',
  );

  try {
    execSync('docker-compose -f docker-compose.test.yml down', {
      stdio: 'inherit',
    });
  } catch (e) {
    console.log(e);
  }

  execSync('docker-compose -f docker-compose.test.yml up -d', {
    stdio: 'inherit',
  });

  console.log('⏳ Esperando a que MySQL esté listo...');
  await new Promise((resolve) => setTimeout(resolve, 30000));

  try {
    const containerStatus = execSync('docker ps').toString();
    if (!containerStatus.includes('mysql-test')) {
      console.error('⚠️ El contenedor MySQL parece no estar en ejecución');
    } else {
      console.log('✅ Contenedor MySQL iniciado correctamente');
    }
  } catch (error) {
    console.error('Error al verificar el estado del contenedor:', error);
  }

  global.__MYSQL_CONTAINER__ = true;
};
