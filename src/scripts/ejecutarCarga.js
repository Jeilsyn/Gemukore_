import { cargarVideojuegos } from '../lib/services/appwrite/collections.js'; 

//Es un script de utilidad paraejecutar manualmente la carga masiva de videojuegos y lo ejecuta, cree un json para no tener que meter manualmente todos los videojuegos en appwrite, por lo que con el script este y la función de collection se  crea el proceso de ir cargando el json e insertar los documentos en la colección 
cargarVideojuegos()
  .then(() => {
    console.log(' Videojuegos cargados con éxito.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error al cargar videojuegos:', error);
    process.exit(1);
  });
