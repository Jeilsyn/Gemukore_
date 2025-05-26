import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getMatchesWithGameInfo } from '../../lib/services/appwrite/collections';
import UserCard from './UserCard';
import '../../styles/Match/MtachCards.css';

//Lista de las conexiones que tiene el usuario 
function MatchList({ userId }) {
  const { t } = useTranslation();//Sirve para la traducción del inglés a español y viceversa, para que s aplique de forma general ha de aplicarse en todos los archivos 
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    //Cargamos los matches del usuario 
    async function loadMatches() {
      if (!userId) return;
      try {
        setLoading(true);
        //Cargamos el usuario junto a su informacion: en este caso es Nickname y role por videojuego 
        const userMatches = await getMatchesWithGameInfo(userId);
        setMatches(userMatches);
      } catch (error) {
        console.error("Error loading matches:", error);
        setError(t('matchList.errors.loadError'));
      } finally {
        setLoading(false);
      }
    }

    loadMatches();
  }, [userId, t]);

  //Mensaje de pantalla para mostrar que se está cargando los matches del usuario 
  if (loading) return <div className="loading">{t('matchList.loading')}</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="game-board-container">
      <h1 >{t('matchList.title')}</h1>
      <div className="matches-grid">
        {matches.length === 0 ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>{t('matchList.noMatches')}</p>
          </div>
        ) : (
          //Extraemos cada match de los matches del usuario 
          matches.map((match) => (
            //Llamamos al componente para mostrar todo relativo al usuario 
            <UserCard key={match.$id} match={match} />
          ))
        )}

      </div>
    </div>
  );
}

export default MatchList;
