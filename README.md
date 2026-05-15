# Album Manager

Aplicacion Angular para llevar el control de un album de barajitas.

## Funciones

- Vista `Mi album` organizada por pais/categoria.
- Estados por barajita: `Tengo`, `Repetida` y `Falta`.
- Toque ciclico por barajita: `Falta`, `Tengo`, `Repetida`.
- Listados automaticos de `Me faltan` y `Repetidas`.
- Copia de listas agrupadas por seleccion, con numeros separados por coma.
- Enlace compartible de solo lectura para que otra persona vea faltantes y repetidas sin iniciar sesion.
- Persistencia en Firebase Firestore.

## Catalogo

El catalogo local incluye 994 barajitas de la edicion Standard segun LastSticker:

- 9 de apertura.
- 48 selecciones con 20 barajitas cada una.
- 11 de historia del Mundial.
- 14 Coca-Cola Latinoamerica.

No incluye Extra/Base.

## Configurar Firebase

1. Crea un proyecto en Firebase.
2. Activa Firestore Database.
3. Crea una app web en Firebase y copia su configuracion.
4. Edita `src/environments/environment.ts`.
5. Cambia `firebase.enabled` a `true`.
6. Reemplaza los valores `TU_*` por los valores reales de tu proyecto.

## Datos y acceso

La app pide usuario y contrasena al entrar. Si el usuario no existe, lo crea con un hash SHA-256 de la contrasena. Luego guarda las barajitas en esta ruta de Firestore:

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

El enlace para compartir usa esta forma:

```text
/?share={userId}
```

La vista compartida muestra solo lectura de faltantes y repetidas. Las reglas incluidas en `firestore.rules` son abiertas para desarrollo; antes de publicar una version real conviene endurecerlas y separar lectura publica de escritura privada.

## Reglas de Firestore

Para desarrollo, copia el contenido de `firestore.rules` en Firebase Console > Firestore Database > Reglas > Publicar.

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

El workflow `.github/workflows/deploy-pages.yml` publica automaticamente al hacer push a `main`.

La URL esperada es:

```text
https://juanzozaya06.github.io/panini-filler/
```

En GitHub, configura Pages en `Settings > Pages > Source > GitHub Actions`.

Nota: el entorno actual usa Node 21, que Angular marca como no soportado para produccion. Para trabajo estable usa Node 20 LTS o Node 22 LTS.
