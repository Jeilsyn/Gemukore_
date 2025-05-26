import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { account } from '../../lib/services/appwrite/appwriteClient';// usuario actual de appwrite
import {
  getAllUsers,
  getUserGamesPreferencesWithNames,
  createLike,
  skipUser
} from '../../lib/services/appwrite/collections.js';
import Button from '../ui/Button';
import { useTranslation } from 'react-i18next';
import "../../styles/Match/match.css";
import { cardVariants } from '../animations/animation.js';

// El emparejamiento entre usuarios, 
export default function Matches() {
  const { t } = useTranslation();//traduccion 
  const [candidates, setCandidates] = useState([]);//usuarios que ves y decidir si hacer Gemu(Match) o no 
  const [index, setIndex] = useState(0);
  const [prefs, setPrefs] = useState([]);//preferencias del usuario 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [direction, setDirection] = useState(1); 
  
  

  useEffect(() => {
    //Cargar los usuarios al montarse el componente 
    const loadCandidates = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const user = await account.get();
        if (!user?.$id) throw new Error(t('matches.errors.noUserId'));
        const all = await getAllUsers(user.$id);
        setCandidates(all);
      } catch (error) {
        console.error(t('matches.errors.loadCandidates'), error);
        setError(t('matches.errors.loadCandidates'));
      } finally {
        setIsLoading(false);
      }
    };

    loadCandidates();
  }, [t]);

  useEffect(() => {
    //Cargar las preferencias del usuario al montarse el componente 
    const loadPreferences = async () => {
      if (candidates[index]?.$id) {
        try {
          const preferences = await getUserGamesPreferencesWithNames(candidates[index].$id);
          setPrefs(preferences);
        } catch (error) {
          console.error(t('matches.errors.loadPreferences'), error);
          setPrefs([]);
        }
      }
    };

    loadPreferences();
  }, [candidates, index, t]);

  //Las acciones a realizar  para el Skip o el Gemu (sirve para ver si está cargando, ejecutando la accion, moviendos eal siguiente match y también la he usado para depurar )
  const handleAction = async (actionFn) => {
    try {
      setIsLoading(true);
      await actionFn();
      setDirection(1);
      nextCandidate();
    } catch (error) {
      console.error(error);
      setError(t('matches.errors.actionError'));
    } finally {
      setIsLoading(false);
    }
  };

  //Manejar el match 
  const handleMatch = () => handleAction(async () => {
    const currentUser = await account.get();
    if (!currentUser?.$id) throw new Error(t('matches.errors.notAuthenticated'));
    const other = candidates[index];
    if (!other?.$id) throw new Error(t('matches.errors.invalidCandidate'));
    await createLike(currentUser.$id, other.$id, 'pendiente_receptor');
  });

  //Manjear el skip 
  const handleSkip = () => handleAction(async () => {
    const currentUser = await account.get();
    if (!currentUser?.$id) throw new Error(t('matches.errors.notAuthenticated'));
    const other = candidates[index];
    if (!other?.$id) throw new Error(t('matches.errors.invalidCandidate'));
    await skipUser(currentUser.$id, other.$id);
  });

  //Moverse de usuario a otro
  const nextCandidate = () => {
    setIndex(prevIndex => (prevIndex + 1 < candidates.length ? prevIndex + 1 : 0));
  };

  //Si carga muestra la animacion 
  if (isLoading && candidates.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t('matches.loading')}</p>
      </div>
    );
  }

  //Si hay error muestra esto junto a un boton de recarga 
  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <Button onClick={() => window.location.reload()}>
          {t('matches.retry')}
        </Button>
      </div>
    );
  }

  //Sin usuarios para hacer match muestro que no hay candidatos 
  if (candidates.length === 0) {
    return (
      <div className="no-candidates">
        <p>{t('matches.noCandidates')}</p>
      </div>
    );
  }

  //Obtener el usuario actual 
  const user = candidates[index];

  return (
    //Animación de la tarjeta del perfil para la entrada y salida de la tarjeta con desplazamiento horizontal 
    <>
  <h2 className="match-title">{t('matches.title')}</h2>
  <div className="matches-container">
      <AnimatePresence custom={direction} mode="wait">
        <motion.div
          key={index}
          custom={direction}
          variants={cardVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="match-card"
        >
          <div className="profile-header">
            <img
              src={user.foto_perfil_url || '/userDefault.png'}
              className="profile-img"
              alt={t('matches.profileImageAlt')}
              onError={(e) => { e.target.src = '/userDefault.png'; }}
            />
            <div className="profile-info">
              <h3>{user.nombre_usuario}</h3>
              <p className="profile-description">{user.descripcion}</p>
            </div>
          </div>

          <div className="game-preferences">
            <h4>{t('matches.gamePreferences')}</h4>
            <ul>
              {prefs.length > 0 ? (
                prefs.map(pref => (
                  <li key={pref.$id} className="game-item">
                    <span className="game-name">{pref.nombre}</span>
                    <span className="game-level">
                      {t('matches.level')}: {pref.nivel_juego}
                      {pref.favorito && <span className="favorite">⭐</span>}
                    </span>
                  </li>
                ))
              ) : (
                <li className="no-preferences">
                  {t('matches.noPreferences')}
                </li>
              )}
            </ul>
          </div>

          <div className="actions">
            <Button
              onClick={handleSkip}
              disabled={isLoading}
              variant="secondary"
            >
              {t('matches.skip')}
            </Button>
            <Button
              onClick={handleMatch}
              disabled={isLoading}
              variant="primary"
              className="Gemu"
            >
              {isLoading ? '...' : t('matches.match')}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
    </>
  );
}
