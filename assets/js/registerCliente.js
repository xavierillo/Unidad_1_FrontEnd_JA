const API_URL = "http://localhost:3000/api/auth/register";

const registerForm = document.getElementById("registerForm");

const fullNameInput = document.getElementById("full_name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const birthDateInput = document.getElementById("birth_date");
const playsSportInput = document.getElementById("plays_sport");
const sportNameInput = document.getElementById("sport_name");
const frequencyInput = document.getElementById("frequency_per_week");
const formMessage = document.getElementById("formMessage");

const errorFields = {
    full_name: document.getElementById("full_nameError"),
    email: document.getElementById("emailError"),
    password: document.getElementById("passwordError"),
    birth_date: document.getElementById("birth_dateError"),
    sport_name: document.getElementById("sport_nameError"),
    frequency_per_week: document.getElementById("frequency_per_weekError")
};

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessages();

    const full_name = fullNameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value.trim();
    const birth_date = birthDateInput.value.trim();
    const playsSport = playsSportInput.checked;
    const sportName = sportNameInput.value.trim();
    const frequencyPerWeek = frequencyInput.value.trim();

    let isValid = true;

    if (!full_name) {
        setError("full_name", "El nombre completo es obligatorio.");
        isValid = false;
    } else if (full_name.length < 3) {
        setError("full_name", "El nombre completo debe tener al menos 3 caracteres.");
        isValid = false;
    }

    if (!email) {
        setError("email", "El correo es obligatorio.");
        isValid = false;
    } else if (!isValidEmail(email)) {
        setError("email", "El correo no tiene un formato válido.");
        isValid = false;
    }

    if (!password) {
        setError("password", "La contraseña es obligatoria.");
        isValid = false;
    } else if (password.length < 8) {
        setError("password", "La contraseña debe tener mínimo 8 caracteres.");
        isValid = false;
    }

    if (birth_date && !isValidDateOnly(birth_date)) {
        setError("birth_date", "La fecha debe tener formato válido.");
        isValid = false;
    }

    if (playsSport) {
        if (!sportName) {
            setError("sport_name", "Debes indicar el deporte que practicas.");
            isValid = false;
        }

        if (frequencyPerWeek !== "") {
            const frequencyValue = Number(frequencyPerWeek);
            if (!Number.isInteger(frequencyValue) || frequencyValue < 0) {
                setError("frequency_per_week", "La frecuencia debe ser un número entero mayor o igual a 0.");
                isValid = false;
            }
        }
    }

    if (!isValid) {
        showMessage("Por favor corrige los campos con error.", "danger");
        return;
    }

    const metadata = {
        sports: []
    };

    if (playsSport) {
        metadata.sports.push({
            name: sportName,
            frequency_per_week: frequencyPerWeek === "" ? 0 : Number(frequencyPerWeek)
        });
    }

    const payload = {
        full_name,
        email,
        password,
        role: "user",
        must_change_password: true,
        birth_date: birth_date || null,
        metadata
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            if (data.errors && typeof data.errors === "object") {
                mapBackendErrors(data.errors);
            }

            showMessage(data.message || "No fue posible registrar el usuario.", "danger");
            return;
        }

        showMessage("Usuario registrado correctamente. Ahora puedes iniciar sesión.", "success");
        registerForm.reset();

    } catch (error) {
        console.error("Error al registrar:", error);
        showMessage("No fue posible conectar con el servidor.", "danger");
    }
});

function setError(field, message) {
    if (errorFields[field]) {
        errorFields[field].textContent = message;
    }
}

function clearMessages() {
    Object.values(errorFields).forEach((element) => {
        element.textContent = "";
    });
    formMessage.textContent = "";
    formMessage.className = "mb-3";
}

function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `mb-3 text-${type} small`;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidDateOnly(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function mapBackendErrors(errors) {
    for (const key in errors) {
        if (key === "metadata" && Array.isArray(errors[key])) {
            showMessage(errors[key].join(" "), "danger");
            continue;
        }

        if (errorFields[key]) {
            errorFields[key].textContent = errors[key];
        }
    }
}