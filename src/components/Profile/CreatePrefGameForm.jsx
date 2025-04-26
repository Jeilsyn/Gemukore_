import React, { useState, useEffect } from 'react';
import { 
  createUserGamesProfile, 
  getAllVideoGames,
  searchVideoGames 
} from '../../lib/services/appwrite/collections';
import Input from '../ui/Input';
import Button from '../ui/Button';

function CreatePrefGameForm({ userId }) {
  const [allGames, setAllGames] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredGames, setFilteredGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [nivelJuego, setNivelJuego] = useState('');
  const [favorito, setFavorito] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => {
    async function fetchGames() {
      try {
        const games = await getAllVideoGames();
        console.log('Total games loaded:', games.length);
        setAllGames(games);
      } catch (error) {
        console.error('Error loading games:', error);
      }
    }
    fetchGames();
  }, []);

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearch(value);
    setSelectedGame(null);

    // Limpiar timeout anterior
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Configurar nuevo timeout para búsqueda
    if (value.trim().length >= 2) {
      setSearchTimeout(
        setTimeout(async () => {
          try {
            const results = await searchVideoGames(value);
            setFilteredGames(results);
          } catch (error) {
            console.error('Search error:', error);
            // Fallback a búsqueda client-side si falla la server-side
            const filtered = allGames.filter(game =>
              game.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .includes(value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
            );
            setFilteredGames(filtered.slice(0, 50));
          }
        }, 300) // Debounce de 300ms
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

    const profileData = {
      usuario_id: userId,
      videojuego_id: selectedGame.$id,
      favorito,
      nivel_juego: nivelJuego,
    };

    try {
      setLoading(true);
      await createUserGamesProfile(profileData);
      alert('✅ Preferencia guardada.');
      setSearch('');
      setSelectedGame(null);
      setNivelJuego('');
      setFavorito(false);
    } catch (err) {
      console.error('Error:', err);
      alert('❌ Error al guardar preferencia.');
    } finally {
      setLoading(false);
    }
  };




  
  // Limpiar timeout al desmontar el componente
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <form onSubmit={handleSubmit} className="game-pref-form">
      <h2>🎮 Añadir Juego Preferido</h2>

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
                <div className="no-results">No se encontraron juegos</div>
              )
            )}
          </div>
        )}
      </div>

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

      <Button type="submit" loading={loading} disabled={!selectedGame || !nivelJuego}>
        Guardar Preferencia
      </Button>
    </form>
  );
}

export default CreatePrefGameForm;
