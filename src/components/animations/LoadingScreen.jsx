import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import consejosJuegos from '../../data/consejos.json'; // Asegúrate de que la ruta sea correcta
import { useLocation } from 'react-router-dom';

const LoadingPage = () => {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(true);
    const [consejo, setConsejo] = useState(null);
    const location = useLocation();
    useEffect(() => {
        // Elegir consejo aleatorio del JSON
        const random = Math.floor(Math.random() * consejosJuegos.length);
        setConsejo(consejosJuegos[random]);

        const alreadyReloaded = localStorage.getItem('alreadyReloaded');

        if (!alreadyReloaded) {
            localStorage.setItem('alreadyReloaded', 'true');
            window.location.reload();
            return;
        }

        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => {
              localStorage.removeItem('alreadyReloaded');
          
              // Redirige según el origen
              if (location.state?.from === 'crearPerfil') {
                navigate('/CrearPrefJuegos');
              } else {
                navigate('/Settings');
              }
            }, 3000);
          }, 3000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    style={styles.container}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        style={styles.spinner}
                    />
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        style={styles.text}
                    >
                        Espere...
                    </motion.h1>
                    {consejo && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1.2, delay: 1 }}
                            style={styles.consejo}
                        >
                            Consejo para <strong>{consejo.nombre}</strong>: {consejo.consejo}
                        </motion.p>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const styles = {
    container: {
        background: '#0d0d0d',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#00ffcc',
        fontFamily: 'Orbitron, sans-serif',
        padding: '0 20px',
        textAlign: 'center',
    },
    spinner: {
        width: '80px',
        height: '80px',
        border: '6px solid #00ffcc',
        borderTop: '6px solid transparent',
        borderRadius: '50%',
        marginBottom: '20px',
    },
    text: {
        fontSize: '1.5rem',
        letterSpacing: '2px',
    },
    consejo: {
        marginTop: '20px',
        fontSize: '1rem',
        maxWidth: '600px',
        lineHeight: '1.4',
        color: '#cccccc'
    }
};

export default LoadingPage;
