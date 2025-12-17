// Devuelve el objeto de song segun su id
function getSongById(songId){

    for (const album of state.albums){
        for (const song of album.songs){
            if (song.id === songId){
                return song;
            }
        }
    }
    return undefined;
}

// Hace toggle en la setlist de la cancion segun su id
function toggleSong(songId){
    const index = state.setlist.findIndex(song => song.id === songId);
   
    if (index !== -1){
        state.setlist.splice(index, 1);
    } else {
        const song = getSongById(songId);
        if (song){
            state.setlist.push(song);
        }
    }

    renderSetlist();
    renderSetlistInfo();
    renderSavedSetlists();
    scheduleAutoSave();
}

// Devuelve la duracion de la setlist
function calculateDuration(){
    return state.setlist.reduce((total, song) => total + song.duration, 0);
}

// Devuelve el objeto album que contenga la cancion segun su id
function getSongAlbum(songId){

    return state.albums.find( album =>

        album.songs.some(song => song.id === songId)

    );

}

// Funcionalidad de renombrar la setlist
const setlistNewName = document.getElementById("setlistActualNombre")

function placeCaretAtEnd(el) {
    const range = document.createRange();
    const sel = window.getSelection();

    range.selectNodeContents(el);
    range.collapse(false);

    sel.removeAllRanges();
    sel.addRange(range);
}

setlistNewName.addEventListener("click", () => {
    setlistNewName.contentEditable = "true";
    setlistNewName.focus();
});

setlistNewName.addEventListener("input", () => {
    if (setlistNewName.textContent.length > 30 ) {

        setlistNewName.textContent = setlistNewName.textContent.slice(0, 30);

        placeCaretAtEnd(setlistNewName);

    }
})

setlistNewName.addEventListener("blur", () => {
    setlistNewName.contentEditable = "false";

    const newName = setlistNewName.textContent.trim();

    const currentSetlist = state.savedSetlists.find(setlist => {
        return setlist.id === state.currentSetlistId
    });

    if (!currentSetlist) return;

    currentSetlist.name = newName;

    scheduleAutoSave();
    renderSavedSetlists();
});

setlistNewName.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        setlistNewName.blur();
    }
});

// Sistema de guardado de setlists
const STORAGE_KEY = "savedSetlists";

function loadSetlists() {
    const data = localStorage.getItem(STORAGE_KEY);
    state.savedSetlists = data ? JSON.parse(data) : [];
}

function saveSetlists() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.savedSetlists));
}

let saveTimeout = null;
function scheduleAutoSave() {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        saveSetlists();
    }, 500);
}

function createSetlist(name = "Nueva Setlist") {
  const newSetlist = {
    id: crypto.randomUUID(),
    name,
    songs: []
  };

  state.savedSetlists.push(newSetlist);
  state.currentSetlistId = newSetlist.id;
  state.setlist = [];

  selectLastSetlist();

  saveSetlists();
  renderSavedSetlists();
  renderAlbums();
}

function deleteSetlist(id){
    
    state.savedSetlists = state.savedSetlists.filter(setlist => setlist.id !== id);

    if (state.savedSetlists.length === 0) ensureAtLeastOneSetlist();

    saveSetlists();
    selectFirstSetlist();
    renderSavedSetlists();
    renderAlbums();
}

function selectSetlist(id){

    state.currentSetlistId = id;

    const setlist = state.savedSetlists.find(setlist => setlist.id === id);

    if (!setlist) return;

    state.setlist = setlist.songs;
    state.setlistName = setlist.name;

    renderSetlist();
    renderSetlistName();
    renderSetlistInfo();

    // Colorea la setlist que este seleccionada
    const allSetlistCards = document.querySelectorAll(".saved-setlist")
    allSetlistCards.forEach(card => {
        if (card.dataset.id === String(setlist.id)){
            card.classList.add("selected");
        }   else {
            card.classList.remove("selected");
        }
    });
}

function ensureAtLeastOneSetlist() {

    if (state.savedSetlists.length === 0) {
        state.savedSetlists.push(createEmptySetlist());
        saveSetlists();
    }

}

function createEmptySetlist() {
    return {
        id: crypto.randomUUID(),
        name: "Nueva Setlist",
        songs: [],
    };
}

function selectFirstSetlist() {
    if (state.savedSetlists.length === 0) return;

    const firstSetlist = state.savedSetlists[0];
    selectSetlist(firstSetlist.id);
}

function selectLastSetlist() {
    if (state.savedSetlists.length === 0) return;

    const lastSetlist = state.savedSetlists[state.savedSetlists.length -1];
    selectSetlist(lastSetlist.id);
}

function saveAllSetlists() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.savedSetlists));
}

// Carga los albums en el state
async function loadAlbums() {
    try {
        const res = await fetch("discos.json");
        const datos = await res.json();
        state.albums = datos.albums;
    } catch (err) {
        console.error("Error al cargar los discos:", err);
        state.albums = [];
    }
}