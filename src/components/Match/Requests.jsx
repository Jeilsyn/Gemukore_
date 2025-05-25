import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { account } from '../../lib/services/appwrite/appwriteClient';
import {
  getPendingLikes,
  updateLike,
  createMatch,
  getUserProfile,
  getUserGamesPreferencesWithNames
} from '../../lib/services/appwrite/collections.js';
import Button from '../ui/Button';
import { useTranslation } from 'react-i18next';
import "../../styles/Match/match.css";
import { cardVariants } from '../animations/animation.js';

export default function Requests() {
  const { t } = useTranslation();
  const [pending, setPending] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [prefsMap, setPrefsMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPending() {
      setIsLoading(true);
      setError(null);
      try {
        const user = await account.get();
        if (!user?.$id) throw new Error(t('requests.errors.notAuthenticated'));

        const likes = await getPendingLikes(user.$id);
        setPending(likes);

        for (let like of likes) {
          if (!like?.emisor_id) {
            console.error(t('requests.errors.invalidLike'), like);
            continue;
          }

          try {
            const prof = await getUserProfile(like.emisor_id.$id);
            const gamePrefs = await getUserGamesPreferencesWithNames(like.emisor_id.$id);
            setProfiles(p => ({ ...p, [like.$id]: prof }));
            setPrefsMap(m => ({ ...m, [like.$id]: gamePrefs }));
          } catch (error) {
            console.error(t('requests.errors.loadProfileError', { id: like.$id }), error);
          }
        }
      } catch (error) {
        console.error(t('requests.errors.loadPendingError'), error);
        setError(t('requests.errors.loadPendingError'));
      } finally {
        setIsLoading(false);
      }
    }
    loadPending();
  }, [t]);

  const handleDecision = async (like, decision) => {
    try {
      if (!like?.$id || !like?.emisor_id?.$id) {
        throw new Error(t('requests.errors.incompleteData'));
      }

      const user = await account.get();
      if (!user?.$id) throw new Error(t('requests.errors.notAuthenticated'));

      if (decision === 'accept') {
        const matchDoc = await createMatch(like.emisor_id.$id, user.$id);
        await updateLike(like.$id, {
          estado: 'aceptado_receptor',
          match_id: matchDoc.$id
        });
      } else {
        await updateLike(like.$id, { estado: 'rechazado_receptor' });
      }

      setPending(p => p.filter(l => l.$id !== like.$id));
    } catch (error) {
      console.error(t('requests.errors.decisionError'), error);
      alert(t('requests.errors.decisionAlert') + error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t('requests.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <Button onClick={() => window.location.reload()}>
          {t('requests.retry')}
        </Button>
      </div>
    );
  }

if (pending.length === 0) {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>{t('requests.noRequests')}</p>
    </div>
  );
}

  return (
    <>
      <h2 className="match-title">{t('requests.title')}</h2>
      <div className="matches-container">
        <AnimatePresence mode="wait">
          {pending.map(like => {
            const user = profiles[like.$id];
            const games = prefsMap[like.$id] || [];
            if (!user) return null;

            return (
              <motion.div
                key={like.$id}
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
                    alt={user.nombre_usuario}
                    onError={(e) => { e.target.src = '/userDefault.png'; }}
                  />
                  <div className="profile-info">
                    <h3>{user.nombre_usuario}</h3>
                    <p className="profile-description">{user.descripcion}</p>
                  </div>
                </div>

                <div className="game-preferences">
                  <h4>{t('requests.gamePreferences')}</h4>
                  <ul>
                    {games.length > 0 ? (
                      games.map(pref => (
                        <li key={pref.$id} className="game-item">
                          <span className="game-name">{pref.nombre}</span>
                        </li>
                      ))
                    ) : (
                      <li className="no-preferences">{t('requests.noPreferences')}</li>
                    )}
                  </ul>
                </div>

                <div className="actions">
                  <Button
                    onClick={() => handleDecision(like, 'reject')}
                    variant="secondary"
                    className="Reject"
                  >
                    {t('requests.reject')}
                  </Button>
                  <Button
                    onClick={() => handleDecision(like, 'accept')}
                    variant="primary"
                  >
                    {t('requests.accept')}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
}
