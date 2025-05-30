import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/AuthContext';
import { getUserProfile } from '../lib/services/appwrite/collections';
import { Client, Storage } from 'appwrite';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInNav2, coolGameEntrance } from './animations/animation';
import '../styles/Home/NavBar.css';

const NavBar = () => {
  const { t } = useTranslation();
  const { current, logout } = useUser();
  const [profile, setProfile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const ADMIN = '682a1d8a003387bdeeb7';
  // Cargar datos del perfil al montar el componente
  useEffect(() => {
    const fetchProfile = async () => {
      if (current) {
        try {
          const data = await getUserProfile(current.$id);
          setProfile(data);

          const client = new Client()
            .setEndpoint('https://fra.cloud.appwrite.io/v1')
            .setProject('680e27de001ffc71f5a7');

          const storage = new Storage(client);
          const fileId = data.foto_perfil_url?.split('/files/')[1]?.split('/')[0];
          const bucketId = '680e342900053bdb9610';

          if (fileId) {
            const url = `https://fra.cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${fileId}/view?project=680e27de001ffc71f5a7`;
            setPreviewUrl(url);
          }
        } catch (error) {
          console.error(t('navbar.errors.getProfile'), error);
        }
      }
    };

    fetchProfile();
  }, [current, t]);
  // Detectar clics fuera del menú desplegable y cerrarlo
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !event.target.closest('.hamburger-menu')
      ) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);
  // Mostrar u ocultar el menú de perfil
  const handleProfileClick = () => {
    setDropdownOpen(!dropdownOpen);
  };
  // Ir al perfil de usuario
  const goToProfile = () => {
    setDropdownOpen(false);
    setMenuOpen(false);
    navigate('/settings');
  };
  // Mostrar u ocultar el menú móvil
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="header" {...coolGameEntrance}>
      <Link to="/" className="logo-link">
        <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Logo" className="navbar-logo" />
      </Link>
      <motion.nav className="navbar" {...fadeInNav2}>
        <ul className={`nav-list ${menuOpen ? 'open' : ''}`}>
          {!current && (
            <li>
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                {t('navbar.login')}
              </Link>
            </li>
          )}

          {current && profile && (
            <>
              {current.$id === ADMIN ? (
                <>
                  <li>
                    <Link to="/tutoriales" onClick={() => setMenuOpen(false)}>
                      {t('navbar.tutorials')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/tutorialesAdmin" onClick={() => setMenuOpen(false)}>
                      {t('navbar.uploadTutorials')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/historialUsuarios" onClick={() => setMenuOpen(false)}>
                      {t('navbar.userHistory')}
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/match" onClick={() => setMenuOpen(false)}>
                      {t('navbar.match')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/requests" onClick={() => setMenuOpen(false)}>
                      {t('navbar.requests')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/gameBoard" onClick={() => setMenuOpen(false)}>
                      {t('navbar.list')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/tutoriales" onClick={() => setMenuOpen(false)}>
                      {t('navbar.tutorials')}
                    </Link>
                  </li>
                 
                  <li className="nav-info">
                    {profile.thomcoins} {t('navbar.thomcoins')}
                  </li>
                </>
              )}

              <li className="nav-profile" ref={dropdownRef}>
                <img
                  src={previewUrl || '/default-profile.png'}
                  alt={t('navbar.profileImageAlt')}
                  className="profile-image"
                  onClick={handleProfileClick}
                />
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="dropdown-menu"
                    >
                      {current.$id !== ADMIN && (
                        <button className="dropdown-item" onClick={goToProfile}>
                          {t('navbar.viewProfile')}
                        </button>
                      )}
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                          setMenuOpen(false);
                        }}
                      >
                        {t('navbar.logout')}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            </>
          )}
        </ul>
      </motion.nav>
      <div className='botonDiv'>
        <button
          className={`hamburger-menu ${menuOpen ? 'open' : ''}`}
          onClick={toggleMenu}
          aria-label={menuOpen ? t('menu.close') : t('menu.open')}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
};

export default NavBar;