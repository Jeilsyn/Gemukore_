const { Client, Users } = require("node-appwrite");
const express = require("express");
const cors = require("cors");

const app = express();

// Configuración de CORS 
const corsOptions = {
  origin: 'http://localhost:3000', //   URL de frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false, 
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Configuración de Appwrite 
const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("680e27de001ffc71f5a7")
  .setKey("standard_dc04ffd421eb1b1fb48742f8a808d8884e9cbad6f960764b58870793532c23bb8d76ca6fb64a816b5a32f19d8c46095d73d9e74a9f879f38f4844314fe6bb1fd02857e60cbcea3e9a95b06551ac1af659b70cf080540a0f66b331ce6dd123ef87e85ef0eead2632171e69625d2013970821637baf847a24916d276dd87bd7f3e"); // ¡NO USES LA KEY QUE PUBLICASTE ANTES!

const users = new Users(client);

// Endpoint  para eliminar usuarios
app.post("/eliminar-usuario", async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "ID de usuario requerido" });
    }

    const result = await users.delete(userId);
    
    res.json({
      success: true,
      message: "Usuario eliminado exitosamente",
      data: result
    });
    
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Error al eliminar usuario"
    });
  }
});


app.post("/bloquear", async (req, res) => {
  const { userId, block } = req.body;

  const response = await fetch(`https://fra.cloud.appwrite.io/v1/users/${userId}/status`, {
    method: "POST",
    headers: {
      "X-Appwrite-Project": client.config.project,
      "X-Appwrite-Key": client.config.key,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status: block })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`HTTP ${response.status}: ${error.message}`);
  }

  const updatedUser = await users.get(userId);
  res.json({
    success: updatedUser.status === (block ? 'blocked' : 'active'),
    actualStatus: updatedUser.status
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

const PORT = 3002  ; // Usa un puerto diferente;
app.listen(PORT, () => {
  console.log(`✅ Servidor backend corriendo en http://localhost:${PORT}`);
});