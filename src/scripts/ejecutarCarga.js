import { cargarVideojuegos } from '../lib/services/appwrite/collections.js'; 

cargarVideojuegos()
  .then(() => {
    console.log(' Videojuegos cargados con éxito.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error al cargar videojuegos:', error);
    process.exit(1);
  });
