import { execSync } from 'child_process';

module.exports = async () => {
  console.log('\n🛑 Deteniendo MySQL para todas las pruebas...\n');

  if (global.__MYSQL_CONTAINER__) {
    try {
      execSync('docker-compose -f docker-compose.test.yml down', {
        stdio: 'inherit',
      });
      console.log('\n ✅ Contenedor MySQL detenido correctamente \n');
    } catch (error) {
      console.error('Error al detener el contenedor MySQL:', error);
    }
  } else {
    console.log('⚠️ No se encontró un contenedor MySQL para detener');
  }
};
