// Selección del formulario y configuración del evento 'submit'
/*document.querySelector('.form-container form').addEventListener('submit', function (event) {
    event.preventDefault(); // Evita el comportamiento predeterminado del formulario

    const form = event.target;
    const formData = new FormData(form); // Captura datos del formulario, incluidos archivos

    // Validación de campos obligatorios
    if (!formData.get('Nombre') || !formData.get('Cédula') || !formData.get('Teléfono') ||
        !formData.get('Barrio') || !formData.get('Fecha de nacimiento')) {
        alert('Por favor, completa todos los campos requeridos.');
        return;
    }

    // Mostrar rueda de carga
    showLoadingSpinner();

    // Conversión de datos del formulario a un objeto
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    // Envío de datos al servidor
    sendDataToServer(data, form);
});*/
document.querySelector('.form-container form').addEventListener('submit', function (event) {
    event.preventDefault(); // Evita el comportamiento predeterminado del formulario

    const form = event.target;
    const formData = new FormData(form); // Captura datos del formulario, incluidos archivos
    const cedula = formData.get('Cédula').trim(); // Obtener la cédula ingresada

    // Validación de campos obligatorios
    if (!formData.get('Nombre') || !cedula || !formData.get('Teléfono') ||
        !formData.get('Barrio') || !formData.get('Fecha de nacimiento')) {
        alert('Por favor, completa todos los campos requeridos.');
        return;
    }
    showLoadingSpinner();
    // Verifica si la cédula ya existe
    checkCedulaInServer(cedula)
        .then(exists => {
            
            if (exists) {
                // Si la cédula ya está registrada, muestra el mensaje de error y no envíes el formulario
                
                showCustomAlert('formulario no enviado.\n Por favor, verifica los datos. \n Cédula.', 'error');
                hideLoadingSpinner()
            } else {
                // Si la cédula no existe, muestra la rueda de carga y envía el formulario
                showLoadingSpinner();

                // Conversión de datos del formulario a un objeto
                const data = {};
                formData.forEach((value, key) => {
                    data[key] = value;
                });

                // Envío de datos al servidor
                sendDataToServer(data, form);
                hideLoadingSpinner()
            }
        })
        .catch(() => {
            showCustomAlert('Error al verificar la cédula. Inténtalo de nuevo.', 'error');
        });
});

/**
 * Función para enviar datos al servidor.
 * @param {Object} data - Datos del formulario convertidos a un objeto.
 * @param {HTMLFormElement} form - El formulario enviado.
 */
function sendDataToServer(data, form) {
    const scriptURL = getScriptURL(data['Horario de Congregación']); // Determina la URL adecuada
    console.log('Datos a enviar:', data);

    fetch(scriptURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        mode: "no-cors",
        body: JSON.stringify(data) // Convierte los datos a formato JSON
    })
        .then(() => {
            hideLoadingSpinner(); // Ocultar la rueda ANTES de mostrar el alert
            showCustomAlert('Formulario enviado con éxito', 'success'); // Mostrar alert bonito
            form.reset(); // Limpia el formulario después de un envío exitoso
        })
        .catch(error => {
            hideLoadingSpinner(); // Ocultar la rueda ANTES de mostrar el alert
            showCustomAlert('Hubo un error al enviar el formulario. Inténtalo de nuevo más tarde.', 'error'); // Mostrar alert de error
        });
}

/**
 * Función para obtener la URL del script según el horario de congregación.
 * @param {string} horario - El horario de congregación.
 * @returns {string} - URL correspondiente al horario.
 */
function getScriptURL(horario) {
    const urlBase = 'https://script.google.com/macros/s/AKfycbwlGLGVcrrSlPtWDApcsHEnAhc1y1C4L_Ayp8opzUDI1CE6QgC6286hycbRY5A3_3T1/exec';//'https://script.google.com/macros/s/AKfycbx6Or4h4YF1EGGg09PXLOjX1LNCclHwK_XB8Z_JkFVV4Jl_C6fYSsz3pq9Szv3LXpo/exec';

    switch (horario) {
        case "7:00 am":
        case "5:00 pm":
        case "7:00 pm":
            return urlBase; // Reutiliza la misma URL para diferentes horarios
        default:
            return urlBase; // URL por defecto
    }
}

/**
 * Función para mostrar la rueda de carga (spinner).
 */
function showLoadingSpinner() {
    const spinner = document.createElement('div');
    spinner.id = 'loading-spinner';
    spinner.style.position = 'fixed';
    spinner.style.top = '0';
    spinner.style.left = '0';
    spinner.style.width = '100%';
    spinner.style.height = '100%';
    spinner.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    spinner.style.display = 'flex';
    spinner.style.justifyContent = 'center';
    spinner.style.alignItems = 'center';
    spinner.style.zIndex = '1000';
    spinner.innerHTML = `
        <div style="width: 50px; height: 50px; border: 5px solid rgba(255, 255, 255, 0.3); border-top: 5px solid white; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <style>
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        </style>
    `;
    document.body.appendChild(spinner);
}

/**
 * Función para ocultar la rueda de carga (spinner).
 */
function hideLoadingSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        document.body.removeChild(spinner);
    }
}

/**
 * Función para mostrar un mensaje de alerta personalizado (con icono de éxito o error).
 * @param {string} message - El mensaje a mostrar.
 * @param {string} type - El tipo de alerta ('success' o 'error').
 */
function showCustomAlert(message, type) {
    const alertBox = document.createElement('div');
    alertBox.className = `custom-alert ${type}`;
    alertBox.innerHTML = `
        <div style="display: flex; align-items: center; padding: 20px; justify-content: center;">
            <i class="${type === 'success' ? 'fas fa-check-circle' : 'fas fa-times-circle'}" 
               style="font-size: 40px; margin-right: 10px; color: ${type === 'success' ? '#4CAF50' : '#f44336'};"></i>
            <span style="font-size: 18px; font-weight: bold; font-style: italic;">${message}</span>
        </div>
    `;
    document.body.appendChild(alertBox);

    // Estilos CSS para el alert
    const styles = `
        .custom-alert {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #ffffff;
            color: #000000;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 1001;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 10px 20px;
            max-width: 100%;
            text-align: center;
            white-space: pre-line; /* Esto permite interpretar \n como un salto de línea */
        }
        .custom-alert.success {
            border: 2px solid #4CAF50;
            background-color: #e8f5e8;
            color: #4CAF50;
        }
        .custom-alert.error {
            border: 2px solid #f44336;
            background-color: #ffebee;
            color: #f44336;
        }
        .custom-alert i {
            flex-shrink: 0;
        }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    // Desaparecer el mensaje después de 3 segundos
    setTimeout(() => {
        alertBox.style.opacity = '0';
        setTimeout(() => document.body.removeChild(alertBox), 500);
    }, 3000); // El alert desaparece después de 3 segundos
}



//////////////////////////////////////////////////////////////////////////
document.querySelector('#cedula').addEventListener('blur', function () {
    const cedula = this.value.trim();

    if (!cedula) {
        //showCustomAlert('Por favor ingresa una cédula.', 'error');
        return;
    }

    // Llama al servidor para validar la cédula
    
    checkCedulaInServer(cedula)
        .then(exists => {
            if (exists) {
                showCustomAlert('La cédula del líder ya está registrado.\n Por favor, verifica tus datos.', 'error');
                this.classList.add('input-error');
            } else {
                this.classList.remove('input-error');
            }
        })
        .catch(() => {
            showCustomAlert('Error al verificar la cédula. Inténtalo de nuevo.', 'error');
        });
});

/**
 * Función para consultar al servidor si la cédula ya existe.
 * @param {string} cedula - Número de cédula a validar.
 * @returns {Promise<boolean>} - True si la cédula existe, false si no.
 */
function checkCedulaInServer(cedula) {
    const scriptURL = 'https://script.google.com/macros/s/AKfycbwlGLGVcrrSlPtWDApcsHEnAhc1y1C4L_Ayp8opzUDI1CE6QgC6286hycbRY5A3_3T1/exec'; // Reemplaza con tu URL de App Script
    
    return fetch(`${scriptURL}?cedula=${encodeURIComponent(cedula)}`)
        .then(response => response.json())
        .then(data => {
            if (data.result === 'success') {
                return data.exists;
            } else {
                throw new Error(data.message);
            }
        });
}
