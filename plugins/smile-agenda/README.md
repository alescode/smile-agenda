# Smile Agenda

Plugin para que estudiantes de odontología sincronicen su propia agenda Smile UFM con su propio Google Calendar desde el chat.

## Empezar

1. Instala o añade este plugin en un host compatible con plugins y herramientas de navegador de escritorio.
2. Conecta Google Calendar con tu cuenta personal mediante el flujo del host. Este paquete no trae una conexión compartida ni credenciales de Google.
3. Conecta Chrome al host y abre Smile. Inicia sesión tú mismo. El plugin reutiliza esa pestaña; no necesita tu contraseña.
4. Pide: **«Sincroniza mis citas de esta semana y la próxima con Google Calendar»**.
5. La primera vez, el asistente identifica la cuenta Smile y el calendario destino y prepara un registro privado local. En las siguientes sincronizaciones conserva esa carpeta para evitar duplicados.

Cada estudiante debe completar esos pasos con sus propias cuentas. Compartir el plugin no comparte sesiones ni calendarios.

## Resultado

Título: `Cita: Ana · Restaurativa`.

Notas:

```text
Clínica: Restaurativa
Estado: No confirmada
```

Se mantienen los horarios y duración reales. Los eventos son privados, sin invitados ni Meet, y tienen un aviso 30 minutos antes. Las citas de jornada conservan esa distinción en notas. No se incluyen documentos, saldos, notas clínicas, URL del sistema ni duración duplicada en las notas.

El intervalo predeterminado va desde el lunes de esta semana, incluidos los días anteriores a hoy, hasta el domingo de la próxima, en America/Guatemala. Por ejemplo, un viernes se incluyen el lunes, martes, miércoles y jueves anteriores de esa misma semana.

## Cómo funciona

Es un plugin de flujo asistido: una habilidad coordina Chrome y las herramientas de Google Calendar disponibles en el host. Incluye código local comprobable para fechas, formato, planificación y registro de sincronización. No instala un servidor remoto y no se ejecuta solo en segundo plano. La app Node.js anterior sigue siendo independiente; no se copian sus sesiones a este paquete.

El registro guarda únicamente hashes de cuenta/cita, identificadores de eventos y estado de operaciones. No guarda nombres ni cuerpos de eventos. Los datos de las citas pasan por el contexto de la conversación y los campos elegidos se envían al Google Calendar del estudiante. No se guardan resultados, capturas ni trazas en archivos locales. La sesión de Smile permanece en el perfil de Chrome del estudiante.

Si Smile caduca, se solicita acceso manual de nuevo. Si cambia su interfaz, la sincronización se detiene para revisar la extracción. Una respuesta incompleta no se interpreta como cero citas. Las cancelaciones no borran eventos automáticamente. Si se pierde el registro local, el asistente debe reconciliar los eventos antes de crear nuevos.

## Distribución y actualizaciones

Esta edición se distribuye mediante el catálogo Git `smile-agenda-distribution`. Consulta el README de la raíz del repositorio para instalar y actualizar desde esa misma fuente. La copia privada anterior y esta distribución Git son canales diferentes; sus actualizaciones no se propagan entre sí.

## Validación

```sh
npm test
```

No necesita instalar dependencias para esas pruebas (Node.js 18 o posterior). Prueba límites de semana y zona horaria, formato, duración, aislamiento de cuentas, idempotencia, cambios de horario, cancelaciones, recuperación de operaciones pendientes y permisos del registro. Todos los datos de pruebas son ficticios.

La interfaz y el flujo de navegador/Google Calendar se basan en una sincronización real comprobada el 23/10/2026. No se ha probado una instalación completa con una segunda cuenta de estudiante. No se incluyen datos de esa sesión original.
