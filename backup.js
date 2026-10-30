// ==========================================
// SISTEMA DE BACKUP Y RESTAURACIÓN
// ==========================================

// 1. Descargar el Backup
async function descargarBackup() {
  try {
    mostrarAlerta('Generando archivo de backup...', 'success');
    
    // Tablas que vamos a guardar
    const tablas = ['productos', 'pedidos', 'slides', 'resenas', 'configuracion'];
    let backupData = {};
    
    // Descargamos los datos de Supabase
    for (const tabla of tablas) {
      const data = await fetchSupabase(`/rest/v1/${tabla}?select=*`);
      backupData[tabla] = data;
    }

    // Creamos el archivo JSON y lo descargamos
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_pizzeria_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    mostrarAlerta('Backup descargado con éxito.');
  } catch (error) { 
    mostrarAlerta('Error al generar backup: ' + error.message, 'error'); 
  }
}

// 2. Restaurar el Backup
function restaurarBackup(input) {
  const file = input.files[0]; 
  if (!file) return; // Si el usuario cancela, no hace nada

  // Usamos el modal bonito que ya tienes
  confirmarAccion('Restaurar Backup', '¿Seguro que quieres restaurar este backup? Se sobrescribirán los datos actuales.', () => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        mostrarAlerta('Restaurando base de datos...', 'success');
        
        // Recorremos las tablas y metemos los datos
        for (const tabla in data) {
          // 1. Borramos lo que hay actualmente (para no duplicar)
          await fetch(`${SUPABASE_URL}/rest/v1/${tabla}?id=neq.0`, {
            method: 'DELETE',
            headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY }
          });

          // 2. Insertamos los datos del archivo JSON
          if (data[tabla] && data[tabla].length > 0) {
            await fetch(`${SUPABASE_URL}/rest/v1/${tabla}`, {
              method: 'POST',
              headers: { 
                'apikey': SUPABASE_SERVICE_KEY, 
                'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY, 
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(data[tabla])
            });
          }
        }
        
        mostrarAlerta('Backup restaurado con éxito.');
        // Recargamos todas las secciones para que se vean los datos nuevos
        if(typeof cargarProductos === 'function') cargarProductos(); 
        if(typeof cargarPedidos === 'function') cargarPedidos(); 
        if(typeof cargarSlides === 'function') cargarSlides(); 
        if(typeof cargarResenas === 'function') cargarResenas();
        
      } catch (error) { 
        mostrarAlerta('Error al restaurar: ' + error.message, 'error'); 
      }
    };
    reader.readAsText(file);
  });
}

// 3. Limpiar Base de Datos
function limpiarBaseDeDatos() {
  confirmarAccion('¡CUIDADO!', 'Esto borrará TODOS los pedidos, productos, reseñas y slider. No se puede deshacer.', async () => {
    try {
      mostrarAlerta('Limpiando base de datos...', 'success');
      
      const tablas = ['pedidos', 'resenas', 'slides', 'productos'];
      
      for (const tabla of tablas) {
        await fetch(`${SUPABASE_URL}/rest/v1/${tabla}?id=neq.0`, {
          method: 'DELETE',
          headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY }
        });
      }
      
      mostrarAlerta('Base de datos limpia correctamente.');
      
      // Recargamos
      if(typeof cargarProductos === 'function') cargarProductos(); 
      if(typeof cargarPedidos === 'function') cargarPedidos(); 
      if(typeof cargarSlides === 'function') cargarSlides(); 
      if(typeof cargarResenas === 'function') cargarResenas();
      
    } catch (error) {
      mostrarAlerta('Error al limpiar: ' + error.message, 'error');
    }
  });
}
