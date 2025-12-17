// Renderiza la setlist
function renderSetlist() {

    const setlistHTML = document.getElementById("setlist");
    setlistHTML.innerHTML = "";

    state.setlist.forEach((song, index) => {

        // contenedor principal
        let div = document.createElement("div");
        div.classList.add("songSetlist-card");
        div.dataset.id = String(song.id);

        // imagen
        let img = document.createElement("img");
        img.src = `img/${getSongAlbum(song.id).id}.png`
        div.appendChild(img);

        // nombre + duración
        let div1 = document.createElement("div");
        let p = document.createElement("p");
        p.innerHTML = `${song.name}<br>${convertDuration(song.duration)}`;
        div1.appendChild(p);
        div.appendChild(div1);

        // track id
        let div2 = document.createElement("div");
        div2.classList.add("trackId");
        let span = document.createElement("span");
        span.textContent = index + 1;  // número en la setlist
        div2.appendChild(span);
        div.appendChild(div2);

        setlistHTML.appendChild(div);
    });

initSetlistSortable();

}

// Renderiza el nombre de la setlist
function renderSetlistName(){
    const setlistActualNombre = document.getElementById("setlistActualNombre");
    setlistActualNombre.innerHTML = state.setlistName;
}

// Renderiza la info de la setlist
function renderSetlistInfo(){
    let container = document.getElementById("setlistActualInfo");
    container.innerHTML = `${convertDuration(calculateDuration())} - ${state.setlist.length} canciones`
}

// Renderiza la duracion de la setlist
function renderSetlistDuration(){

    const durationContainer = document.getElementById("setlistDuration");
    durationContainer.innerHTML = "";
        
    durationContainer.innerHTML = convertDuration(calculateDuration());

}

// Funcion para renderizar todos los albums
function renderAlbums() {

    const container = document.getElementById("albums");
    container.innerHTML = "";

    state.albums.forEach(album => {
        
        //Creo el elementro album-card
        let albumCard = document.createElement("div");
        albumCard.classList.add("album-card");

        albumCard.addEventListener("click", () => {

            albumSongs.classList.toggle("open");

            dropImg.src = albumSongs.classList.contains("open")
                ? "icons/dropOpen.svg"
                : "icons/dropClosed.svg";
        });


        //Creo y relleno con sus elementos el elemento album-header
        let albumHeader = document.createElement("div");
        albumHeader.classList.add("album-header");

        let albumCover = document.createElement("img");
        albumCover.classList.add("albumCover");
        albumCover.src = `img/${album.id}.png`;
        albumHeader.appendChild(albumCover);

        let divInfo = document.createElement("div");
        divInfo.innerHTML = `<p><span>${album.name}</span><br>
                            ${album.year}<br>
                            ${album.songs.length} canciones</p>`
        albumHeader.appendChild(divInfo);

        let dropImg = document.createElement("img");
        dropImg.classList.add("albumIcon");
        dropImg.src = "icons/dropClosed.svg";
        albumHeader.appendChild(dropImg);

        //Añado album-header a album-card
        albumCard.appendChild(albumHeader);

        let albumSongs = document.createElement("div")
        albumSongs.classList.add("album-songs");

        //Creo los elementos album-song y los meto en album-songs
        renderAlbumSongs(album, albumSongs);

        albumCard.appendChild(albumSongs);

        container.appendChild(albumCard);
    });
}

function renderAlbumSongs(album, albumSongs) {

    // Limpia el container
    while (albumSongs.firstChild) {
        albumSongs.removeChild(albumSongs.firstChild);
    }

    // Creo los elementos song y el padding
    let divPadding = document.createElement("div");
    divPadding.style.marginTop = "5px";
    albumSongs.appendChild(divPadding);

    album.songs.forEach((song, index)=>{

            let albumSong = document.createElement("div");
            albumSong.classList.add("album-song");
            albumSong.dataset.id = String(song.id);
            
            albumSong.innerHTML = `<span>${index + 1}</span>
                                    <span>${song.name}</span>
                                    <span>${convertDuration(song.duration)}</span>
                                    <img src="icons/+.svg">`

            const inSetlist = state.setlist.some(s =>
                s.id === song.id
            );

            if (inSetlist){
                albumSong.classList.add("album-song-selected");
                albumSong.querySelector("img").src = "icons/x.svg";
            }
            
            albumSong.addEventListener("click", (e) => {

                if (Date.now() - lastDragEndedAt < 200) {
                e.preventDefault();
                e.stopPropagation();
                return;
                }

                e.stopPropagation();
                toggleSong(song.id);
                updateAlbumSongVisuals(song.id);
                renderSetlist();
                renderSetlistInfo();
            });


            albumSong.addEventListener("songRemoved", (e) => {
                const songId = e.detail.songId;
                // Solo actualiza el DOM según estado
                updateAlbumSongVisuals(songId);
            });

            albumSongs.appendChild(albumSong);

        })
}

// Renderizar las setlist guardadas
function renderSavedSetlists(){
    const container = document.getElementById("savedSetlists");
    container.innerHTML = "";

    state.savedSetlists.forEach((setlist, index) => {

        const totalDuration = setlist.songs.reduce(
            (acc, song) => acc + song.duration,
            0
        );

        let savedSetlist = document.createElement("div");
        savedSetlist.classList.add("saved-setlist");
        if (setlist.id === state.currentSetlistId) savedSetlist.classList.add("selected");

        savedSetlist.dataset.id = setlist.id;

        let div = document.createElement("div");
        div.innerHTML = `<p>${setlist.name}<br>
                        ${setlist.songs.length} canciones<br>
                        ${convertDuration(totalDuration)}</p>`

        savedSetlist.addEventListener("click", () => {
            selectSetlist(savedSetlist.dataset.id);
            renderAlbums();
            renderSavedSetlists();
            renderSetlist();
            renderSetlistName();
            renderSetlistInfo();
        })

        savedSetlist.appendChild(div);

        let img = document.createElement("img");
        img.src = "icons/x.svg";
        savedSetlist.appendChild(img);

        img.addEventListener("click", (e) => {
            e.stopPropagation();
            deleteSetlist(savedSetlist.dataset.id);
            console.log("boton borrar pulsado");
        })

        container.appendChild(savedSetlist);

    })
}