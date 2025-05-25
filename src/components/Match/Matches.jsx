import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { account } from '../../lib/services/appwrite/appwriteClient';
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

export default function Matches() {
  const { t } = useTranslation();
  const [candidates, setCandidates] = useState([]);
  const [index, setIndex] = useState(0);
  const [prefs, setPrefs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [direction, setDirection] = useState(1); // 1 forward, -1 backward

  
  

  useEffect(() => {
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

  const handleMatch = () => handleAction(async () => {
    const currentUser = await account.get();
    if (!currentUser?.$id) throw new Error(t('matches.errors.notAuthenticated'));
    const other = candidates[index];
    if (!other?.$id) throw new Error(t('matches.errors.invalidCandidate'));
    await createLike(currentUser.$id, other.$id, 'pendiente_receptor');
  });

  const handleSkip = () => handleAction(async () => {
    const currentUser = await account.get();
    if (!currentUser?.$id) throw new Error(t('matches.errors.notAuthenticated'));
    const other = candidates[index];
    if (!other?.$id) throw new Error(t('matches.errors.invalidCandidate'));
    await skipUser(currentUser.$id, other.$id);
  });

  const nextCandidate = () => {
    setIndex(prevIndex => (prevIndex + 1 < candidates.length ? prevIndex + 1 : 0));
  };

  if (isLoading && candidates.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t('matches.loading')}</p>
      </div>
    );
  }

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

  if (candidates.length === 0) {
    return (
      <div className="no-candidates">
        <p>{t('matches.noCandidates')}</p>
      </div>
    );
  }

  const user = candidates[index];

  return (
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
