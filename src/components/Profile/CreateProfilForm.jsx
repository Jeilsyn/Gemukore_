import { useState, useEffect } from "react";
import { account, storage } from "../../lib/services/appwrite/appwriteClient";
import { createUserProfile } from "../../lib/services/appwrite/collections";
import { useNavigate } from "react-router-dom";
import Input from "../ui/InputPerfil";
import Button from "../ui/Button";
import { ID, Permission } from "appwrite";
import Modal from "../ui/Modal";
import { motion } from "framer-motion";
import "../../styles/CreateProfile/perfil1.css";
import { fadeInUp, fadeIn, scaleFadeIn } from "../animations/animation";

const BUCKET_ID = "680e342900053bdb9610";

// Componente principal para la creación del perfil
const CrearPerfil = () => {
  const [form, setForm] = useState({
    nombre_usuario: "",
    descripcion: "",
    thomcoins: 0,
    nivel_jugador: "principiante",
    tema_app: "claro",
    text_size: 12,
    idioma: "es",
    foto_perfil_url: "",
    email: "",
    fecha_registro: new Date().toISOString(),
  });

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await account.get();
        setForm((prev) => ({
          ...prev,
          email: user.email,
          nombre_usuario: user.name || "",
        }));
      } catch (err) {
        console.error("Error cargando datos del usuario:", err);
        navigate("/login");
      }
    };
    loadUserData();
  }, [navigate]);

  // Gestión del cambio de imagen y validaciones básicas
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith("image/")) {
      alert("Por favor, selecciona un archivo de imagen");
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert("La imagen es demasiado grande (máximo 5MB)");
      return;
    }
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };
  // Subida de imagen al bucket de Appwrite con permisos adecuados
  const uploadImage = async (user) => {
    if (!file) return null;
    try {
      const response = await storage.createFile(
        BUCKET_ID,
        ID.unique(),
        file,
        [
          Permission.read(`user:${user.$id}`),
          Permission.update(`user:${user.$id}`),
          Permission.delete(`user:${user.$id}`),
        ]
      );
      return storage.getFilePreview(BUCKET_ID, response.$id).toString();
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      throw error;
    }
  };

    // Maneja los cambios en los inputs del formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

    // Maneja los cambios en los selects
  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

    // Manejo del envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await account.get();
      let imageUrl = form.foto_perfil_url;
      if (file) {
        imageUrl = await uploadImage(user);
      }
      // Construcción del objeto perfil con datos obligatorios y por defecto
      const profileData = {
        nombre_usuario: form.nombre_usuario,
        descripcion: form.descripcion,
        thomcoins: 2500,
        nivel_jugador: form.nivel_jugador,
        text_size: parseInt(12),
        idioma: form.idioma,
        foto_perfil_url: imageUrl || "",
        email: user.email,
        fecha_registro: new Date().toISOString(),
        ultima_bonificacion: new Date().toISOString(),
      };

      await createUserProfile(profileData, user.$id);
      setShowModal(true);
    } catch (err) {
      console.error("Error al crear perfil:", err);
      alert(`Error al crear perfil: ${err.message}`);
    }
  };
  // Cierra el modal y redirige
  const handleCloseModal = () => {
    setShowModal(false);
    navigate("/LoadingPage", { state: { from: 'crearPerfil' } });
  };

  return (
    <motion.div className="profile-form-container" {...fadeInUp}>
      <h2>Completa tu perfil {form.nombre_usuario}</h2>
      <form onSubmit={handleSubmit}>
        <Input label="Nombre de Usuario" name="nombre_usuario" type="text" value={form.nombre_usuario} onChange={handleChange} required />
        <Input label="Descripción" name="descripcion" type="textarea" value={form.descripcion} onChange={handleChange} />

        <div className="form-group">
          <label>Nivel de Jugador</label>
          <select name="nivel_jugador" value={form.nivel_jugador} onChange={handleSelectChange}>
            <option value="principiante">Principiante</option>
            <option value="intermedio">Intermedio</option>
            <option value="veterano">Veterano</option>
          </select>
        </div>


        <div className="form-group">
          <label>Idioma</label>
          <select name="idioma" value={form.idioma} onChange={handleSelectChange}>
            <option value="es">Español</option>
            <option value="en">Inglés</option>
          </select>
        </div>

        <div className="form-group">
          <label>Foto de Perfil</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {uploadProgress > 0 && <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}>{uploadProgress}%</div>}
          {previewUrl && <img src={previewUrl} alt="Vista previa" className="preview-image" />}
        </div>

        {!showModal && (
          <motion.div whileHover={{ scale: 1.05 }}>
            <Button type="submit">Guardar Perfil</Button>
          </motion.div>
        )}
      </form>

      {showModal && (
        <Modal onClose={handleCloseModal}>
          <motion.div {...scaleFadeIn}>
            <h3>¡Perfil creado exitosamente!</h3>
            <p>🎉 Has recibido <strong>2,500 Thomcoins</strong> de bienvenida.</p>
            <p>💡 Cada vez que hagas un match, se descontarán <strong>100 Thomcoins</strong>.</p>
            <p>🕒 Cada 24 horas recibirás un bono de <strong>500 Thomcoins</strong> automáticamente.</p>
          </motion.div>
        </Modal>
      )}
    </motion.div>
  );
};

export default CrearPerfil;
