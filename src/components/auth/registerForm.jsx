import { useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../context/AuthContext";
import Input from "../ui/Input";
import Button from "../ui/Button.jsx";

const RegisterForm = () => {
  const { register } = useUser();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [valid, setValid] = useState(null);


  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.id]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setValid(null);

    if (form.password !== form.confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    if (!/^[a-zA-Z0-9._-]{1,36}$/.test(form.username) || /^[-_]/.test(form.username)) {
      alert("Nombre de usuario inválido.");
      return;
    }
    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      alert("Por favor ingresa un email válido.");
      return;
    }

    setLoading(true);
    try {
      await register(form.email, form.password, form.username);
      setValid("Registro de sesión exitoso! Redirigiendo...");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registerPage">
      <h2>Registro</h2>
      <form onSubmit={handleRegister}>
        <Input id="username" label="Username" value={form.username} onChange={handleChange} />
        <Input id="email" label="Email" type="email" value={form.email} onChange={handleChange} />
        <Input id="password" label="Password" type="password" value={form.password} onChange={handleChange} />
        <Input id="confirmPassword" label="Confirm Password" type="password" value={form.confirmPassword} onChange={handleChange} />
        {valid && (
          <div className="success-message" role="status">
            {valid}
          </div>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Cargando..." : "Registrar"}
        </Button>


        <div>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
