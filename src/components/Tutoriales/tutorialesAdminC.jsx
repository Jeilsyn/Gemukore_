import React, { useEffect, useState } from 'react';
import {
  createTutorial,
  updateTutorial,
  deleteTutorial,
  getAllTutorials,
  getAllVideoGames,
} from '../../lib/services/appwrite/collections';
import { account } from '../../lib/services/appwrite/appwriteClient';
import { motion } from 'framer-motion';
import "../../styles/Tutoriales/tutorialesF.css";

const initialState = {
  titulo: '',
  Contenido: '',
  nivel_recomendado: '',
  url_video: '',
  videojuego_id: '',
};

const nivelesRecomendados = [
  { value: 'principiante', label: 'Principiante' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'veterano', label: 'Veterano' },
];

const AdminTutorialForm = () => {
  const [form, setForm] = useState(initialState);
  const [editingId, setEditingId] = useState(null);
  const [tutoriales, setTutoriales] = useState([]);
  const [videojuegos, setVideojuegos] = useState([]);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    loadTutoriales();
    loadVideojuegos();
  }, []);

  const loadTutoriales = async () => {
    const data = await getAllTutorials();
    setTutoriales(data);
  };

  const loadVideojuegos = async () => {
    try {
      const data = await getAllVideoGames();
      setVideojuegos(data);
    } catch (error) {
      console.error('Error cargando videojuegos:', error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await account.get();
      const tutorialData = {
        ...form,
        vistas: 0,
        fecha_creacion: new Date().toISOString(),
      };

      if (editingId) {
        await updateTutorial(editingId, tutorialData);
        setMensaje(' Tutorial actualizado.');
      } else {
        await createTutorial(tutorialData);
        setMensaje(' Tutorial creado.');
      }

      setForm(initialState);
      setEditingId(null);
      loadTutoriales();
    } catch (error) {
      console.error(error);
      setMensaje(' Error al guardar el tutorial.');
    }
  };

  const handleEdit = (tutorial) => {
    console.log("Tutorial para editar:", tutorial);
    setForm({
      titulo: tutorial.titulo,
      Contenido: tutorial.Contenido,
      nivel_recomendado: tutorial.nivel_recomendado,
      url_video: tutorial.url_video,
      videojuego_id: tutorial.videojuego_id ? tutorial.videojuego_id.$id : '',
    });
    setEditingId(tutorial.$id);
  };
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este tutorial?')) {
      await deleteTutorial(id);
      setMensaje(' Tutorial eliminado.');
      loadTutoriales();
    }
  };

  return (
    <motion.div
      className="tutorial-form-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2>{editingId ? 'Editar' : 'Crear'} Tutorial</h2>

      <form onSubmit={handleSubmit} className="tutorial-form">
        <motion.input
          name="titulo"
          placeholder="Título"
          value={form.titulo}
          onChange={handleChange}
          required
          whileFocus={{ scale: 1.02 }}
        />
        <motion.textarea
          name="Contenido"
          placeholder="Contenido"
          value={form.Contenido}
          onChange={handleChange}
          rows={4}
          required
          whileFocus={{ scale: 1.02 }}
        />

        <label>Nivel recomendado</label>
        <select
          name="nivel_recomendado"
          value={form.nivel_recomendado}
          onChange={handleChange}
          required
        >
          <option value="" disabled>Selecciona un nivel</option>
          {nivelesRecomendados.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <input
          name="url_video"
          placeholder="URL del video"
          value={form.url_video}
          onChange={handleChange}
          required
        />

        <label>Videojuego</label>
        <select
          name="videojuego_id"
          value={form.videojuego_id}
          onChange={handleChange}
        >
          <option value="">Selecciona un videojuego</option>
          {videojuegos.map((juego) => (
            <option key={juego.$id} value={juego.$id}>
              {juego.nombre}
            </option>
          ))}
        </select>

        <motion.button
          type="submit"
          className="btn-submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {editingId ? 'Actualizar' : 'Crear'} Tutorial
        </motion.button>
      </form>

      {mensaje && <p className="mensaje">{mensaje}</p>}

      <hr />

      <h3>Tutoriales existentes</h3>
      <motion.ul
        className="tutorial-list"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        {tutoriales.map((t) => (
          <motion.li
            key={t.$id}
            className="tutorial-item"
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            <div>
              <strong>{t.titulo}</strong> — Nivel: {nivelesRecomendados.find(n => n.value === t.nivel_recomendado)?.label || t.nivel_recomendado}
            </div>
            <div className="actions">
              <button onClick={() => handleEdit(t)}> Editar</button>
              <button className="Eliminarbtn" onClick={() => handleDelete(t.$id)}> Eliminar</button>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  );
};

export default AdminTutorialForm;
