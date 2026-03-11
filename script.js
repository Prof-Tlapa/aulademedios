// Variables globales
let isAdmin = false;
let currentDate = new Date();
let subjects = [];
let currentSlotInfo = null;

// Detectar en qué página estamos
const isGestionPage = window.location.pathname.includes('gestion.html');

// Constantes
const ADMIN_PASSWORD = "admin123"; // Cambiar por la contraseña deseada
const STORAGE_KEYS = {
    SUBJECTS: 'academic_subjects_with_teachers',
    RESERVATIONS: 'academic_reservations_',
    ADMIN_SESSION: 'admin_session'
};

// Horarios específicos (solo horas, sin nombres de bloque)
const TIME_SLOTS = [
    { start: '7:00', end: '7:45', isBreak: false },
    { start: '7:45', end: '8:30', isBreak: false },
    { start: '8:30', end: '9:15', isBreak: false },
    { start: '9:15', end: '10:00', isBreak: false },
    { start: '10:00', end: '10:30', isBreak: true },
    { start: '10:30', end: '11:15', isBreak: false },
    { start: '11:15', end: '12:00', isBreak: false },
    { start: '12:00', end: '12:45', isBreak: false }
];


// Profesores por materia (predefinidos)
const DEFAULT_SUBJECTS = [
    { name: 'Matemáticas 2', teacher: 'Profr. ARIZAGA BARRAGAN INOCENCIO' },
    { name: 'HISTORIA 1,', teacher: 'Profa. ARREDONDO ARIAS MELISSA ESPERANZA' },
    { name: 'FCE 3', teacher: 'Profa. ARREDONDO ARIAS MELISSA ESPERANZA' },
    { name: 'MATEMATICAS 1', teacher: 'Profa. BARRIOS GALLARDO JULIA ROSARIO' },
    { name: 'EDUCACION FISICA 1, 2 Y 3', teacher: 'Profa. CALDERON DE LA BARCA GUERRERO KAREN ' },
    { name: 'QUIMICA', teacher: 'Profa. CARMONA CLAVERAN MARIA MAGDALENA' },
    { name: 'ARTES 2 Y 3', teacher: 'Profa. CASTAÑEDA PANTOJA ALEJANDRO' },
    { name: 'INT CURRICULAR 2 Y 3, FCE 2', teacher: 'Profa. CAYETANO MEDINA ANA CLARISA' },
    { name: 'BIOLOGIA Y ARTES 1', teacher: 'Prof. CLARA JOACHIN RAFAEL' },
    { name: 'ESPAÑOL 2', teacher: 'Prof. COBO RAMIREZ LAURA DOLORES' },
    { name: 'INGLES 2 Y 3', teacher: 'Prof. CORTEZ ENCINAS JOSE LUIS' },
    { name: 'BIOLOGIA E INTEGRACION CURRICULAR', teacher: 'Prof. DE LEON CHAVIRA FRANCISCO' },
    { name: 'MATEMATICAS 1', teacher: 'Profa. ENRIQUEZ RAMIREZ ARELI GUADALUPE' },
    { name: 'TUTORIA 3, TECNOLOGIA 1 Y 2', teacher: 'Profa. FLORES MONTES CECILIA' },
    { name: 'TECNOLOGIA 3', teacher: 'Prof. GOMEZ GILBERT JESUS ERNESTO' },
    { name: 'INGLES 3', teacher: 'Prof. GUZMAN ORTEGA EMMANUEL JESUS' },
    { name: 'EDUCACION FISICA 3', teacher: 'Prof. HERNANDEZ MOJICA AMADO' },
    { name: 'ESPAÑOL 1', teacher: 'Profa. LEDUC HERNANDEZ ISELA' },
    { name: 'QUIMICA', teacher: 'Profa. LLAMAS COVARRUBIAS KARLA LIZETTE' },
     { name: 'INGLES 1', teacher: 'Prof. LOPEZ ACOSTA JOSE ROBERTO' },
    { name: 'MATEMATICAS 2', teacher: 'Profa. LOPEZ GUARDADO MOISES' },
     { name: 'HISTORIA 3', teacher: 'Profa. LOPEZ JAUREGUI MARTINELLA' },
    { name: 'EDUCACION FISICA 2', teacher: 'Prof. LOPEZ LUNA MARIO JEOVANE' },
     { name: 'HISTORIA 1, GEOGRAFIA', teacher: 'Prof. LOPEZ PANDURO RAMSES' },
    { name: 'FISICA', teacher: 'Prof. MADRIGAL BAEZ FERNANDO ALBERTO' },
     { name: 'FISICA', teacher: 'Prof. OCHOA GUERRERO CARLOS IVAN' },
    { name: 'ESPAÑOL 1 Y 3', teacher: 'Profa. OSUNA PEREZ MEIGHAN COLETTE' },
     { name: 'FCE 2, INT CURRICULAR 3', teacher: 'Profa. PEÑA PAZ JANETH MYCHEL ' },
    { name: 'MATEMATICAS 1', teacher: 'Profa. RANGEL ARCE DANIELA ALEJANDRA' },
    { name: 'TECNOLOGIA 1 Y 2', teacher: 'Prof. RAMIREZ SERNA LUIS MIGUEL' },
    { name: 'TECNOLOGIA 1 Y 2, TUTORIA 1 Y 2', teacher: 'Prof. RAZO QUEZADA RODOLFO' },
    { name: 'HISTORIA', teacher: 'Profa. RIZO TORRES JOCELYNE' },
    { name: 'HISTORIA 2 Y 3', teacher: 'Profa. ROA CAMPOS DIANA GUADALUPE' },
    { name: 'LABORATORIO', teacher: 'Profa. SAINZ ARELLANO BLANCA ELISA' },
    { name: 'MATEMATICAS 3', teacher: 'Profa. SANCHEZ ROSAS MARIA FERNANDA' },
    { name: 'AULA DE MEDIOS', teacher: 'Prof. TLAPA PEREZ JOSE FRANCISCO' },
    { name: 'TECNOLOGIA 1 Y 3, ARTES 1 Y 2, FCE 1 Y 2, INT. CURRICULAR 2', teacher: 'Profa. VALENZUELA CALDERON NADYA ALEJANDRA' },
    { name: 'FCE 3, TUTORIA 3, INT CURRICULAR 1, ARTES 1', teacher: 'Profa. VAZQUEZ MAZON MONICA' },
    { name: 'HISTORIA 2 Y 3', teacher: 'Profa. VELEZ ADAME MARICELA' },
];


// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Verificar sesión de administrador al cargar
    checkAdminSession();
    
    // Cargar materias guardadas
    loadSubjects();
    
    // Inicializar según la página
    if (isGestionPage) {
        initializeGestionPage();
    } else {
        initializeAgendaPage();
    }
    
    // Limpiar campo de contraseña al cargar la página
    clearPasswordField();
}

function checkAdminSession() {
    // Verificar si hay una sesión de administrador activa
    const session = sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
    if (session === 'true') {
        isAdmin = true;
        updateUIForAdmin();
    }
}

function clearPasswordField() {
    const passwordInput = document.getElementById('adminPassword');
    if (passwordInput) {
        passwordInput.value = '';
    }
}

function updateUIForAdmin() {
    const adminBtn = document.getElementById('adminBtn');
    const adminStatus = document.getElementById('adminStatus');
    
    if (adminBtn) {
        adminBtn.innerHTML = '<i class="fas fa-unlock"></i> Salir';
        adminBtn.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
    }
    
    if (adminStatus) {
        adminStatus.value = '✓ Modo administrador activado';
        adminStatus.className = 'admin-status';
    }
    
    // Actualizar UI según página
    if (isGestionPage) {
        updateGestionPageUI();
    } else {
        updateSlotButtons();
    }
}

function initializeAgendaPage() {
    console.log('Inicializando página de agenda');
    
    // Configurar date picker
    const datePicker = document.getElementById('datePicker');
    if (datePicker) {
        datePicker.valueAsDate = currentDate;
        
        // Event listeners
        datePicker.addEventListener('change', function() {
            currentDate = new Date(this.value);
            loadSchedule(formatDate(currentDate));
        });
    }
    
    // Cargar horario
    loadSchedule(formatDate(currentDate));
    
    // Cerrar modales con Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
            closeEditModal();
            closePasswordModal();
        }
    });
}

function initializeGestionPage() {
    console.log('Inicializando página de gestión');
    
    // Verificar si hay sesión de admin, si no, redirigir
    if (!isAdmin) {
        showNotification('Debe iniciar sesión como administrador para acceder a esta página', 'warning');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    // Cargar lista de profesores
    loadTeacherList();
    
    // Actualizar UI
    updateGestionPageUI();
}

// Función para verificar acceso a gestión
function checkAccessToGestion() {
    if (!isAdmin) {
        // Mostrar modal de contraseña
        const modal = document.getElementById('passwordModal');
        if (modal) {
            modal.showModal();
        }
        return false; // Prevenir navegación inmediata
    }
    return true; // Permitir navegación
}

function verifyPasswordAndRedirect() {
    const passwordInput = document.getElementById('gestionPassword');
    const password = passwordInput.value;
    
    if (password === ADMIN_PASSWORD) {
        // Establecer sesión de administrador
        sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
        isAdmin = true;
        
        // Cerrar modal
        closePasswordModal();
        
        // Redirigir a gestión
        window.location.href = 'gestion.html';
    } else {
        showNotification('Contraseña incorrecta', 'error');
        passwordInput.value = '';
    }
}

function closePasswordModal() {
    const modal = document.getElementById('passwordModal');
    if (modal) {
        modal.close();
        const passwordInput = document.getElementById('gestionPassword');
        if (passwordInput) {
            passwordInput.value = '';
        }
    }
}

// Funciones de utilidad
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('output');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 
                              type === 'error' ? 'exclamation-circle' : 
                              type === 'warning' ? 'exclamation-triangle' : 
                              'info-circle'}"></i>
        ${message}
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Funciones de administración
function toggleAdmin() {
    const passwordInput = document.getElementById('adminPassword');
    const password = passwordInput.value;
    
    if (!isAdmin && password === ADMIN_PASSWORD) {
        // Activar modo administrador
        isAdmin = true;
        sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
        
        // Actualizar UI
        updateUIForAdmin();
        
        showNotification('Modo administrador activado', 'success');
    } else if (isAdmin) {
        // Desactivar modo administrador
        isAdmin = false;
        sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
        
        const adminBtn = document.getElementById('adminBtn');
        const adminStatus = document.getElementById('adminStatus');
        
        if (adminBtn) {
            adminBtn.innerHTML = '<i class="fas fa-lock"></i> Acceder';
            adminBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }
        
        if (adminStatus) {
            adminStatus.value = '';
            adminStatus.className = 'admin-status';
        }
        
        showNotification('Modo administrador desactivado', 'info');
        
        // Si estamos en gestión, redirigir a agenda
        if (isGestionPage) {
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    } else {
        showNotification('Contraseña incorrecta', 'error');
    }
    
    // Limpiar campo de contraseña
    passwordInput.value = '';
    
    // Actualizar UI según página
    if (!isGestionPage) {
        updateSlotButtons();
    } else {
        updateGestionPageUI();
    }
}

function updateGestionPageUI() {
    const adminBadge = document.getElementById('adminBadge');
    const addTeacherForm = document.getElementById('addTeacherForm');
    const editButtons = document.querySelectorAll('.edit-teacher-btn');
    const deleteButtons = document.querySelectorAll('.delete-teacher-btn');
    
    if (adminBadge) {
        adminBadge.style.display = isAdmin ? 'flex' : 'none';
    }
    
    if (addTeacherForm) {
        addTeacherForm.style.display = isAdmin ? 'block' : 'none';
    }
    
    editButtons.forEach(btn => {
        btn.disabled = !isAdmin;
    });
    
    deleteButtons.forEach(btn => {
        btn.disabled = !isAdmin;
    });
}

// Funciones de navegación de fechas (solo en agenda)
function changeDate(days) {
    if (isGestionPage) return;
    
    currentDate.setDate(currentDate.getDate() + days);
    const datePicker = document.getElementById('datePicker');
    datePicker.value = formatDate(currentDate);
    loadSchedule(formatDate(currentDate));
}

function goToToday() {
    if (isGestionPage) return;
    
    currentDate = new Date();
    const datePicker = document.getElementById('datePicker');
    datePicker.valueAsDate = currentDate;
    loadSchedule(formatDate(currentDate));
}

// Funciones de gestión de materias y profesores
function loadSubjects() {
    const savedSubjects = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (savedSubjects) {
        subjects = JSON.parse(savedSubjects);
    } else {
        // Usar materias por defecto con profesores
        subjects = [...DEFAULT_SUBJECTS];
        saveSubjects();
    }
}

function saveSubjects() {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
    if (isGestionPage) {
        loadTeacherList(); // Actualizar la lista visual
    }
}

function loadTeacherList() {
    const teacherList = document.getElementById('teacherList');
    if (!teacherList) return;
    
    teacherList.innerHTML = '';
    
    if (subjects.length === 0) {
        teacherList.innerHTML = '<p class="empty-message">No hay materias registradas</p>';
        return;
    }
    
    subjects.forEach((subject, index) => {
        const item = document.createElement('article');
        item.className = 'teacher-item';
        item.innerHTML = `
            <span><i class="fas fa-book"></i> ${subject.name}</span>
            <span><i class="fas fa-chalkboard-teacher"></i> ${subject.teacher}</span>
            <span class="teacher-actions">
                <button onclick="editTeacher(${index})" class="edit-teacher-btn" ${!isAdmin ? 'disabled' : ''}>
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteTeacher(${index})" class="delete-teacher-btn" ${!isAdmin ? 'disabled' : ''}>
                    <i class="fas fa-trash"></i>
                </button>
            </span>
        `;
        teacherList.appendChild(item);
    });
}

function addNewSubject() {
    if (!isAdmin) {
        showNotification('Solo el administrador puede agregar materias', 'warning');
        return;
    }
    
    const subjectInput = document.getElementById('newSubjectName');
    const teacherInput = document.getElementById('newTeacherName');
    
    if (!subjectInput || !teacherInput) return;
    
    const newSubject = subjectInput.value.trim();
    const newTeacher = teacherInput.value.trim();
    
    if (newSubject && newTeacher) {
        // Verificar si ya existe
        const exists = subjects.some(s => s.name.toLowerCase() === newSubject.toLowerCase());
        
        if (!exists) {
            subjects.push({
                name: newSubject,
                teacher: newTeacher
            });
            saveSubjects();
            subjectInput.value = '';
            teacherInput.value = '';
            showNotification('Materia y profesor agregados correctamente', 'success');
        } else {
            showNotification('Esta materia ya existe', 'warning');
        }
    } else {
        showNotification('Complete ambos campos', 'warning');
    }
}

function editTeacher(index) {
    if (!isAdmin) {
        showNotification('Solo el administrador puede editar', 'warning');
        return;
    }
    
    const subject = subjects[index];
    document.getElementById('editTeacherIndex').value = index;
    document.getElementById('editSubjectName').value = subject.name;
    document.getElementById('editTeacherName').value = subject.teacher;
    
    const modal = document.getElementById('editTeacherModal');
    if (modal) {
        modal.showModal();
    }
}

function updateTeacher() {
    const index = parseInt(document.getElementById('editTeacherIndex').value);
    const newSubject = document.getElementById('editSubjectName').value.trim();
    const newTeacher = document.getElementById('editTeacherName').value.trim();
    
    if (newSubject && newTeacher) {
        // Verificar si ya existe otra materia con el mismo nombre
        const exists = subjects.some((s, i) => 
            i !== index && s.name.toLowerCase() === newSubject.toLowerCase()
        );
        
        if (!exists) {
            subjects[index].name = newSubject;
            subjects[index].teacher = newTeacher;
            saveSubjects();
            closeEditTeacherModal();
            showNotification('Materia y profesor actualizados correctamente', 'success');
        } else {
            showNotification('Ya existe otra materia con ese nombre', 'warning');
        }
    } else {
        showNotification('Complete ambos campos', 'warning');
    }
}

function deleteTeacher(index) {
    if (!isAdmin) {
        showNotification('Solo el administrador puede eliminar', 'warning');
        return;
    }
    
    if (confirm('¿Está seguro de eliminar esta materia y profesor? Las reservas existentes no se verán afectadas.')) {
        subjects.splice(index, 1);
        saveSubjects();
        showNotification('Materia y profesor eliminados correctamente', 'success');
    }
}

function closeEditTeacherModal() {
    const modal = document.getElementById('editTeacherModal');
    if (modal) {
        modal.close();
    }
}

// Funciones de reserva (solo en agenda)
function showSubjectModal(blockIndex) {
    if (isGestionPage) return;
    
    if (!isAdmin) {
        showNotification('Solo el administrador puede reservar materias', 'warning');
        return;
    }
    
    currentSlotInfo = { blockIndex };
    const modal = document.getElementById('subjectModal');
    const subjectList = document.getElementById('subjectList');
    
    if (!modal || !subjectList) return;
    
    subjectList.innerHTML = '';
    
    if (subjects.length === 0) {
        subjectList.innerHTML = '<p class="empty-message">No hay materias disponibles. Ve a Gestión para agregar materias.</p>';
        modal.showModal();
        return;
    }
    
    subjects.forEach((subject, index) => {
        const item = document.createElement('article');
        item.className = 'subject-item';
        item.onclick = () => selectSubject(index);
        item.innerHTML = `
            <span class="subject-info">
                <span class="subject-name"><i class="fas fa-book"></i> ${subject.name}</span>
                <span class="teacher-name"><i class="fas fa-chalkboard-teacher"></i> ${subject.teacher}</span>
            </span>
            <i class="fas fa-chevron-right"></i>
        `;
        subjectList.appendChild(item);
    });
    
    modal.showModal();
}

function closeModal() {
    const modal = document.getElementById('subjectModal');
    if (modal) {
        modal.close();
    }
    currentSlotInfo = null;
}

function selectSubject(subjectIndex) {
    if (currentSlotInfo) {
        reserveSlot(currentSlotInfo.blockIndex, subjectIndex);
        closeModal();
    }
}

function reserveSlot(blockIndex, subjectIndex) {
    if (isGestionPage) return;
    
    const date = formatDate(currentDate);
    const reservations = getReservations(date);
    const timeSlot = TIME_SLOTS[blockIndex];
    const subject = subjects[subjectIndex];
    
    // No permitir reservar en receso
    if (timeSlot.isBreak) {
        showNotification('No se puede reservar en horario de receso', 'warning');
        return;
    }
    
    // Verificar si ya existe una reserva en este bloque
    const existingReservation = reservations.find(r => r.blockIndex === blockIndex);
    if (existingReservation) {
        if (confirm('Ya hay una reserva en este horario. ¿Desea reemplazarla?')) {
            // Eliminar la reserva existente
            const index = reservations.findIndex(r => r.blockIndex === blockIndex);
            reservations.splice(index, 1);
        } else {
            return;
        }
    }
    
    reservations.push({
        blockIndex: blockIndex,
        subject: subject.name,
        teacher: subject.teacher,
        timeSlot: timeSlot,
        date: date,
        reservedAt: new Date().toISOString()
    });
    
    saveReservations(date, reservations);
    loadSchedule(date);
    showNotification(`Materia "${subject.name}" con ${subject.teacher} reservada`, 'success');
}

function editReservation(blockIndex, currentSubject, currentTeacher) {
    if (isGestionPage) return;
    
    if (!isAdmin) {
        showNotification('Solo el administrador puede modificar reservas', 'warning');
        return;
    }
    
    const modal = document.getElementById('editModal');
    const editContent = document.getElementById('editContent');
    const timeSlot = TIME_SLOTS[blockIndex];
    
    if (!modal || !editContent) return;
    
    editContent.innerHTML = `
        <p><strong>Horario:</strong> ${timeSlot.start} - ${timeSlot.end}</p>
        <p><strong>Materia actual:</strong> ${currentSubject}</p>
        <p><strong>Profesor actual:</strong> ${currentTeacher}</p>
        <section class="subject-list" id="editSubjectList">
            ${subjects.map((subject, index) => `
                <article class="subject-item" onclick="updateReservation(${blockIndex}, ${index})">
                    <span class="subject-info">
                        <span class="subject-name"><i class="fas fa-book"></i> ${subject.name}</span>
                        <span class="teacher-name"><i class="fas fa-chalkboard-teacher"></i> ${subject.teacher}</span>
                    </span>
                    <i class="fas fa-chevron-right"></i>
                </article>
            `).join('')}
        </section>
        <footer style="margin-top: 20px;">
            <button onclick="deleteReservation(${blockIndex})" class="delete-btn" style="width: 100%;">
                <i class="fas fa-trash"></i> Eliminar reserva
            </button>
        </footer>
    `;
    
    modal.showModal();
}

function updateReservation(blockIndex, subjectIndex) {
    if (isGestionPage) return;
    
    const date = formatDate(currentDate);
    const reservations = getReservations(date);
    const subject = subjects[subjectIndex];
    
    const index = reservations.findIndex(r => r.blockIndex === blockIndex);
    if (index !== -1) {
        reservations[index].subject = subject.name;
        reservations[index].teacher = subject.teacher;
        reservations[index].modifiedAt = new Date().toISOString();
        saveReservations(date, reservations);
        loadSchedule(date);
        closeEditModal();
        showNotification('Reserva actualizada correctamente', 'success');
    }
}

function deleteReservation(blockIndex) {
    if (isGestionPage) return;
    
    if (confirm('¿Está seguro de eliminar esta reserva?')) {
        const date = formatDate(currentDate);
        const reservations = getReservations(date);
        
        const index = reservations.findIndex(r => r.blockIndex === blockIndex);
        if (index !== -1) {
            reservations.splice(index, 1);
            saveReservations(date, reservations);
            loadSchedule(date);
            closeEditModal();
            showNotification('Reserva eliminada correctamente', 'success');
        }
    }
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.close();
    }
}

// Funciones de almacenamiento
function getReservations(date) {
    const key = STORAGE_KEYS.RESERVATIONS + date;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
}

function saveReservations(date, reservations) {
    const key = STORAGE_KEYS.RESERVATIONS + date;
    localStorage.setItem(key, JSON.stringify(reservations));
}

// Función principal para cargar el horario (solo en agenda)
function loadSchedule(date) {
    if (isGestionPage) return;
    
    const scheduleSection = document.getElementById('schedule');
    if (!scheduleSection) return;
    
    scheduleSection.innerHTML = '<div class="spinner" role="status" aria-label="Cargando horario"></div>';
    
    // Simular carga asíncrona
    setTimeout(() => {
        scheduleSection.innerHTML = '';
        const reservations = getReservations(date);
        
        TIME_SLOTS.forEach((slot, index) => {
            const reservation = reservations.find(r => r.blockIndex === index);
            const slotElement = createTimeSlot(index, slot, reservation);
            scheduleSection.appendChild(slotElement);
        });
        
        updateSummary(reservations);
    }, 300);
}

function createTimeSlot(blockIndex, slot, reservation) {
    const slotElement = document.createElement('article');
    
    if (slot.isBreak) {
        slotElement.className = 'time-slot receso-slot';
    } else {
        slotElement.className = `time-slot ${reservation ? 'reserved-slot' : ''}`;
    }
    
    // Columna de hora
    const timeSpan = document.createElement('span');
    timeSpan.className = 'slot-time';
    timeSpan.innerHTML = `<span class="slot-time-range">${slot.start} - ${slot.end}</span>`;
    
    // Columna de materia y profesor
    const subjectSpan = document.createElement('span');
    subjectSpan.className = 'slot-subject';
    
    if (slot.isBreak) {
        subjectSpan.innerHTML = `
            <i class="fas fa-coffee"></i> RECESO
            <span class="slot-teacher"><i class="fas fa-clock"></i> 20 minutos</span>
        `;
    } else if (reservation) {
        subjectSpan.innerHTML = `
            <strong>${reservation.subject}</strong>
            <span class="slot-teacher"><i class="fas fa-chalkboard-teacher"></i> ${reservation.teacher}</span>
        `;
    } else {
        subjectSpan.innerHTML = `
            <em>Disponible</em>
        `;
    }
    
    // Columna de acciones
    const actionsSpan = document.createElement('span');
    actionsSpan.className = 'slot-actions';
    
    if (!slot.isBreak) {
        if (reservation) {
            // Slot reservado
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.onclick = () => editReservation(blockIndex, reservation.subject, reservation.teacher);
            editBtn.disabled = !isAdmin;
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.setAttribute('aria-label', 'Editar reserva');
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.onclick = () => deleteReservation(blockIndex);
            deleteBtn.disabled = !isAdmin;
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.setAttribute('aria-label', 'Eliminar reserva');
            
            actionsSpan.appendChild(editBtn);
            actionsSpan.appendChild(deleteBtn);
        } else {
            // Slot disponible
            const reserveBtn = document.createElement('button');
            reserveBtn.className = 'reserve-btn';
            reserveBtn.onclick = () => showSubjectModal(blockIndex);
            reserveBtn.disabled = !isAdmin;
            reserveBtn.innerHTML = '<i class="fas fa-plus"></i> Reservar';
            reserveBtn.setAttribute('aria-label', 'Reservar horario');
            
            actionsSpan.appendChild(reserveBtn);
        }
    }
    
    slotElement.appendChild(timeSpan);
    slotElement.appendChild(subjectSpan);
    slotElement.appendChild(actionsSpan);
    
    return slotElement;
}

function updateSlotButtons() {
    if (isGestionPage) return;
    
    const reserveButtons = document.querySelectorAll('.reserve-btn');
    const editButtons = document.querySelectorAll('.edit-btn');
    const deleteButtons = document.querySelectorAll('.delete-btn');
    
    reserveButtons.forEach(btn => {
        btn.disabled = !isAdmin;
    });
    
    editButtons.forEach(btn => {
        btn.disabled = !isAdmin;
    });
    
    deleteButtons.forEach(btn => {
        btn.disabled = !isAdmin;
    });
}

function updateSummary(reservations) {
    if (isGestionPage) return;
    
    const summarySection = document.getElementById('summary');
    if (!summarySection) return;
    
    if (reservations.length === 0) {
        summarySection.innerHTML = '<p class="summary-item">No hay reservas para hoy</p>';
        return;
    }
    
    // Agrupar por materia y profesor
    const subjectStats = {};
    reservations.forEach(r => {
        const key = `${r.subject}|${r.teacher}`;
        if (!subjectStats[key]) {
            subjectStats[key] = {
                subject: r.subject,
                teacher: r.teacher,
                count: 0,
                blocks: []
            };
        }
        subjectStats[key].count++;
        subjectStats[key].blocks.push(`${r.timeSlot.start} - ${r.timeSlot.end}`);
    });
    
    summarySection.innerHTML = Object.values(subjectStats)
        .map(stat => `
            <article class="summary-item">
                <h4><i class="fas fa-book"></i> ${stat.subject}</h4>
                <p class="teacher-name"><i class="fas fa-chalkboard-teacher"></i> ${stat.teacher}</p>
                <p><i class="fas fa-clock"></i> ${stat.count} bloque(s) reservado(s)</p>
                <small>${stat.blocks.join(' • ')}</small>
            </article>
        `).join('');

}
