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

// Referencias a elementos del DOM de la sección de autenticación
const loginSection = document.getElementById('login-section');
const callSection = document.getElementById('call-section');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('login-button');
const errorMessage = document.getElementById('error-message');
const logoutButton = document.getElementById('logout-button');

// Referencias a elementos del DOM para llamadas
const startCallButton = document.getElementById('start-call-button');
const leaveCallButton = document.getElementById('leave-call-button');
const callContainer = document.getElementById('call-container');

// URL de tu sala de Daily.co (¡CAMBIA ESTA URL A UN NOMBRE APROPIADO Y RESPETUOSO!)
const DAILY_ROOM_URL = "https://niggerssss.daily.co/Niggers"; // ¡CÁMBIALA AQUÍ!
let callFrame = null; // Para almacenar la instancia de la llamada

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

// --- Lógica de Llamadas (Daily.co) ---
// NOTA: DailyIframe ya está disponible globalmente porque lo cargamos en index.html

startCallButton.addEventListener('click', () => {
    // Asegúrate de que no haya una llamada activa y que DailyIframe esté disponible
    if (!callFrame && typeof DailyIframe !== 'undefined') {
        callFrame = DailyIframe.createFrame({ // <--- CORRECCIÓN CLAVE AQUÍ: PASAR UN OBJETO
            iframeStyle: {
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: '0',
                zIndex: 9999
            },
            frameParent: callContainer, // <--- PROPIEDAD CORRECTA PARA EL CONTENEDOR
            showLeaveButton: false 
        });

        // Asegúrate de que la URL de la sala se pasa en el método .join() UNA SOLA VEZ
        callFrame.join({
            url: DAILY_ROOM_URL, 
            userName: auth.currentUser ? auth.currentUser.email : 'Usuario Anónimo'
        });

        startCallButton.style.display = 'none';
        leaveCallButton.style.display = 'block';
        callContainer.innerHTML = ''; // Limpia el mensaje "Aquí Daily.co..."
    } else if (typeof DailyIframe === 'undefined') {
        console.error("Error: DailyIframe no está cargado. ¿Verificaste la línea en index.html?");
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

// Observa el estado de autenticación (si el usuario está logueado o no)
// Esto también limpia la llamada si el usuario se desloguea mientras está en una llamada
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Usuario logueado
        loginSection.style.display = 'none';
        callSection.style.display = 'block';
        console.log("Usuario logueado:", user.email);
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