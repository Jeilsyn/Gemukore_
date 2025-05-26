import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../../styles/Match/MtachCards.css';

//Carta de la información del usuario 
function UserCard({ match }) {
  const { t } = useTranslation();//traducción del componente 
  const [flipped, setFlipped] = useState(false);//para realziar el flip de la carta 

  const toggleFlip = () => setFlipped(!flipped);

  //Si no hay match no devuelve nada
  if (!match) return null;

  return (
    //Animaciones al estilo de las cartas de Pokemon que dan la vuelta y viene la información 
    <div className={`pokemon-card`} onClick={toggleFlip}>
      <div className={`card-inner ${flipped ? 'flipped' : ''}`}>
        {/* Cara de en frente , esto es lo que se va a mostrar(imagen-nombre) */}
        <div className="card-front">
          <div className="card-image">
            <img
              src={match.user.photo || '/default-user.png'}
              alt={match.user.name}
              onError={(e) => {
                e.target.src = '/default-user.png';
              }}
            />
          </div>
          <div className="card-info">
            <h3>{match.user.name}</h3>
          </div>
        </div>

        {/* Cara de atrás se muestra el Nickname, y role del usuario por cada videojuego que tiene */}
        <div className="card-back">
          <h3 className="back-username">{match.user.name}</h3>          <div className="game-details">
            {/* mapeo dentro del match y de ahi al jugador y su informacion relativa a sus videojuegos   */}
            {match.games?.map((game) => (
              <div key={game.$id} className="game-info">
                <h4>{game.nombre}</h4>
                <p><strong>{t('matchList.gameNickname')}:</strong> {game.nickname_en_juego || t('matchList.notSpecified')}</p>
                <p><strong>{t('matchList.gameRole')}:</strong> {game.rol || t('matchList.notSpecified')}</p>
                <p><strong>{t('matchList.gameLevel')}:</strong> {['principiante', 'intermedio', 'veterano'].includes(game.nivel_juego) ? t(`levels.${game.nivel_juego}`) : game.nivel_juego || t('matchList.notSpecified')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserCard;
