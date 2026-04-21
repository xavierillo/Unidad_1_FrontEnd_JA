const API_URL = "http://localhost:3000/api/auth/login";

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  clearMessages();

  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value.trim();

  let isValid = true;

  if (!email) {
    emailError.textContent = "Debe ingresar su correo electrónico.";
    isValid = false;
  }

  if (!password) {
    passwordError.textContent = "Debe ingresar su contraseña.";
    isValid = false;
  }

  if (!isValid) {
    loginMessage.textContent = "Se necesita rellenar los campos requeridos.";
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      loginMessage.textContent = data.message || "Credenciales incorrectas.";
      return;
    }

    // Guardar token y usuario en localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // Redirección según rol
    console.log(data.data.user.role)
    redirectByRole(data.data.user.role);

  } catch (error) {
    console.error("Error en login:", error);
    loginMessage.textContent = "No fue posible conectar con el servidor.";
  }
});

function clearMessages() {
  emailError.textContent = "";
  passwordError.textContent = "";
  loginMessage.textContent = "";
}

function redirectByRole(role) {
  if (role === "user") {
    window.location.href = "../dashboard/dashboard-user.html";
    return;
  }

  if (role === "coach") {
    window.location.href = "../dashboard/dashboard-coach.html";
    return;
  }

  if (role === "admin") {
    window.location.href = "../dashboard/dashboard-admin.html";
    return;
  }

  loginMessage.textContent = "Rol de usuario no reconocido.";
}