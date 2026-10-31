// ==========================================
// GUARDIÁN DE SEGURIDAD - CONTROL DE ACCESO
// ==========================================

const AuthGuard = {
  // 1. Guardar la sesión cuando el usuario se loguea
  saveSession: (email, rol) => {
    const sessionData = {
      email: email,
      rol: rol,
      timestamp: new Date().getTime()
    };
    localStorage.setItem('pizzeria_session', JSON.stringify(sessionData));
  },

  // 2. Leer la sesión actual
  getSession: () => {
    const session = localStorage.getItem('pizzeria_session');
    if (!session) return null;
    return JSON.parse(session);
  },

  // 3. Cerrar sesión
  logout: () => {
    localStorage.removeItem('pizzeria_session');
    localStorage.removeItem('cocina_nombre'); // Limpiamos también el nombre de cocina
    window.location.reload();
  },

  // 4. Proteger una página (El portero)
  protectPage: (requiredRoles = []) => {
    const session = AuthGuard.getSession();

    // Si no hay sesión, lo mandamos al login
    if (!session) {
      window.location.href = 'admin.html';
      return false;
    }

    // Si la página requiere un rol específico y el usuario no lo tiene, lo bloqueamos
    if (requiredRoles.length > 0 && !requiredRoles.includes(session.rol)) {
      alert('No tienes permisos para acceder a esta sección.');
      window.location.href = 'admin.html';
      return false;
    }

    return true;
  }
};
