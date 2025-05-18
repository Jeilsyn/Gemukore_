import React, { useState, useEffect } from 'react';
import { 
  createUserGamesProfile, 
  getAllVideoGames,
  searchVideoGames,
  getUserGamesPreferences
} from '../../lib/services/appwrite/collections';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';

function CreatePrefGameForm({ userId }) {
  const [allGames, setAllGames] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredGames, setFilteredGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [nivelJuego, setNivelJuego] = useState('');
  const [favorito, setFavorito] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [userCurrentGames, setUserCurrentGames] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const [games, userGames] = await Promise.all([
          getAllVideoGames(),
          userId ? getUserGamesPreferences(userId) : Promise.resolve([])
        ]);
        
        setAllGames(games);
        setUserCurrentGames(userGames.map(g => g.videojuego_id.$id));
      } catch (error) {
        console.error('Error cargando datos:', error);
      }
    }
    fetchData();
  }, [userId]);

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearch(value);
    setSelectedGame(null);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (value.trim().length >= 2) {
      setSearchTimeout(
        setTimeout(async () => {
          try {
            const results = await searchVideoGames(value);
            // Filtrar juegos que el usuario ya tiene
            const filtered = results.filter(game => 
              !userCurrentGames.includes(game.$id)
            );
            setFilteredGames(filtered);
          } catch (error) {
            console.error('Error en búsqueda:', error);
            const filtered = allGames.filter(game =>
              game.nombre.toLowerCase().includes(value.toLowerCase()) &&
              !userCurrentGames.includes(game.$id)
            );
            setFilteredGames(filtered.slice(0, 50));
          }
        }, 300)
      );
    } else {
      setFilteredGames([]);
    }
  };

  const handleSelectGame = (game) => {
    setSelectedGame(game);
    setSearch(game.nombre);
    setFilteredGames([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGame || !nivelJuego) {
      alert('Por favor selecciona un videojuego y tu nivel.');
      return;
    }

    if (!userId) {
      alert('Error: No se pudo identificar al usuario');
      return;
    }

    const profileData = {
      usuario_id: userId,
      videojuego_id: selectedGame.$id,
      favorito,
      nivel_juego: nivelJuego,
    };

    try {
      setLoading(true);
      await createUserGamesProfile(profileData);
      alert('✅ Juego añadido correctamente.');
      navigate("/createGameInfoUser"); // Redirigir a configuración después de añadir
    } catch (err) {
      console.error('Error al guardar:', err);
      alert(`❌ Error al añadir juego: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <div className="add-game-page">
      <h1>➕ Añadir Nuevo Juego</h1>
      
      <form onSubmit={handleSubmit} className="game-pref-form">
        <div className="search-container">
          <Input
            label="Buscar videojuego"
            id="search"
            value={search}
            onChange={handleSearchChange}
            placeholder="Escribe al menos 2 caracteres..."
          />
          
          {search && !selectedGame && (
            <div className="suggestions">
              {filteredGames.length > 0 ? (
                <div className="suggestions-list">
                  {filteredGames.map((game) => (
                    <div
                      key={game.$id}
                      className="suggestion-item"
                      onClick={() => handleSelectGame(game)}
                    >
                      {game.nombre}
                    </div>
                  ))}
                </div>
              ) : (
                search.trim().length >= 2 && (
                  <div className="no-results">
                    {userCurrentGames.length > 0 && filteredGames.length === 0 
                      ? "Ya tienes este juego añadido"
                      : "No se encontraron juegos"}
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {selectedGame && (
          <div className="selected-game">
            <h3>Juego seleccionado: {selectedGame.nombre}</h3>
            <img 
              src={selectedGame.imagen_url} 
              alt={selectedGame.nombre} 
              className="game-image"
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="nivelJuego">Tu nivel en el juego:</label>
          <select
            id="nivelJuego"
            value={nivelJuego}
            onChange={(e) => setNivelJuego(e.target.value)}
            required
          >
            <option value="">-- Selecciona nivel --</option>
            <option value="principiante">Principiante</option>
            <option value="intermedio">Intermedio</option>
            <option value="veterano">Veterano</option>
          </select>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={favorito}
              onChange={(e) => setFavorito(e.target.checked)}
            />
            {' '}
            Marcar como favorito
          </label>
        </div>

        <div className="form-actions">
          <Button 
            type="button" 
            onClick={() => navigate("/settings")}
            variant="secondary"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            loading={loading} 
            disabled={!selectedGame || !nivelJuego}
          >
            Añadir Juego
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreatePrefGameForm;