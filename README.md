# Nombre del proyecto

¡Bienvenido al repositorio del proyecto! Esta aplicación está compuesta por un **frontend** y un **backend** que trabajan juntos para ofrecer una experiencia completa.

## Versión Desplegada

Puedes acceder a la versión en vivo de la aplicación sin necesidad de ninguna instalación.

* **Frontend (Netlify):** [https://gemukoree.netlify.app/](https://gemukoree.netlify.app/)
* **Backend (Render.com):** [https://gemukore-backend.onrender.com](https://gemukore-backend.onrender.com)

El frontend alojado en Netlify se comunica con el backend desplegado en Render.com para manejar las peticiones y los datos.

---

## Configuración Local

Si deseas ejecutar la aplicación en tu máquina, sigue los siguientes pasos.

### Requisitos Previos

Asegúrate de tener instalados **Node.js** y **npm** en tu sistema. Puedes descargarlos desde [el sitio oficial de Node.js](https://nodejs.org/).

### Pasos de Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone [URL-del-repositorio]
    cd [nombre-del-repositorio]
    ```

2.  **Instalar dependencias:**
    La aplicación no incluye la carpeta `node_modules`, así que debes instalar las dependencias con el siguiente comando en la terminal, desde la carpeta principal del proyecto:
    ```bash
    npm install
    ```

### Ejecutar la Aplicación

Para que la aplicación funcione correctamente, debes iniciar tanto el backend como el frontend.

1.  **Iniciar el Backend:**
    Abre una terminal, navega a la carpeta `backend` y ejecuta el siguiente comando:
    ```bash
    cd backend
    node index.js
    ```
    El servidor backend se iniciará en el puerto **3002**. Verás un mensaje en la consola confirmando que está en funcionamiento.

2.  **Iniciar el Frontend:**
    Abre una **nueva terminal** (mantén el backend en ejecución), navega a la carpeta principal del proyecto y ejecuta:
    ```bash
    npm start
    ```
    El frontend se ejecutará en el puerto **3000**.

### Nota Importante

La aplicación depende de una conexión a internet para funcionar correctamente, ya que utiliza **Appwrite** como servicio de backend. Asegúrate de tener una conexión activa mientras la ejecutas.
