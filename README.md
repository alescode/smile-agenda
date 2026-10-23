# Smile Agenda

Citas personales de Smile UFM en Google Calendar, con una fuente de instalación que permite recibir nuevas versiones. Plugin independiente, sin afiliación oficial con la UFM.

## Instalar

Requiere un host compatible con marketplaces Git, acceso a Chrome, Google Calendar conectado y almacenamiento local. El CLI instalado debe ofrecer `codex plugin marketplace`.

Repositorio público: https://github.com/alescode/smile-agenda

Instala la fuente con:

```sh
codex plugin marketplace add alescode/smile-agenda --ref main
```

Después, abre Plugins en la aplicación de escritorio, selecciona la fuente **Smile Agenda** e instala **Smile Agenda**. Reinicia la aplicación si la fuente nueva aún no aparece. Conecta tu propio Google Calendar y abre tu sesión de Smile en Chrome. Pide:

> Sincroniza mis citas de esta semana y la próxima con Google Calendar.

La primera vez se prepara un registro local privado. Consérvalo entre actualizaciones para evitar duplicados. No coloques ese registro dentro de este repositorio ni en el caché del plugin.

## Recibir actualizaciones

```sh
codex plugin marketplace upgrade smile-agenda-distribution
```

Este comando actualiza la copia del catálogo Git. Reinicia la aplicación y comprueba la versión instalada en Plugins antes de usarla. La recarga puede depender de la versión del host; no se promete actualización inmediata en una conversación que ya está abierta. No hace falta volver a recibir un ZIP.

## Si tenías la versión privada anterior

La instalación privada creada con Plugin Creator y esta fuente Git son canales distintos. Desactiva la habilidad de la instalación anterior antes de usar la nueva para no tener dos versiones activas. Conserva el registro local de IDs; no borres calendarios ni eventos. El asistente puede migrar ese registro tras verificar tus cuentas. Cambiar de canal no debe volver a crear las citas ya existentes.

## Publicar una nueva versión (mantenedor)

Edita el código y las instrucciones bajo `plugins/smile-agenda/`. Luego:

```sh
npm run release:version -- 0.1.2
npm test
git diff
```

Añade la entrada correspondiente a CHANGELOG.md, revisa y confirma los cambios, y súbelos a `main`. El comando de versión mantiene alineados el manifiesto portable, el de compatibilidad y los package.json. Las pruebas se ejecutan localmente con `npm test`. `docs/ci-workflow.yml` es una plantilla opcional para GitHub Actions: un mantenedor con permiso para workflows puede copiarla a `.github/workflows/test.yml`. No está activada en esta publicación.

No publiques desde la carpeta de trabajo original ni copies `.session`, cookies, tokens, registros de citas o datos de pacientes. Este repositorio contiene únicamente el plugin y pruebas ficticias.

## Alcance

Formato `Cita: Ana · Restaurativa`; notas con clínica y estado. Sin documentos, saldos ni observaciones clínicas. Lee Smile sin modificarlo. Utiliza las conexiones personales del estudiante. Es un flujo asistido desde chat, no un servicio en segundo plano. No se ha validado aún una segunda cuenta de estudiante. La disponibilidad del catálogo no garantiza que todos los hosts admitan las mismas herramientas de navegador y Google Calendar.

Detalles: [guía del plugin](plugins/smile-agenda/README.md).

Distribución Git documentada por OpenAI: https://developers.openai.com/plugins/build/plugins#add-a-marketplace-from-the-cli
