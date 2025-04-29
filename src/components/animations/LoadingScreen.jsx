import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoadingPage = () => {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const alreadyReloaded = localStorage.getItem('alreadyReloaded');

        if (!alreadyReloaded) {
            localStorage.setItem('alreadyReloaded', 'true');
            window.location.reload();
            return; // evita continuar en esta carga
        }

        const timer = setTimeout(() => {
            setIsVisible(false); // comienza animación de salida
            setTimeout(() => {
                localStorage.removeItem('alreadyReloaded'); // limpia para futuros usos
                navigate('/CrearPrefJuegos');
            }, 800); // espera a que termine la animación de salida
        }, 3000); // tiempo de "carga"

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
                        Registrando Jugador...
                    </motion.h1>
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
    }
};

export default LoadingPage;
