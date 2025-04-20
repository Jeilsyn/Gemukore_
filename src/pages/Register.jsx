import RegisterForm from "../components/auth/registerForm";
import "../styles/login.css";

export function Register() {
  return (
    <section className="login-container">
      <h1>Registro de sesión</h1>
      <RegisterForm />
    </section>
  );
}
