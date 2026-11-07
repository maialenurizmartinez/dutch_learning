# dutch_learning

Aplicación para practicar neerlandés desde el español. Por ahora: verbos irregulares
(pasado singular, pasado plural, participio y significado).

Es una web instalable (PWA): ábrela en el móvil y usa "Añadir a pantalla de inicio".
Funciona sin conexión después de la primera visita.

## Estructura

- `index.html`: la página
- `css/style.css`: estilos (colores claros y oscuros en `:root`)
- `js/verbs.js`: lista de verbos, una línea por verbo:
  `infinitivo|pasado sg|pasado pl|participio|auxiliar|significado`
  (auxiliar: `h` = heeft, `z` = is, `hz` = ambos; formas alternativas con `/`)
- `js/app.js`: lógica del ejercicio
- `sw.js`, `manifest.webmanifest`, `icons/`: lo necesario para instalarla y usarla sin conexión

## Probar en local

```
python3 -m http.server 8000
```

y abre http://localhost:8000
