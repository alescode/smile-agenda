# Interfaz observada

Observada el 23/10/2026 en una cuenta de alumno de Smile UFM. Revalidar la estructura para cada cuenta; no suponer que roles administrativos tienen el mismo alcance.

- Agenda: `https://smile-ag.ufm.edu/smileweb/index.php/agenda/index/admin`.
- Acceso: `/smileweb/index.php/autentificacion/login/`, campos `input[name="login"]`, `input[name="password"]`.
- Formulario `#buscar` (POST a la misma ruta), departamento `#clinica`, fechas `input[name="fecha1"]` y `input[name="fecha2"]`, botón de consulta `#busca`.
- Departamentos: descubrir las opciones reales de `#clinica`; no fijar los diez de la cuenta usada para desarrollar el plugin.
- Resultados: `#tabla`, filas `tbody tr.row_table`.
- Primeras ocho cabeceras: FECHA, HORA, DUR, DOCUMENTO, PACIENTE, Alumno, CLINICA FISICA, ESTATUS.
- Leer índices 0, 1, 2, 4, 6 y 7. Ignorar 3 y 5. La fecha es DD/MM/YYYY; la hora/duración HH:mm. El nombre del paciente puede tener un prefijo numérico que debe quitarse.
- No alinear columnas posteriores: se observó una cabecera FIRMADO sin celda correspondiente en algunas filas.
- ID de cita: leer la expresión inicial `cita=123456;` de un atributo onclick de botón dentro de la fila. Nunca ejecutar el atributo ni pulsar editar.
- Búsqueda inicia un GET que puede abortarse y luego un POST con excel, imprimir, recargar, clinica, fecha1, fecha2 y codigomedico. Los campos de exportación permanecen 0/vacíos. No llamar endpoints de creación, estado, observaciones ni exportación.
- Sin citas, la tabla puede estar ausente. Solo considerar vacío después de confirmar carga completa, filtros y sesión. Un error o timeout NO es cero citas.

Para usar Playwright local en una integración futura, preservar esta lista de solo lectura y el inicio de sesión manual. No copiar el fallback absoluto del runtime del desarrollador, una ruta de usuario, su cookie, su calendario ni su conexión de depuración. El flujo de este plugin usa Chrome conectado en el host y no necesita instalar Playwright por estudiante.
