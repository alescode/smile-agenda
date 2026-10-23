---
name: sincronizar-citas
description: Sincroniza las citas personales de Smile UFM con Google Calendar desde una sesión autenticada en Chrome. Úsala para importar o actualizar esta semana y la próxima, evitando duplicados y manteniendo Smile en solo lectura.
---

# Smile Agenda

Este plugin coordina el navegador y Google Calendar del estudiante actual. No contiene cuentas, sesiones, pacientes ni credenciales compartidas. No es una tarea en segundo plano. Necesita navegador controlable, Google Calendar conectado y almacenamiento local privado para el registro de sincronización. Si falta una capacidad, resolverla antes de escribir eventos.

## Preparar las cuentas

1. Descubrir las herramientas disponibles de Google Calendar. Leer los calendarios y comprobar acceso de escritura. Si falta la conexión, buscar Google Calendar con Plugin Management y ofrecer su conexión por el flujo admitido; el estudiante autentica su propia cuenta. No pedir contraseñas ni copiar cookies de otro perfil. Si no se puede conectar, explicar qué falta sin afirmar que se sincronizó.
2. Seleccionar el calendario principal propio salvo que el usuario indique otro. Si hay ambigüedad, preguntar. Informar qué cuenta/calendario se usará. No asumir que la cuenta Google y el nombre del estudiante Smile deben coincidir: puede ser autorizado, pero confirmar una discrepancia inesperada.
3. Usar las herramientas de navegador disponibles y su documentación. Enumerar pestañas y reutilizar la pestaña autenticada de `https://smile-ag.ufm.edu`. No abrir sucesivas ventanas sin autenticar ni exportar cookies de la extensión. Si no existe una pestaña, abrir una sola y dejar que el estudiante inicie sesión manualmente. Conservar la pestaña mediante el mecanismo de handoff del host mientras se espera. No automatizar las credenciales.
4. Identificar al estudiante en la interfaz visible. Si solo hay un nombre abreviado, pedir su identificador de cuenta para aislar el registro; no su contraseña. No usar una identidad del creador del plugin. Derivar el ámbito con `core.scopeKey(identidadSmile, calendarIdReal)`.
5. Mantener un directorio local estable y privado por usuario, fuera de la carpeta del plugin y de carpetas sincronizadas/compartidas. En Codex puede ser una carpeta de datos elegida dentro del espacio permitido. Recordar su ruta en las instrucciones del usuario; no buscar sesiones por todo el disco. `ledger.open(rutaAbsoluta, scope)` crea permisos restrictivos, exclusión de Git y bloqueo. Sin un registro persistente, no prometer sincronización repetible.

## Consultar Smile (solo lectura)

Leer [la referencia de interfaz](references/smile.md). La raíz del dominio siempre redirige al login; no usarla para juzgar si una sesión autenticada sigue vigente. Usar el enlace Agenda real o la ruta ya verificada `/smileweb/index.php/agenda/index/admin`.

Usar `core.weeks()` de `scripts/core.cjs` para calcular lunes de esta semana a domingo de la siguiente en America/Guatemala, incluidos los días ya transcurridos. Un intervalo indicado por el usuario prevalece. Consultar TODOS los departamentos disponibles del alumno, no agendas de otros alumnos.

Inspeccionar filtros y cabeceras actuales antes de usar los selectores documentados. Cambiar solo el departamento y las fechas; pulsar exclusivamente búsqueda. El botón real inicia GET y luego POST: esperar el resultado final y comprobar filtros y filas. No asumir que la primera navegación abortada es un error definitivo. Si la interfaz cambió, fallar explícitamente y reinspeccionar; nunca inventar un selector o una API.

Leer las filas con la función de `scripts/read-visible.js` en el evaluador de lectura del navegador admitido. Puede cargarse como texto solo si la API documentada lo admite; en otro caso reproducirla fielmente. No ejecutar APIs internas ni el onclick de las filas. El identificador de cita se LEE del atributo del botón; no se pulsa.

Mantener los resultados en memoria. Extraer solo identificador estable, fecha, hora, duración, nombre del paciente, departamento, clínica y estado. No extraer documentos, saldos, observaciones, mensajes ni fichas. Evitar snapshots completos con datos innecesarios. Validar que cada departamento terminó de cargar antes de aceptar ausencia de tabla como vacío. Si hay error, sesión caducada o carga incompleta, abortar la sincronización completa sin escribir en Google.

## Presentar los eventos

- Título: `Cita: Carlos · Restaurativa`.
- Nombre con iniciales mayúsculas. Los nombres en Smile suelen empezar por apellidos: NO tomar siempre la primera o tercera palabra. Identificar el nombre de pila cuando sea claro; si es ambiguo, pedir al estudiante el nombre de pila o conservar el nombre completo con capitalización normal, explicándolo. No abrir fichas clínicas para resolverlo ni inventar nombres. Pasar la elección explícita como `firstName` a `core.event`.
- `ODONTOLOGIA PACIENTE CLINICA` se representa como `Paciente sin identificar`, no como una persona llamada Clínica.
- Clínica una sola vez en título y una sola vez en notas. Conservar la distinción `/ Jornada` en las notas cuando figure así en Smile. No inventar dirección, edificio ni sala. No duplicar la clínica en `location`: dejarlo vacío.
- Notas: `Clínica: Restaurativa` y `Estado: No confirmada`; aclaración breve solo si no hay paciente identificado. Sin origen URL, duración, documentos, apellidos innecesarios, ID visible ni marca Smile.
- Horario exacto más duración real; nunca adivinar una duración ausente. Zona America/Guatemala, eventos privados, sin invitados, sin Google Meet y recordatorio emergente 30 minutos antes salvo preferencia del usuario.
- Incluir citas pasadas realizadas/no asistidas con su estado. No crear nuevas citas canceladas. Para una cita ya sincronizada que pasa a cancelada, actualizar las notas a cancelada y marcar transparencia `transparent`, sin borrar automáticamente el evento.

## Sincronizar sin duplicados

La petición explícita de sincronizar autoriza crear/actualizar estos eventos. No pedir otra aprobación rutinaria para cada cita. Antes de escribir, completar TODA la extracción, resolver nombres/duraciones ambiguos y mostrar un breve resumen de período, cuenta y cantidad.

1. Leer todos los eventos del calendario destino en el intervalo, paginando hasta el final. Usar los límites RFC3339 de `core.weeks()`. No copiar eventos de otra cuenta.
2. Abrir el registro privado con `scripts/ledger.cjs`. Sus entradas solo contienen hashes, ID del evento Google, huella y estado pendiente; nunca nombres, horarios, cuerpos de eventos ni cookies. El ámbito combina la identidad Smile y el calendario. La clave por cita usa el ID estable, no nombre/fecha/hora.
3. `core.plan` produce crear, actualizar, sin cambios o revisar. Si un evento registrado no aparece en el intervalo, leerlo por ID antes de decidir: puede haberse movido. No crear automáticamente otro. Si fue eliminado, preguntar si se desea restaurar. Eventos ajenos no se modifican.
4. Si falta el registro o hay un evento igual sin propiedad demostrada, revisar antes de duplicar o adoptarlo. Si el usuario ya sincronizó con la app previa y proporciona su registro local de IDs, migrar solo sus pares cita/evento al ámbito correcto tras comprobar cuenta y calendario; nunca incluir ese registro en un paquete.
5. Antes de crear, guardar `entries[key]={pending:true,fingerprint}`. Llamar a la herramienta create_event con los argumentos preparados. Al confirmar éxito, guardar inmediatamente `{eventId,fingerprint,pending:false}`. Si el resultado es desconocido o falla el guardado, detener nuevas escrituras y reconciliar consultando Google; NO repetir una creación a ciegas. No marcar como concluida una operación desconocida.
6. Para actualizar, leer el evento, comprobar que pertenece al registro y al calendario, y pasar solo título, descripción, ubicación y horarios preparados. Conservar invitados, recordatorios, recurrencias y cualquier campo no gestionado. Si el evento se volvió recurrente o tiene invitados inesperados, detener su actualización y resolverlo con el usuario. `core.plan` no decide sobre estas situaciones por sí solo.
7. No borrar eventos porque una cita haya desaparecido de la tabla. Informar la discrepancia; requerir una instrucción de eliminación concreta antes de borrar de Google. No crear/modificar/cancelar nada en Smile.
8. Verificar por IDs todos los eventos afectados: título, notas, privacidad, hora y duración. Guardar el registro después de cada éxito y liberar el bloqueo en finally. Un bloqueo de una operación interrumpida debe inspeccionarse y reconciliarse, no eliminarse automáticamente.
9. Informar creadas, actualizadas, sin cambios y pendientes. No afirmar que existe sincronización automática recurrente. Programarla solo si se solicita y si el host puede acceder a ambas sesiones en las ejecuciones futuras; documentar la necesidad de renovar Smile.

## Límites del paquete

No instala ni autentica Google Calendar automáticamente fuera del flujo de conexión del host. La lectura real se hace con el navegador del estudiante; las escrituras con su conexión Google. Los helpers son locales, sin servidor ni telemetría. Para guía de instalación, ver el README del plugin. No publicar ni guardar pacientes en logs, capturas, fixtures, archivos de resultados o el ZIP.
