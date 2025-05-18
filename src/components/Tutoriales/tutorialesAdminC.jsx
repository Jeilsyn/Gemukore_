import React, { useEffect, useState } from 'react';
import {
  createTutorial,
  updateTutorial,
  deleteTutorial,
  getAllTutorials,
  getAllVideoGames,
} from '../../lib/services/appwrite/collections';
import { account } from '../../lib/services/appwrite/appwriteClient';

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

  useEffect(() => {
    loadTutoriales();
    loadVideojuegos();
  }, []);

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
        setMensaje('✅ Tutorial actualizado.');
      } else {
        await createTutorial(tutorialData);
        setMensaje('✅ Tutorial creado.');
      }

      setForm(initialState);
      setEditingId(null);
      loadTutoriales();
    } catch (error) {
      console.error(error);
      setMensaje('❌ Error al guardar el tutorial.');
    }
  };

  const handleEdit = (tutorial) => {
    setForm({
      titulo: tutorial.titulo,
      Contenido: tutorial.Contenido,
      nivel_recomendado: tutorial.nivel_recomendado,
      url_video: tutorial.url_video,
      videojuego_id: tutorial.videojuego_id,
    });
    setEditingId(tutorial.$id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este tutorial?')) {
      await deleteTutorial(id);
      setMensaje('🗑️ Tutorial eliminado.');
      loadTutoriales();
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">{editingId ? 'Editar' : 'Crear'} Tutorial</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="titulo"
          placeholder="Título"
          value={form.titulo}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          name="Contenido"
          placeholder="Contenido"
          value={form.Contenido}
          onChange={handleChange}
          rows={4}
          className="w-full p-2 border rounded"
          required
        />

        {/* Select para nivel recomendado */}
        <label className="block text-sm font-medium text-gray-700">Nivel recomendado</label>
        <select
          name="nivel_recomendado"
          value={form.nivel_recomendado}
          onChange={handleChange}
          className="w-full p-2 border rounded"
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
          className="w-full p-2 border rounded"
          required
        />

        {/* Select para videojuego */}
        <label className="block text-sm font-medium text-gray-700">Videojuego</label>
        <select
          name="videojuego_id"
          value={form.videojuego_id}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="" disabled>Selecciona un videojuego</option>
          {videojuegos.map((juego) => (
            <option key={juego.$id} value={juego.$id}>
              {juego.nombre}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {editingId ? 'Actualizar' : 'Crear'} Tutorial
        </button>
      </form>

      {mensaje && <p className="mt-3 text-sm text-blue-700">{mensaje}</p>}

      <hr className="my-6" />

      <h3 className="text-xl font-semibold mb-2">Tutoriales existentes</h3>
      <ul className="space-y-2">
        {tutoriales.map((t) => (
          <li key={t.$id} className="p-3 border rounded flex justify-between items-center">
            <div>
              <strong>{t.titulo}</strong> — Nivel:{' '}
              {nivelesRecomendados.find(n => n.value === t.nivel_recomendado)?.label || t.nivel_recomendado}
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleEdit(t)}
                className="text-blue-600 hover:underline"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(t.$id)}
                className="text-red-600 hover:underline"
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminTutorialForm;
