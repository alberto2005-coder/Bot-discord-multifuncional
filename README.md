# Proyecto Bot de Discord

## Resumen

Este es un bot de Discord construido con Discord.js v14 que ofrece varios comandos en diferentes categorías como moderación, diversión, información y utilidades. El bot utiliza comandos slash y está diseñado con una estructura modular para facilitar su mantenimiento y expansión.

**Creado por:** eldestructor7614 (<@1016814881112084533>)

## Arquitectura del Sistema

### Arquitectura Backend

* **Entorno de ejecución:** Node.js
* **Framework principal:** Discord.js v14
* **Patrón de arquitectura:** Basado en eventos con manejadores de comandos
* **Estructura de archivos:** Comandos organizados modularmente por categoría

### Componentes clave

1. **Aplicación principal (`index.js`)**

   * Inicialización del cliente del bot con los intents necesarios
   * Gestión de la colección de comandos
   * Manejo de eventos como cuando el bot está listo o hay interacciones
   * Centro principal de toda la funcionalidad del bot

2. **Despliegue de comandos (`deploy-commands.js`)**

   * Registro automático de comandos slash en la API de Discord
   * Recolecta comandos de todos los módulos y los registra globalmente
   * Usa la API REST de Discord para gestionar comandos

3. **Módulos de comandos** (organizados por categoría):

   * **Moderación** (`commands/moderation.js`): Funciones de gestión del servidor como expulsar o banear
   * **Diversión** (`commands/fun.js`): Juegos, bromas y entretenimiento
   * **Información** (`commands/info.js`): Datos de servidores y usuarios
   * **Utilidades** (`commands/utility.js`): Funciones básicas como ping y ayuda
   * **Sistema de tickets** (`commands/tickets.js`): Gestión completa de tickets de soporte
   * **Gestión de roles** (`commands/roles.js`): Asignación y manejo avanzado de roles
   * **Gestión de canales** (`commands/channels.js`): Crear, editar y eliminar canales
   * **AntiRaid** (`commands/antiraid.js`): Protección contra ataques y spam
   * **Sistema de bienvenida** (`commands/welcome.js`): Mensajes personalizados de entrada y salida
   * **Sistema de sorteos** (`commands/giveaways.js`): Gestión completa de sorteos y concursos
   * **Sistema de música** (`commands/music.js`): Reproductor de música de YouTube con cola y controles
   * **Comandos del dueño** (`commands/owner.js`): Comandos exclusivos para la gestión del bot

### Estructura de comandos

Cada comando sigue una estructura estándar:

* Definido con SlashCommandBuilder
* Verificación de permisos donde corresponde
* Respuestas con embeds para mejor experiencia
* Manejo de errores y validaciones

## Flujo de datos

1. **Inicialización del bot**

   * Carga de variables de entorno
   * Inicialización del cliente de Discord con intents
   * Registro de todos los comandos
   * Conexión a la puerta de enlace de Discord

2. **Procesamiento de comandos**

   * Recepción de interacción desde Discord
   * Validación del comando y permisos
   * Ejecución de la lógica del comando
   * Respuesta mediante embeds o texto simple

3. **Despliegue de comandos**

   * Proceso separado para registrar comandos en Discord
   * Recolecta definiciones y las envía para disponibilidad global

## Dependencias externas

### Dependencias principales

* **discord.js v14.21.0**: Biblioteca principal para Discord
* **dotenv v17.0.0**: Gestión de variables de entorno

### Integración con la API de Discord

* Usa Gateway para eventos en tiempo real
* API REST para registro y gestión de comandos
* Requiere token y client ID del portal de desarrolladores

### Variables de entorno necesarias

* `DISCORD_TOKEN`: Token de autenticación del bot
* `CLIENT_ID`: ID de la aplicación Discord

## Estrategia de despliegue

### Configuración actual

* Aplicación Node.js sencilla
* Configuración basada en entorno
* Despliegue manual de comandos con script separado

### Permisos que necesita el bot

* Leer mensajes / ver canales
* Enviar mensajes
* Usar comandos slash
* Expulsar miembros (para moderación)
* Banear miembros (para moderación)
* Gestionar mensajes (implícito para moderación)
* Gestionar canales (para sistema de tickets)
* Crear canales privados (para tickets)
* Conectarse a canales de voz (para música)
* Hablar en canales de voz (para música)
* Usar actividad de voz (para música)

### Proceso de despliegue

1. Instalar dependencias: `npm install`
2. Configurar variables de entorno
3. Desplegar comandos: `node deploy-commands.js`
4. Iniciar bot: `node index.js`

## Decisiones arquitectónicas clave

### Estructura modular de comandos

**Problema:** Necesidad de organización y mantenimiento fácil
**Solución:** Separar comandos en módulos por categoría
**Beneficios:** Código más limpio, escalable y mantenible

### Uso exclusivo de comandos slash

**Problema:** Discord está eliminando comandos basados en mensajes
**Solución:** Usar solo comandos slash
**Beneficios:** Mejor experiencia, integración nativa, control automático de permisos

### Respuestas con embeds

**Problema:** Respuestas de texto plano son poco atractivas
**Solución:** Usar embeds para respuestas visualmente mejores
**Beneficios:** Experiencia de usuario mejorada, presentación profesional

### Control de acceso por permisos

**Problema:** Restringir comandos peligrosos
**Solución:** Uso del sistema de permisos de Discord
**Beneficios:** Control seguro y automático de acceso

## Funcionalidades principales

### Sistema de tickets

* Panel interactivo con botones
* Creación automática de canales privados
* Gestión de usuarios en tickets
* Cierre automático con confirmación
* Previene que un usuario tenga varios tickets abiertos
* Mensajes y respuestas con embeds profesionales

### Gestión de roles

* Asignación inteligente de roles con validación jerárquica
* Comprobación de permisos para evitar abusos
* Listado de roles del servidor o usuario
* No permite modificar roles iguales o superiores al del usuario

### Protección AntiRaid

* Panel interactivo para activar/desactivar protecciones
* Bloqueo de enlaces, menciones @everyone/@here y invitaciones
* Límite configurable de menciones por mensaje
* Moderación automática con eliminación y avisos
* Bloqueo de emergencia para todo el servidor
* Monitoreo y respuesta en tiempo real

### Gestión de canales

* Crear canales de texto, voz y categorías con configuraciones personalizadas
* Establecer límites de usuarios en canales de voz
* Editar nombres y configuraciones de canales existentes
* Eliminación segura con confirmaciones y registros

### Sistema avanzado de moderación

* Registro y seguimiento de advertencias con escalada automática
* Silenciar usuarios temporalmente con duración configurable
* Comandos de expulsión/ban con registros detallados
* Gestión completa de advertencias (ver, borrar, historial)
* Notificaciones automáticas vía DM a usuarios sancionados

### Colección de juegos y diversión

* Juegos interactivos: bola 8, piedra-papel-tijera, calculadora de amor
* Generadores aleatorios: dados, números, moneda, memes
* Bromas, datos curiosos y memes integrados
* Juegos sociales y tests de compatibilidad

### Sistema de bienvenida y despedida

* Mensajes personalizados y configurables
* Canales, colores y plantillas personalizables
* Variables dinámicas (nombre de usuario, servidor, etc.)
* Mensajes con embeds profesionales
* Herramientas para probar configuraciones

### Sistema de sorteos y concursos

* Sorteos interactivos con participación por reacción o botones
* Duración personalizable (1 minuto a 7 días)
* Soporte para múltiples ganadores
* Control manual para finalizar o volver a sortear
* Actualizaciones en vivo de participantes
* Usuarios pueden unirse o salir con botones
* Herramientas administrativas para gestionar sorteos activos

### Sistema de música

* Integración con YouTube para reproducir canciones
* Gestión de cola, lista y reproducción
* Controles de reproducción: play, pausa, saltar, detener
* Control de volumen ajustable (0-100%)
* Modos de repetición: canción, lista o desactivado
* Conexión automática a canales de voz
* Mensajes con embeds profesionales con info y miniaturas
* Soporte para varios servidores con colas independientes

### Comandos del propietario

* Cambiar estado del bot (jugando, escuchando, viendo, etc.)
* Cambiar avatar con imágenes
* Cambiar nombre de usuario
* Panel con estadísticas e información detallada
* Ver lista de servidores donde está activo
* Reiniciar bot con recuperación automática
* Apagar bot con confirmación
* Comandos restringidos solo para el creador (eldestructor7614)
* Limpiar estado actual del bot cuando sea necesario

### Permisos necesarios para el bot

* Leer mensajes y ver canales
* Enviar mensajes
* Usar comandos slash
* Expulsar y banear miembros
* Gestionar mensajes y canales
* Crear canales privados
* Conectarse y hablar en canales de voz

## Registro de cambios

* 30 de junio de 2025: Configuración inicial con comandos básicos
* 30 de junio de 2025: Añadido sistema completo de tickets con paneles y botones
* 30 de junio de 2025: Añadido sistema de roles con validación jerárquica
* 30 de junio de 2025: Añadido sistema antiraid completo con panel interactivo
* 30 de junio de 2025: Añadidos comandos de gestión de canales
* 30 de junio de 2025: Añadido bloqueo de emergencia para protección antiraid
* 30 de junio de 2025: Mejoras en moderación con sistema de advertencias y muteos
* 30 de junio de 2025: Expansión de comandos de diversión con juegos y memes
* 30 de junio de 2025: Añadido sistema de bienvenida y despedida personalizado
* 30 de junio de 2025: Integración profesional de eventos de entrada/salida
* 30 de junio de 2025: Añadido sistema completo de sorteos interactivos
* 30 de junio de 2025: Corrección del sistema de advertencias para ser por servidor
* 30 de junio de 2025: Implementado sistema completo de música con YouTube
* 30 de junio de 2025: Añadidos comandos exclusivos para el propietario
* 30 de junio de 2025: Implementadas funciones para reinicio y apagado seguro

## Preferencias del usuario

Estilo de comunicación preferido: lenguaje sencillo y cotidiano.
Creador del bot: eldestructor7614 (<@1016814881112084533>)
