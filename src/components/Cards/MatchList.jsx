import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getMatchesWithGameInfo } from '../../lib/services/appwrite/collections';
import UserCard from './UserCard';
import '../../styles/Match/MtachCards.css';

function MatchList({ userId }) {
  const { t } = useTranslation();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadMatches() {
      if (!userId) return;
      try {
        setLoading(true);
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
  matches.map((match) => (
    <UserCard key={match.$id} match={match} />
  ))
)}

      </div>
    </div>
  );
}

export default MatchList;
