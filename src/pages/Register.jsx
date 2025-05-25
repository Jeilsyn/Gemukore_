import RegisterForm from "../components/auth/registerForm";
import "../styles/Auth/Register.css";

export function Register() {
  return (
    <section className="register-container">
      <h1>Registro de sesión</h1>
      <RegisterForm />
    </section>
  );
}
