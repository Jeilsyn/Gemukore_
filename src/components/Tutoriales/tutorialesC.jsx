import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  getAllVideoGames,
  getTutorialsByFilters,
  getTutorialById
} from '../../lib/services/appwrite/collections';
import "../../styles/Tutoriales/tutoriales.css";

const TutorialesC = ({ userId }) => {
  const { t } = useTranslation();
  const [videojuegos, setVideojuegos] = useState([]);
  const [tutoriales, setTutoriales] = useState([]);
  const [selectedJuego, setSelectedJuego] = useState('');
  const [selectedNivel, setSelectedNivel] = useState('');
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const nivelesRecomendados = ['principiante', 'intermedio', 'veterano'];

  useEffect(() => {
    const fetchVideojuegos = async () => {
      try {
        const response = await getAllVideoGames();
        setVideojuegos(response);
      } catch (err) {
        setError(t('tutorials.errors.loadGames'));
        console.error(err);
      }
    };
    fetchVideojuegos();
  }, [t]);

  useEffect(() => {
    const fetchTutoriales = async () => {
      setLoading(true);
      try {
        const response = await getTutorialsByFilters(selectedJuego, selectedNivel);
        setTutoriales(response);
        setLoading(false);
      } catch (err) {
        setError(t('tutorials.errors.loadTutorials'));
        console.error(err);
        setLoading(false);
      }
    };
    fetchTutoriales();
  }, [selectedJuego, selectedNivel, t]);

  const handleTutorialClick = async (tutorial) => {
    try {
      const fullTutorial = await getTutorialById(tutorial.$id);
      setSelectedTutorial(fullTutorial);
    } catch (err) {
      setError(t('tutorials.errors.loadTutorial'));
      console.error(err);
    }
  };

  const handleBackToList = () => setSelectedTutorial(null);

  if (error) return <div className="error-msg">{error}</div>;

  if (selectedTutorial) {
    return (
      <div className="tutorial-container">
        <button onClick={handleBackToList} className="back-button">
       {t('tutorials.backButton')}
        </button>

        <div className="tutorial-detail">
          <h2>{selectedTutorial.titulo}</h2>
          <div className="tutorial-meta">
            <span className="tag">{t(`levels.${selectedTutorial.nivel_recomendado}`)}</span>
           
          </div>
          <div className="tutorial-content">
            <p>{selectedTutorial.Contenido}</p>
          </div>
          {selectedTutorial.url_video && (
            <div className="tutorial-video">
              <h3>{t('tutorials.relatedVideo')}</h3>
              <div className="video-wrapper">
                <iframe
                  src={selectedTutorial.url_video.replace("watch?v=", "embed/")}
                  title={t('tutorials.videoTitle')}
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
    <div className="tutorial-container">
      <h1 className="title">{t('tutorials.title')}</h1>

      <div className="filter-grid">
        <div>
          <label className="select-label">{t('tutorials.selectGame')}</label>
          <select
            value={selectedJuego}
            onChange={(e) => setSelectedJuego(e.target.value)}
            className="select-box"
          >
            <option value="">{t('tutorials.allGames')}</option>
            {videojuegos.map(juego => (
              <option key={juego.$id} value={juego.$id}>{juego.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="select-label">{t('tutorials.recommendedLevel')}</label>
          <select
            value={selectedNivel}
            onChange={(e) => setSelectedNivel(e.target.value)}
            className="select-box"
          >
            <option value="">{t('tutorials.allLevels')}</option>
            {nivelesRecomendados.map(nivel => (
              <option key={nivel} value={nivel}>{t(`levels.${nivel}`)}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-msg">{t('tutorials.loading')}</div>
      ) : tutoriales.length === 0 ? (
        <div className="no-results">{t('tutorials.noTutorials')}</div>
      ) : (
        <div className="tutorial-list">
          {tutoriales.map(tutorial => (
            <motion.div
              key={tutorial.$id}
              onClick={() => handleTutorialClick(tutorial)}
              className="tutorial-card"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className='TituloH3'>{tutorial.titulo}</h3>
              <div className="card-meta">
                <span className="tag">{t(`levels.${tutorial.nivel_recomendado}`)}</span>
              </div>
              <p className="tutorial-preview">
                {tutorial.Contenido.substring(0, 100)}
                {tutorial.Contenido.length > 100 && '...'}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TutorialesC;
