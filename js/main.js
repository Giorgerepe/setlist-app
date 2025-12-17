async function initApp() {

    await loadAlbums(); 
    loadSetlists();

    ensureAtLeastOneSetlist();
    selectFirstSetlist();

    renderAlbums();
    renderSavedSetlists();
    renderSetlist();
    renderSetlistName();
    renderSetlistInfo();
}

initApp();
