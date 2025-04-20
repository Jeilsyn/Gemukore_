import LoginForm from "../components/auth/loginForm";
import "../styles/login.css";

export function Login() {
  return (
    <section className="login-container">
      <h1>Iniciar sesión</h1>
      <LoginForm />
    </section>
  );
}
