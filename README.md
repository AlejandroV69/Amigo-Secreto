# Amigo Secreto — Web local

Pequeña aplicación web para jugar al Amigo Secreto en una sola máquina. Los datos se guardan localmente en el navegador.

Características

- Interfaz responsiva (móvil / escritorio).
- Agregar cualquier cantidad de participantes.
- Generar asignaciones automáticas sin autoasignaciones.
- Revelado individual: cada participante pulsa "Ver" para mostrar solo su asignado.
- Persistencia local usando `localStorage`.
- Tema navideño: guirnaldas, luces, nieve y confetti al revelar.

Archivos principales

- `index.html` — interfaz HTML.
- `style.css` — estilos (tema navideño y animaciones).
- `main.js` — lógica: gestión de participantes, sorteo, persistencia, efectos.

Cómo usar

1. Abrir la carpeta del proyecto y servirla localmente (recomendado) o abrir `index.html` directamente.

   Usando Python (PowerShell):

   ```pwsh
   python -m http.server 8000
   # luego abre http://localhost:8000/ en el navegador
   ```

2. Añadir participantes con el campo de texto y el botón `Añadir`.
3. Pulsar `Sortear` para generar las asignaciones.
4. Cada participante pulsa `Ver` junto a su nombre para revelar su asignado — al revelar se lanza confetti.

Persistencia

- Los participantes y asignaciones se guardan en `localStorage` con las claves:
  - `amigo_participantes`
  - `amigo_asignaciones`

Ediciones rápidas

- Cambiar el nombre en el footer: editar `index.html` y modificar el texto de `<footer class="site-footer">`.
- Desactivar nieve: en `main.js` cambiar `snowEnabled = true;` por `false` o comentar la llamada `startSnow()` al final.
- Ajustar cantidad de confetti: en `main.js` modificar las llamadas a `launchConfetti(n)`.

Privacidad y limitaciones

- Todo se guarda únicamente en el navegador donde se usa; no hay servidor ni intercambio de datos.
- La aplicación no protege contra usuarios que inspeccionen `localStorage` — tenlo en cuenta si quieres mantener secreto el resultado en la misma máquina.

Mejoras sugeridas

- Export/Import de asignaciones (JSON/CSV).
- Envío de notificaciones por correo (requiere backend).
- Música navideña opcional o selección de paletas.

Si quieres que haga alguna de las mejoras anteriores, dímelo y la implemento.

---

Hecho por AlejandroV69
