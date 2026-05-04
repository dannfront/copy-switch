# Copy Switch

> Traducción instantánea desde el portapapeles, sin interrumpir tu flujo de trabajo.

Copy Switch es una aplicación de escritorio construida con **Electron**, **React** y **TypeScript**. Se mantiene en segundo plano (bandeja del sistema) y te permite traducir cualquier texto que copies al portapapeles usando un atajo de teclado global.

## ¿Qué hace?

- **Atajo global**: Presioná `Ctrl + Shift + T` (configurable en el futuro) y la app lee automáticamente el contenido de tu portapapeles.
- **Popup flotante**: Aparece una ventana flotante cerca del cursor con la traducción en tiempo real vía la API de [DeepL](https://www.deepl.com/pro-api).
- **Historial**: Guarda un registro de tus traducciones anteriores para acceder rápidamente.
- **Pin**: Podés fijar el popup para que permanezca visible mientras trabajás.
- **Settings**: Configurá tu API key de DeepL y seleccioná los idiomas de origen y destino.

## Arquitectura

- **Main process** (`src/main/`): Gestiona la ventana principal en segundo plano, atajos globales, la bandeja del sistema y la comunicación IPC.
- **Renderer process** (`src/renderer/`): Interfaz de usuario construida con React 19 y Tailwind CSS v4.
- **Preload** (`src/preload/`): Puente seguro entre main y renderer.
- **DeepL Client** (`src/main/deepl/`): Cliente para la API de traducción con manejo de errores (rate limits, quota, network retries).

## Requisitos

- [Node.js](https://nodejs.org/) (versión LTS recomendada)
- [pnpm](https://pnpm.io/)
- Una API key de [DeepL](https://www.deepl.com/pro-api) (gratis o Pro)

## Instalación

```bash
$ pnpm install
```

## Desarrollo

```bash
$ pnpm dev
```

## Build

```bash
# Windows
$ pnpm build:win

# macOS
$ pnpm build:mac

# Linux
$ pnpm build:linux
```

## Configuración IDE recomendada

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Licencia

MIT
