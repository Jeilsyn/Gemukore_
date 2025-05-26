import { useState } from "react";
import { useUser } from "../../context/AuthContext.jsx";
import Input from "../ui/Input.jsx";
import Button from "../ui/Button.jsx";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  fadeInForm,
  slideInInput,
  scaleInMessage
} from "../animations/animation.js";
import "../../styles/Auth/Loggin.css";

//Manejo de Login 
const LoginForm = () => {
  const user = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [valid, setValid] = useState(null);
  const [loading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    setValid(null);

    try {
      await user.login(email, password);
      //Esta parte es irrelevante, se redirigue directamente a dentro de la app 
      setValid("¡Inicio de sesión exitoso! Redirigiendo...");
    } catch (err) {
      setError(err.message || "Credenciales incorrectas. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  //Comproboaciones al realizar el envío
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Email inválido");
      return;
    }

    //por ultimo si todo bien directamente se hace el login del usuario 
    handleLogin();
  };

  return (
    //Aplicación de los motions de animations.js
    <motion.form
      onSubmit={handleSubmit}
      noValidate
      className="login-form"
      {...fadeInForm}
    >
      <motion.div {...slideInInput(0.1)}>
        <Input
          label="Correo electrónico"
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
      </motion.div>

      <motion.div {...slideInInput(0.3)}>
        <Input
          label="Contraseña"
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
      </motion.div>

      {valid && (
        <motion.div
          className="success-message"
          role="status"
          {...scaleInMessage(0.4)}
        >
          {valid}
        </motion.div>
      )}

      {error && (
        <motion.div
          className="error-message"
          role="alert"
          {...scaleInMessage(0.5)}
        >
          {error}
        </motion.div>
      )}

      <motion.div className="form-link" {...slideInInput(0.5)}>
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </motion.div>

      <motion.div className="form-button" {...slideInInput(0.6)}>
        <Button loading={loading} type="submit" className="login-button">
          Iniciar sesión
        </Button>
      </motion.div>
    </motion.form>
  );
};

export default LoginForm;
