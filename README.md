# Panini Filler

Aplicación Angular para llevar el control de un álbum Panini.

## Funciones

- Vista general de todos los números en círculos de color.
- Catálogo ordenado por introducción/historia y selecciones.
- Estados por barajita: `Tengo`, `Repetida` y `Falta`.
- Toque ciclico por cromo: `Falta`, `Tengo`, `Repetida`.
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

Estas reglas permiten leer y escribir solo dentro de:

```text
users/Nidito
```

La app pide usuario y contraseña al entrar. Si el usuario no existe, lo crea con un hash SHA-256 de la contraseña. Luego guarda los cromos en esta ruta de Firestore:

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

El catálogo local incluye 980 cromos de la edición Standard según LastSticker: 9 de apertura, 48 selecciones con 20 cromos cada una y 11 de historia del Mundial. No incluye Coca-Cola ni Extra/Base.

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

Nota: el entorno actual usa Node 21, que Angular marca como no soportado para producción. Para trabajo estable usa Node 20 LTS o Node 22 LTS.
