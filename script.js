// Variables globales
let isAdmin = false;
let currentDate = new Date();
let subjects = [];

// Detectar en qué página estamos
const isGestionPage = window.location.pathname.includes('gestion.html');

// Constantes
const ADMIN_PASSWORD = "admin123"; // Cambiar por la contraseña deseada

// Horarios específicos
const TIME_SLOTS = [
    { id: 1, start: '7:00', end: '7:50', isBreak: false },
    { id: 2, start: '7:50', end: '8:40', isBreak: false },
    { id: 3, start: '8:40', end: '9:30', isBreak: false },
    { id: 4, start: '9:30', end: '10:20', isBreak: false },
    { id: 5, start: '10:20', end: '10:40', isBreak: true },
    { id: 6, start: '10:40', end: '11:30', isBreak: false },
    { id: 7, start: '11:30', end: '12:20', isBreak: false },
    { id: 8, start: '12:20', end: '13:00', isBreak: false }
];

// Grupos disponibles
const GRUPOS = [
    '1A', '1B', '1C', '1D', '1E', '1F',
    '2A', '2B', '2C', '2D', '2E', '2F',
    '3A', '3B', '3C', '3D', '3E', '3F'
];

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    // Verificar sesión de administrador
    checkAdminSession();
    
    // Cargar materias desde Firebase
    await loadSubjectsFromFirebase();
    
    // Inicializar según la página
    if (isGestionPage) {
        initializeGestionPage();
    } else {
        initializeAgendaPage();
    }
    
    clearPasswordField();
}

// ============================================
// FUNCIONES DE FIREBASE (DATOS PERSISTENTES)
// ============================================

// Guardar materias en Firebase
async function saveSubjectsToFirebase() {
    try {
        // Limpiar colección existente
        const snapshot = await db.collection('materias').get();
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        
        // Guardar nuevas materias
        for (const subject of subjects) {
            await db.collection('materias').add({
                name: subject.name,
                teacher: subject.teacher,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        console.log('Materias guardadas en Firebase');
    } catch (error) {
        console.error('Error guardando en Firebase:', error);
        showNotification('Error al guardar en la nube', 'error');
    }
}

// Cargar materias desde Firebase
async function loadSubjectsFromFirebase() {
    try {
        const snapshot = await db.collection('materias').get();
        
        if (snapshot.empty) {
            // No hay datos, usar predeterminados
            subjects = getDefaultSubjects();
            await saveSubjectsToFirebase(); // Guardar en Firebase
        } else {
            // Cargar desde Firebase
            subjects = [];
            snapshot.forEach(doc => {
                subjects.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
        }
        console.log('Materias cargadas desde Firebase:', subjects);
    } catch (error) {
        console.error('Error cargando desde Firebase:', error);
        // Fallback a datos locales si hay error
        subjects = getDefaultSubjects();
        showNotification('Usando datos locales - sin conexión', 'warning');
    }
}

// Guardar reservas en Firebase
async function saveReservationToFirebase(reservation) {
    try {
        await db.collection('reservas').add({
            ...reservation,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Reserva guardada en Firebase');
    } catch (error) {
        console.error('Error guardando reserva:', error);
        showNotification('Error al guardar la reserva', 'error');
    }
}

// Obtener reservas de una fecha específica desde Firebase
async function getReservationsFromFirebase(date) {
    try {
        const snapshot = await db.collection('reservas')
            .where('date', '==', date)
            .get();
        
        const reservations = [];
        snapshot.forEach(doc => {
            reservations.push({
                id: doc.id,
                ...doc.data()
            });
        });
        return reservations;
    } catch (error) {
        console.error('Error cargando reservas:', error);
        return [];
    }
}

// Actualizar reserva en Firebase
async function updateReservationInFirebase(reservationId, newData) {
    try {
        await db.collection('reservas').doc(reservationId).update({
            ...newData,
            modifiedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Reserva actualizada en Firebase');
    } catch (error) {
        console.error('Error actualizando reserva:', error);
        showNotification('Error al actualizar', 'error');
    }
}

// Eliminar reserva de Firebase
async function deleteReservationFromFirebase(reservationId) {
    try {
        await db.collection('reservas').doc(reservationId).delete();
        console.log('Reserva eliminada de Firebase');
    } catch (error) {
        console.error('Error eliminando reserva:', error);
        showNotification('Error al eliminar', 'error');
    }
}

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

function getDefaultSubjects() {
    return [
        { name: 'Matemáticas', teacher: 'Profr. Inocencio Arizaga' },
        { name: 'Física', teacher: 'Profa. María González' },
        { name: 'Química', teacher: 'Prof. Juan Pérez' },
        { name: 'Historia', teacher: 'Profa. Laura Martínez' },
        { name: 'Lenguaje', teacher: 'Prof. Carlos Rodríguez' },
        { name: 'Inglés', teacher: 'Profa. Ana García' },
        { name: 'Programación', teacher: 'Prof. Roberto Sánchez' },
        { name: 'Bases de Datos', teacher: 'Profa. Patricia López' }
    ];
}

function checkAdminSession() {
    const session = sessionStorage.getItem('admin_session');
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
    
    if (!isGestionPage) {
        loadSchedule(formatDate(currentDate));
    } else {
        loadTeacherList();
    }
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

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// ============================================
// FUNCIONES DE ADMINISTRACIÓN
// ============================================

function toggleAdmin() {
    const passwordInput = document.getElementById('adminPassword');
    const password = passwordInput.value;
    
    if (!isAdmin && password === ADMIN_PASSWORD) {
        isAdmin = true;
        sessionStorage.setItem('admin_session', 'true');
        updateUIForAdmin();
        showNotification('Modo administrador activado', 'success');
    } else if (isAdmin) {
        isAdmin = false;
        sessionStorage.removeItem('admin_session');
        
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
        
        if (isGestionPage) {
            setTimeout(() => window.location.href = 'index.html', 1500);
        } else {
            loadSchedule(formatDate(currentDate));
        }
    } else {
        showNotification('Contraseña incorrecta', 'error');
    }
    
    passwordInput.value = '';
}

// ============================================
// FUNCIONES DE GESTIÓN DE MATERIAS (Página gestión.html)
// ============================================

function initializeGestionPage() {
    if (!isAdmin) {
        showNotification('Debe iniciar sesión como administrador', 'warning');
        setTimeout(() => window.location.href = 'index.html', 2000);
        return;
    }
    
    loadTeacherList();
    updateGestionPageUI();
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
                <button onclick="editTeacher(${index})" class="edit-teacher-btn">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteTeacher(${index})" class="delete-teacher-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </span>
        `;
        teacherList.appendChild(item);
    });
}

function updateGestionPageUI() {
    const adminBadge = document.getElementById('adminBadge');
    const addTeacherForm = document.getElementById('addTeacherForm');
    
    if (adminBadge) adminBadge.style.display = 'flex';
    if (addTeacherForm) addTeacherForm.style.display = 'block';
}

async function addNewSubject() {
    if (!isAdmin) return;
    
    const subjectInput = document.getElementById('newSubjectName');
    const teacherInput = document.getElementById('newTeacherName');
    
    const newSubject = subjectInput.value.trim();
    const newTeacher = teacherInput.value.trim();
    
    if (newSubject && newTeacher) {
        const exists = subjects.some(s => s.name.toLowerCase() === newSubject.toLowerCase());
        
        if (!exists) {
            // Agregar localmente
            subjects.push({ name: newSubject, teacher: newTeacher });
            
            // Guardar en Firebase
            await saveSubjectsToFirebase();
            
            subjectInput.value = '';
            teacherInput.value = '';
            loadTeacherList();
            showNotification('Materia agregada correctamente', 'success');
        } else {
            showNotification('Esta materia ya existe', 'warning');
        }
    } else {
        showNotification('Complete ambos campos', 'warning');
    }
}

function editTeacher(index) {
    const subject = subjects[index];
    document.getElementById('editTeacherIndex').value = index;
    document.getElementById('editSubjectName').value = subject.name;
    document.getElementById('editTeacherName').value = subject.teacher;
    
    const modal = document.getElementById('editTeacherModal');
    if (modal) modal.showModal();
}

async function updateTeacher() {
    const index = parseInt(document.getElementById('editTeacherIndex').value);
    const newSubject = document.getElementById('editSubjectName').value.trim();
    const newTeacher = document.getElementById('editTeacherName').value.trim();
    
    if (newSubject && newTeacher) {
        const exists = subjects.some((s, i) => 
            i !== index && s.name.toLowerCase() === newSubject.toLowerCase()
        );
        
        if (!exists) {
            subjects[index] = { name: newSubject, teacher: newTeacher };
            await saveSubjectsToFirebase();
            closeEditTeacherModal();
            loadTeacherList();
            showNotification('Actualizado correctamente', 'success');
        } else {
            showNotification('Ya existe otra materia con ese nombre', 'warning');
        }
    }
}

async function deleteTeacher(index) {
    if (confirm('¿Eliminar esta materia? Las reservas no se afectarán.')) {
        subjects.splice(index, 1);
        await saveSubjectsToFirebase();
        loadTeacherList();
        showNotification('Eliminado correctamente', 'success');
    }
}

function closeEditTeacherModal() {
    const modal = document.getElementById('editTeacherModal');
    if (modal) modal.close();
}

// ============================================
// FUNCIONES DE AGENDA (Página index.html)
// ============================================

function initializeAgendaPage() {
    const datePicker = document.getElementById('datePicker');
    if (datePicker) {
        datePicker.valueAsDate = currentDate;
        datePicker.addEventListener('change', function() {
            currentDate = new Date(this.value);
            loadSchedule(formatDate(currentDate));
        });
    }
    
    loadSchedule(formatDate(currentDate));
    
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
            closeEditModal();
            closeGrupoModal();
        }
    });
}

function changeDate(days) {
    if (isGestionPage) return;
    currentDate.setDate(currentDate.getDate() + days);
    document.getElementById('datePicker').value = formatDate(currentDate);
    loadSchedule(formatDate(currentDate));
}

function goToToday() {
    if (isGestionPage) return;
    currentDate = new Date();
    document.getElementById('datePicker').valueAsDate = currentDate;
    loadSchedule(formatDate(currentDate));
}

async function loadSchedule(date) {
    if (isGestionPage) return;
    
    const scheduleSection = document.getElementById('schedule');
    if (!scheduleSection) return;
    
    scheduleSection.innerHTML = '<div class="spinner" role="status"></div>';
    
    // Cargar reservas desde Firebase
    const reservations = await getReservationsFromFirebase(date);
    
    setTimeout(() => {
        scheduleSection.innerHTML = '';
        
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
    
    // Hora
    const timeSpan = document.createElement('span');
    timeSpan.className = 'slot-time';
    timeSpan.innerHTML = `<span class="slot-time-range">${slot.start} - ${slot.end}</span>`;
    
    // Materia y profesor
    const subjectSpan = document.createElement('span');
    subjectSpan.className = 'slot-subject';
    
    if (slot.isBreak) {
        subjectSpan.innerHTML = `<i class="fas fa-coffee"></i> RECESO <span class="slot-teacher">20 min</span>`;
    } else if (reservation) {
        subjectSpan.innerHTML = `
            <strong>${reservation.subject}</strong>
            <span class="slot-teacher"><i class="fas fa-chalkboard-teacher"></i> ${reservation.teacher}</span>
            <span class="slot-grupo"><i class="fas fa-users"></i> Grupo ${reservation.grupo}</span>
        `;
    } else {
        subjectSpan.innerHTML = `<em>Disponible</em>`;
    }
    
    // Acciones
    const actionsSpan = document.createElement('span');
    actionsSpan.className = 'slot-actions';
    
    if (!slot.isBreak) {
        if (reservation) {
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.onclick = () => editReservation(reservation);
            editBtn.disabled = !isAdmin;
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.onclick = () => deleteReservation(reservation.id, blockIndex);
            deleteBtn.disabled = !isAdmin;
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            
            actionsSpan.appendChild(editBtn);
            actionsSpan.appendChild(deleteBtn);
        } else {
            const reserveBtn = document.createElement('button');
            reserveBtn.className = 'reserve-btn';
            reserveBtn.onclick = () => showSubjectModal(blockIndex);
            reserveBtn.disabled = !isAdmin;
            reserveBtn.innerHTML = '<i class="fas fa-plus"></i> Reservar';
            
            actionsSpan.appendChild(reserveBtn);
        }
    }
    
    slotElement.appendChild(timeSpan);
    slotElement.appendChild(subjectSpan);
    slotElement.appendChild(actionsSpan);
    
    return slotElement;
}

function showSubjectModal(blockIndex) {
    if (!isAdmin) {
        showNotification('Solo administrador', 'warning');
        return;
    }
    
    currentSlotInfo = { blockIndex };
    const modal = document.getElementById('subjectModal');
    const subjectList = document.getElementById('subjectList');
    
    subjectList.innerHTML = '';
    
    if (subjects.length === 0) {
        subjectList.innerHTML = '<p>No hay materias. Ve a Gestión para agregar.</p>';
        modal.showModal();
        return;
    }
    
    subjects.forEach((subject, index) => {
        const item = document.createElement('article');
        item.className = 'subject-item';
        item.onclick = () => selectSubject(index);
        item.innerHTML = `
            <span class="subject-info">
                <span class="subject-name">${subject.name}</span>
                <span class="teacher-name">${subject.teacher}</span>
            </span>
            <i class="fas fa-chevron-right"></i>
        `;
        subjectList.appendChild(item);
    });
    
    modal.showModal();
}

function selectSubject(subjectIndex) {
    if (currentSlotInfo) {
        showGrupoModal(currentSlotInfo.blockIndex, subjectIndex);
        closeModal();
    }
}

function showGrupoModal(blockIndex, subjectIndex) {
    const modal = document.getElementById('grupoModal');
    const grupoList = document.getElementById('grupoList');
    
    grupoList.innerHTML = '';
    
    GRUPOS.forEach(grupo => {
        const item = document.createElement('article');
        item.className = 'subject-item';
        item.onclick = () => reserveSlot(blockIndex, subjectIndex, grupo);
        item.innerHTML = `
            <span class="subject-info">
                <span class="subject-name">Grupo ${grupo}</span>
            </span>
            <i class="fas fa-chevron-right"></i>
        `;
        grupoList.appendChild(item);
    });
    
    modal.showModal();
}

async function reserveSlot(blockIndex, subjectIndex, grupo) {
    const date = formatDate(currentDate);
    const timeSlot = TIME_SLOTS[blockIndex];
    const subject = subjects[subjectIndex];
    
    if (timeSlot.isBreak) {
        showNotification('No se puede reservar en receso', 'warning');
        closeGrupoModal();
        return;
    }
    
    // Verificar si ya hay reserva
    const existing = await getReservationsFromFirebase(date);
    const existingReservation = existing.find(r => r.blockIndex === blockIndex);
    
    if (existingReservation) {
        if (!confirm('Ya hay reserva. ¿Reemplazar?')) {
            closeGrupoModal();
            return;
        }
        await deleteReservationFromFirebase(existingReservation.id);
    }
    
    // Crear nueva reserva
    const newReservation = {
        blockIndex: blockIndex,
        subject: subject.name,
        teacher: subject.teacher,
        grupo: grupo,
        timeSlot: timeSlot,
        date: date,
        reservedAt: new Date().toISOString()
    };
    
    await saveReservationToFirebase(newReservation);
    loadSchedule(date);
    closeGrupoModal();
    showNotification(`Grupo ${grupo} reservado`, 'success');
}

function editReservation(reservation) {
    const modal = document.getElementById('editModal');
    const editContent = document.getElementById('editContent');
    
    editContent.innerHTML = `
        <p><strong>Horario:</strong> ${reservation.timeSlot.start} - ${reservation.timeSlot.end}</p>
        <p><strong>Materia:</strong> ${reservation.subject}</p>
        <p><strong>Profesor:</strong> ${reservation.teacher}</p>
        <p><strong>Grupo:</strong> ${reservation.grupo}</p>
        <h4>Cambiar grupo:</h4>
        <select id="editGrupoSelect" class="teacher-input">
            ${GRUPOS.map(g => `<option value="${g}" ${g === reservation.grupo ? 'selected' : ''}>${g}</option>`).join('')}
        </select>
        <div class="edit-actions" style="margin-top: 20px;">
            <button onclick="updateReservationGrupo('${reservation.id}', ${reservation.blockIndex})" class="save-btn">
                <i class="fas fa-save"></i> Actualizar grupo
            </button>
            <button onclick="closeEditModal()" class="cancel-btn">Cancelar</button>
        </div>
    `;
    
    modal.showModal();
}

async function updateReservationGrupo(reservationId, blockIndex) {
    const newGrupo = document.getElementById('editGrupoSelect').value;
    await updateReservationInFirebase(reservationId, { grupo: newGrupo });
    loadSchedule(formatDate(currentDate));
    closeEditModal();
    showNotification('Grupo actualizado', 'success');
}

async function deleteReservation(reservationId, blockIndex) {
    if (confirm('¿Eliminar esta reserva?')) {
        await deleteReservationFromFirebase(reservationId);
        loadSchedule(formatDate(currentDate));
        closeEditModal();
        showNotification('Reserva eliminada', 'success');
    }
}

function closeModal() {
    document.getElementById('subjectModal')?.close();
    currentSlotInfo = null;
}

function closeEditModal() {
    document.getElementById('editModal')?.close();
}

function closeGrupoModal() {
    document.getElementById('grupoModal')?.close();
}

function updateSummary(reservations) {
    const summarySection = document.getElementById('summary');
    if (!summarySection) return;
    
    if (reservations.length === 0) {
        summarySection.innerHTML = '<p class="summary-item">No hay reservas para hoy</p>';
        return;
    }
    
    const stats = {};
    reservations.forEach(r => {
        const key = `${r.subject}|${r.teacher}|${r.grupo}`;
        if (!stats[key]) {
            stats[key] = {
                subject: r.subject,
                teacher: r.teacher,
                grupo: r.grupo,
                count: 0,
                blocks: []
            };
        }
        stats[key].count++;
        stats[key].blocks.push(`${r.timeSlot.start} - ${r.timeSlot.end}`);
    });
    
    summarySection.innerHTML = Object.values(stats)
        .map(stat => `
            <article class="summary-item">
                <h4>${stat.subject}</h4>
                <p class="teacher-name">${stat.teacher}</p>
                <p class="grupo-name">Grupo ${stat.grupo}</p>
                <p>${stat.count} bloque(s)</p>
                <small>${stat.blocks.join(' • ')}</small>
            </article>
        `).join('');
}
