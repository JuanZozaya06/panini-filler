# Album Manager

Aplicación Angular para llevar el control de un álbum de barajitas.

## Funciones

- Vista general de todos los números en círculos de color.
- Catálogo ordenado por introducción/historia y selecciones.
- Estados por barajita: `Tengo`, `Repetida` y `Falta`.
- Toque cíclico por barajita: `Falta`, `Tengo`, `Repetida`.
- Listado automático de faltantes.
- Listado automático de repetidas con contador de copias.
- Persistencia en Firebase Firestore.

## Configurar Firebase

1. Crea un proyecto en Firebase.
2. Activa Firestore Database.
3. Crea una app web en Firebase y copia su configuración.
4. Edita `src/environments/environment.ts`.
5. Cambia `firebase.enabled` a `true`.
6. Reemplaza los valores `TU_*` por los valores reales de tu proyecto.

## Reglas de Firestore

Para desarrollo, copia el contenido de `firestore.rules` en Firebase Console > Firestore Database > Reglas > Publicar.

La app pide usuario y contraseña al entrar. Si el usuario no existe, lo crea con un hash SHA-256 de la contraseña. Luego guarda las barajitas en esta ruta de Firestore:

```text
users/{userId}/albums/world-cup-2026/stickers/{numero}
```

Cada documento usa esta forma:

```json
{
  "status": "owned",
  "duplicateCount": 0,
  "updatedAt": "2026-05-09T00:00:00.000Z"
}
```

El catálogo local incluye 1012 barajitas de la edición Standard según LastSticker: 9 de apertura, 48 selecciones con 20 barajitas cada una, 11 de historia del Mundial y 32 Coca-Cola. No incluye Extra/Base.

## Desarrollo

```bash
npm install
npm start
```

Abre `http://localhost:4200/`.

## Build

```bash
npm run build
```

## GitHub Pages

El workflow `.github/workflows/deploy-pages.yml` publica automáticamente al hacer push a `main`.

La URL esperada es:

```text
https://juanzozaya06.github.io/panini-filler/
```

En GitHub, configura Pages en `Settings > Pages > Source > GitHub Actions`.

Nota: el entorno actual usa Node 21, que Angular marca como no soportado para producción. Para trabajo estable usa Node 20 LTS o Node 22 LTS.
