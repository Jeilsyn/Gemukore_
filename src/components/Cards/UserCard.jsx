import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../../styles/Match/MtachCards.css';

function UserCard({ match }) {
  const { t } = useTranslation();
  const [flipped, setFlipped] = useState(false);

  const toggleFlip = () => setFlipped(!flipped);

  if (!match) return null;

  return (
    <div className={`pokemon-card`} onClick={toggleFlip}>
      <div className={`card-inner ${flipped ? 'flipped' : ''}`}>
        {/* Cara frontal */}
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

        {/* Cara trasera */}
        <div className="card-back">
  <h3 className="back-username">{match.user.name}</h3>          <div className="game-details">
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
