import { useState, useEffect } from 'react';
import { 
  getAllVideoGames,
  getTutorialsByFilters,
  getTutorialById 
} from '../../lib/services/appwrite/collections';

const TutorialesC = ({ userId }) => {
  // Estados para los datos y filtros
  const [videojuegos, setVideojuegos] = useState([]);
  const [tutoriales, setTutoriales] = useState([]);
  const [selectedJuego, setSelectedJuego] = useState('');
  const [selectedNivel, setSelectedNivel] = useState('');
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Niveles recomendados disponibles
  const nivelesRecomendados = [
    'principiante',
    'intermedio',
    'veterano'
  ];

  // Obtener la lista de videojuegos al cargar el componente
  useEffect(() => {
    const fetchVideojuegos = async () => {
      try {
        const response = await getAllVideoGames();
        setVideojuegos(response);
      } catch (err) {
        setError('Error al cargar los videojuegos');
        console.error(err);
      }
    };

    fetchVideojuegos();
  }, []);

  // Obtener tutoriales cuando cambian los filtros
  useEffect(() => {
    const fetchTutoriales = async () => {
      setLoading(true);
      try {
        const response = await getTutorialsByFilters(selectedJuego, selectedNivel);
        setTutoriales(response);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los tutoriales');
        console.error(err);
        setLoading(false);
      }
    };

    fetchTutoriales();
  }, [selectedJuego, selectedNivel]);

  // Manejar click en un tutorial
  const handleTutorialClick = async (tutorial) => {
    try {
      const fullTutorial = await getTutorialById(tutorial.$id);
      setSelectedTutorial(fullTutorial);
    } catch (err) {
      setError('Error al cargar el tutorial');
      console.error(err);
    }
  };

  // Volver a la lista de tutoriales
  const handleBackToList = () => {
    setSelectedTutorial(null);
  };

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (selectedTutorial) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <button 
          onClick={handleBackToList}
          className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          &larr; Volver a la lista
        </button>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-2">{selectedTutorial.titulo}</h2>
          
          <div className="mb-4">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">
              {selectedTutorial.nivel_recomendado}
            </span>
            <span className="text-gray-600">
              {videojuegos.find(j => j.$id === selectedTutorial.videojuego_id)?.nombre || 'Juego desconocido'}
            </span>
          </div>
          
          <div className="prose max-w-none">
            <p className="whitespace-pre-line">{selectedTutorial.Contenido}</p>
          </div>
          
          {selectedTutorial.url_video && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Video relacionado:</h3>
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  className="w-full h-64 md:h-96 rounded"
                  src={selectedTutorial.url_video.replace("watch?v=", "embed/")}
                  title="Video tutorial"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Tutoriales</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Selecciona un videojuego:
          </label>
          <select
            value={selectedJuego}
            onChange={(e) => setSelectedJuego(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Todos los videojuegos</option>
            {videojuegos.map((juego) => (
              <option key={juego.$id} value={juego.$id}>
                {juego.nombre}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nivel recomendado:
          </label>
          <select
            value={selectedNivel}
            onChange={(e) => setSelectedNivel(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Todos los niveles</option>
            {nivelesRecomendados.map((nivel) => (
              <option key={nivel} value={nivel}>
                {nivel.charAt(0).toUpperCase() + nivel.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">Cargando tutoriales...</div>
      ) : tutoriales.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No se encontraron tutoriales con los filtros seleccionados
        </div>
      ) : (
        <div className="space-y-4">
          {tutoriales.map((tutorial) => (
            <div 
              key={tutorial.$id} 
              onClick={() => handleTutorialClick(tutorial)}
              className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold mb-1">{tutorial.titulo}</h3>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  {tutorial.nivel_recomendado}
                </span>
                <span className="text-sm text-gray-600">
                  {videojuegos.find(j => j.$id === tutorial.videojuego_id)?.nombre || 'Juego desconocido'}
                </span>
              </div>
              <p className="text-gray-700 line-clamp-2">
                {tutorial.Contenido.substring(0, 100)}
                {tutorial.Contenido.length > 100 && '...'}
              </p>
              <button className="mt-2 text-blue-600 text-sm hover:underline">
                Ver más detalles
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TutorialesC;