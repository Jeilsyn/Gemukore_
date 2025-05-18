import TutorialesC from '../components/Tutoriales/tutorialesC';
import { useUser } from '../context/AuthContext';

export default function Tutoriales() {
  const { current } = useUser(); // current.$id es tu ID usuario Appwrite
  if (!current) return <p>Cargando tutoriales ...</p>;
  console.log(current.$id)
  return <TutorialesC userId={current.$id} />;
}
