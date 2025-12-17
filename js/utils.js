// Funcion para convertir la duracio en Minutos:Segundos
function convertDuration(totalSeconds){

    const hours = Math.floor(totalSeconds/3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds%60;

    const ss = String(seconds).padStart(2, "0");

    if (hours > 0){

        const mm = String(minutes).padStart(2, "0");
        return `${hours}:${mm}:${ss}`;

    } else {
        return `${minutes}:${ss}`;
    }
}

// Funcion para actualizar el estilo de los album-songs
function updateAlbumSongVisuals(songId) {
    const songEl = document.querySelector(`.album-song[data-id="${songId}"]`);
    if (!songEl) return;

    const inSetlist = state.setlist.some(song => song.id === songId);

    // Clase e icono siempre reflejan el estado real
    songEl.classList.toggle("album-song-selected", inSetlist);

    const icon = songEl.querySelector("img");
    if (icon) {
        icon.src = inSetlist ? "icons/x.svg" : "icons/+.svg";
    }
}

function syncAlbumSelections() {
  const ids = new Set(state.setlist.map(s => s.id));
  document.querySelectorAll('.album-song').forEach(el => {
    const id = el.dataset.id;
    const selected = ids.has(id);
    el.classList.toggle('album-song-selected', selected);
    const icon = el.querySelector('img');
    if (icon) icon.src = selected ? 'icons/x.svg' : 'icons/+.svg';
  });
}

// Carga la imagen para que la pueda poner en el pdf
async function loadImageAsBase64(url) {
  const res = await fetch(url);
  const blob = await res.blob();

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

// Exportacion en PDF
async function exportSetlistToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const setlist = state.savedSetlists.find(
        s => s.id === state.currentSetlistId
    );

    if (!setlist) return;

    let y = 5;
    const pageWidth = doc.internal.pageSize.getWidth()/2;

    // Foto
    const foto = await loadImageAsBase64("img/ekyrian-logo.png");
    doc.addImage(foto, (pageWidth+10)/2, y, 89, 40);
    y += 55;

    // Título
    doc.setFont("times", "bold");
    doc.setFontSize(40);
    doc.text(setlist.name, pageWidth, y, {align: "center"});
    y += 8;

    // Info
    doc.setFontSize(20);
    doc.text(`${convertDuration(calculateDuration())} - ${setlist.songs.length} canciones`, pageWidth, y, {align: "center"});
    y += 15;

    // Lista de canciones
    doc.setFontSize(30);

    setlist.songs.forEach((song, index) => {
        const text = `${index + 1}. ${song.name} (${convertDuration(song.duration)})`;
        doc.text(text, pageWidth, y, {align: "center"});
        y += 15;

        // Salto de página automático
        if (y > 280) {
            doc.addPage();
            y = 20;
        }
    });

    // Descargar
    doc.save(`${setlist.name || "setlist"}.pdf`);
}

// SortableJS
let sortableSetlist = null;
let startX = 0;
let deleteMode = false;
let moveListener = null;
let lastDragEndedAt = 0;

function initSetlistSortable() {
  const setlistContainer = document.getElementById("setlist");
  if (!setlistContainer) return;

  if (sortableSetlist) {
    sortableSetlist.destroy();
  }

  sortableSetlist = new Sortable(setlistContainer, {
    animation: 150,
    swapThreshold: 0.6,
    ghostClass: "ghost",
    forceFallback: true,

    onStart: (evt) => {
      const oe = evt.originalEvent;
      startX = (oe?.touches?.[0]?.clientX ?? oe?.clientX ?? 0);
      deleteMode = false;

      moveListener = (e) => {
        e.preventDefault?.();
        const currentX = e.touches?.[0]?.clientX ?? e.clientX ?? startX;
        const deltaX = Math.abs(currentX - startX);
        deleteMode = deltaX > 200;
        evt.item.classList.toggle("delete-preview", deleteMode);
      };

      document.addEventListener("mousemove", moveListener, { passive: false });
      document.addEventListener("touchmove", moveListener, { passive: false });
    },

    onEnd: (evt) => {
      if (moveListener) {
        document.removeEventListener("mousemove", moveListener);
        document.removeEventListener("touchmove", moveListener);
        moveListener = null;
      }
      evt.item?.classList?.remove("delete-preview");

      const oe = evt.originalEvent;
      const endX = (oe?.changedTouches?.[0]?.clientX ?? oe?.clientX ?? startX);
      const finalDeltaX = Math.abs(endX - startX);
      const shouldDelete = deleteMode || finalDeltaX > 200;

      if (shouldDelete) {
        deleteSong(evt.oldIndex);
      } else {
        reorderSong(evt.oldIndex, evt.newIndex);
      }

      lastDragEndedAt = Date.now();
      deleteMode = false;
    }
  });
}

function reorderSong(oldIndex, newIndex) {
  if (oldIndex === newIndex) return;

  const song = state.setlist.splice(oldIndex, 1)[0];
  state.setlist.splice(newIndex, 0, song);

  renderSetlist();
  renderSetlistInfo();
  saveSetlists();

  requestAnimationFrame(() => syncAlbumSelections());
}


function deleteSong(index) {
    const song = state.setlist[index];
    if (!song) return;

    state.setlist.splice(index, 1);

    renderSetlist();
    renderSetlistInfo();
    renderSavedSetlists();
    scheduleAutoSave();

    requestAnimationFrame(() => syncAlbumSelections());
}

function getClientX(evt) {
    return evt.originalEvent?.clientX ??
           evt.originalEvent?.touches?.[0]?.clientX ??
           0;
}

function updateAlbumSongClass(songId) {

    const songEl = document.querySelector(`.album-song[data-id="${songId}"]`);
    if (!songEl) return;

    const inSetlist = state.setlist.some(song => song.id === songId);

    songEl.classList.toggle("album-song-selected", inSetlist);

    songEl
}
