const { Client, Users } = require("node-appwrite");
const express = require("express");
const cors = require("cors");

const app = express();

// Configuración de CORS 
const corsOptions = {
  origin: ['http://localhost:3000', 'https://gemukoree.netlify.app'], //   URL de frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, 
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Configuración de Appwrite 
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY); 

const users = new Users(client);


// Endpoint  para eliminar usuarios
app.post("/api/eliminar-usuario", async (req, res) => {
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


app.post("/api/bloquear", async (req, res) => {
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