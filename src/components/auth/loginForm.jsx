import { useState } from "react";
import { useUser } from "../../context/AuthContext.jsx";
import Input from "../ui/Input.jsx";
import Button from "../ui/Button.jsx";
import { Link } from 'react-router-dom';

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
      setValid("¡Inicio de sesión exitoso! Redirigiendo...");
    } catch (err) {
      setError(err.message || "Credenciales incorrectas. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

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

    handleLogin();
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Input
        label="Correo electrónico"
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        error={error}
      />

      <Input
        label="Contraseña"
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
        error={null}
      />

      {valid && (
        <div className="success-message" role="status">
          {valid}
        </div>
      )

      }

      <div>
        No tienes cuenta?
         <Link to="/register">Registrate</Link>
      </div>

      <Button loading={loading} type="submit" className="login-button">
        Iniciar sesión
      </Button>
    </form>
  );
};

export default LoginForm;
