import { useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../context/AuthContext";
import Input from "../ui/Input";
import Button from "../ui/Button.jsx";
import { motion } from "framer-motion";
import {
  fadeInForm,
  slideInInput,
  scaleInMessage
} from "../animations/animation.js";
import "../../styles/Auth/Register.css";

const RegisterForm = () => {
  const { register } = useUser();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [valid, setValid] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setError(null);
    setValid(null);
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setValid(null);
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!/^[a-zA-Z0-9._-]{1,36}$/.test(form.username) || /^[-_]/.test(form.username)) {
      setError("Nombre de usuario inválido.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Por favor ingresa un email válido.");
      return;
    }

    setLoading(true);
    try {
      await register(form.email, form.password, form.username);
      setValid("Registro exitoso! Redirigiendo...");
    } catch (err) {
      setError(err.message || "Error en el registro.");
    } finally {
      setLoading(false);
    }
  };

  return (
<motion.form
  onSubmit={handleRegister}
  noValidate
  className="register-form"
  {...fadeInForm}
>
  <motion.div {...slideInInput(0.1)}>
    <Input
      id="username"
      label="Nombre de usuario"
      value={form.username}
      onChange={handleChange}
      disabled={loading}
    />
  </motion.div>

  <motion.div {...slideInInput(0.2)}>
    <Input
      id="email"
      label="Correo electrónico"
      type="email"
      value={form.email}
      onChange={handleChange}
      disabled={loading}
    />
  </motion.div>

  <motion.div {...slideInInput(0.3)}>
    <Input
      id="password"
      label="Contraseña"
      type="password"
      value={form.password}
      onChange={handleChange}
      disabled={loading}
    />
  </motion.div>

  <motion.div {...slideInInput(0.4)}>
    <Input
      id="confirmPassword"
      label="Confirmar contraseña"
      type="password"
      value={form.confirmPassword}
      onChange={handleChange}
      disabled={loading}
    />
  </motion.div>

  {valid && (
    <motion.div
      className="register-success-message"
      role="status"
      {...scaleInMessage(0.5)}
    >
      {valid}
    </motion.div>
  )}

  {error && (
    <motion.div
      className="register-error-message"
      role="alert"
      {...scaleInMessage(0.6)}
    >
      {error}
    </motion.div>
  )}

  <motion.div className="form-link" {...slideInInput(0.6)}>
    ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
  </motion.div>

  <motion.div className="register-button-container" {...slideInInput(0.7)}>
    <Button type="submit" className="register-button" disabled={loading}>
      {loading ? "Registrando..." : "Registrar"}
    </Button>
  </motion.div>
</motion.form>
  );
};

export default RegisterForm;
