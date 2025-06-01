
// Importa las funciones necesarias de Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

// Tu configuración de Firebase (LA QUE COPIASTE DE FIREBASE)
const firebaseConfig = {
  apiKey: "AIzaSyBQ0mxv3xCa9IgbqNC9aS1duZ3OC9l_Rzc",
  authDomain: "web-llamada.firebaseapp.com",
  projectId: "web-llamada",
  storageBucket: "web-llamada.firebasestorage.app",
  messagingSenderId: "954960860102",
  appId: "1:954960860102:web:3561459a2f0f98593858c7",
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Referencias a elementos del DOM
const loginSection = document.getElementById('login-section');
const callSection = document.getElementById('call-section');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('login-button');
const errorMessage = document.getElementById('error-message');
const logoutButton = document.getElementById('logout-button');

// --- Lógica de Autenticación ---

loginButton.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    errorMessage.textContent = ''; // Limpiar mensaje de error previo

    try {
        await signInWithEmailAndPassword(auth, email, password);
        // Si el login es exitoso, el onAuthStateChanged se encargará de mostrar la sección de llamadas
    } catch (error) {
        console.error("Error de login:", error.message);
        errorMessage.textContent = 'Error de inicio de sesión: Credenciales incorrectas o usuario no encontrado.';
    }
});

logoutButton.addEventListener('click', async () => {
    try {
        await signOut(auth);
        // Cuando el usuario cierra sesión, el onAuthStateChanged ocultará la sección de llamadas
    } catch (error) {
        console.error("Error al cerrar sesión:", error.message);
    }
});

// Observa el estado de autenticación (si el usuario está logueado o no)
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Usuario logueado
        loginSection.style.display = 'none'; // Oculta la sección de login
        callSection.style.display = 'block'; // Muestra la sección de llamadas
        console.log("Usuario logueado:", user.email);
    } else {
        // Usuario no logueado (o ha cerrado sesión)
        loginSection.style.display = 'block'; // Muestra la sección de login
        callSection.style.display = 'none'; // Oculta la sección de llamadas
        console.log("Usuario deslogueado");
    }
});

/// ... (Tu código Firebase anterior) ...

// Importa Daily.co (asegúrate de que esta URL sea la más reciente si Daily.co la actualiza)
// También puedes usar: <script src="https://unpkg.com/@daily-co/daily-js"></script> en tu HTML
import DailyIframe from "https://unpkg.com/@daily-co/daily-js";

// Referencias a elementos del DOM para llamadas
const startCallButton = document.getElementById('start-call-button');
const leaveCallButton = document.getElementById('leave-call-button');
const callContainer = document.getElementById('call-container');

// URL de tu sala de Daily.co (¡REEMPLAZA CON LA TUYA!)
const DAILY_ROOM_URL = "https://niggerssss.daily.co/Niggers"; // <-- AQUÍ ES DONDE LO PONES
let callFrame = null; // Para almacenar la instancia de la llamada

// --- Lógica de Llamadas ---

startCallButton.addEventListener('click', () => {
    // Asegúrate de que no haya una llamada activa
    if (!callFrame) {
        callFrame = DailyIframe.createFrame({
            iframeStyle: {
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: '0',
                zIndex: 9999
            },
            parent: callContainer, // Renderiza la llamada dentro de este div
            showLeaveButton: false // Oculta el botón de colgar de Daily.co, usaremos el nuestro
        });

        callFrame.join({
            url: DAILY_ROOM_URL,
            // Puedes pasar un nombre de usuario si quieres que se muestre en la llamada
            userName: auth.currentUser ? auth.currentUser.email : 'Usuario Anónimo'
        });

        startCallButton.style.display = 'none';
        leaveCallButton.style.display = 'block';
        callContainer.innerHTML = ''; // Limpia el mensaje "Aquí Daily.co..."
    }
});

leaveCallButton.addEventListener('click', () => {
    if (callFrame) {
        callFrame.leave();
        callFrame.destroy(); // Destruye la instancia del iframe
        callFrame = null;

        startCallButton.style.display = 'block';
        leaveCallButton.style.display = 'none';
        callContainer.innerHTML = '<p>Haz clic en "Iniciar Llamada" para empezar.</p>'; // Mensaje por defecto
    }
});

// Esto es importante para limpiar la llamada si el usuario se desloguea mientras está en una llamada
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Usuario logueado
        loginSection.style.display = 'none';
        callSection.style.display = 'block';
        console.log("Usuario logueado:", user.email);
        // Si hay una llamada activa y el usuario vuelve a loguearse (raro), no pasa nada
    } else {
        // Usuario no logueado (o ha cerrado sesión)
        loginSection.style.display = 'block';
        callSection.style.display = 'none';
        console.log("Usuario deslogueado");
        // Asegúrate de colgar si el usuario se desloguea
        if (callFrame) {
            callFrame.leave();
            callFrame.destroy();
            callFrame = null;
            startCallButton.style.display = 'block';
            leaveCallButton.style.display = 'none';
            callContainer.innerHTML = '<p>Haz clic en "Iniciar Llamada" para empezar.</p>';
        }
    }
});