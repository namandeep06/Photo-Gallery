(function () {
    let saveAlbum = document.querySelector("#saveAlbum");
    let addAlbum = document.querySelector("#addAlbum");
    let removeAlbum = document.querySelector("#removeAlbum");
    let importAlbum = document.querySelector("#importAlbum");
    let exportAlbum = document.querySelector("#exportAlbum");
    let playAlbum = document.querySelector("#playAlbum");
    let selectAlbum = document.querySelector("#selectAlbum");
    let allTemplates = document.querySelector("#allTemplates");
    let overlay = document.querySelector("#overlay");
    let playOverlay = document.querySelector("#play-overlay");
    let contentMainOverlay = document.querySelector("#content-main-overlay");
    let newSlide = document.querySelector("#new-slide");
    let createSlide = document.querySelector("#create-slide");
    let showSlide = document.querySelector("#show-slide");
    let btnSaveSlide = document.querySelector("#btnSaveSlide");
    let txtSlideUrl = document.querySelector("#txtSlideUrl");
    let txtSlideTitle = document.querySelector("#txtSlideTitle");
    let txtSlideDesc = document.querySelector("#txtSlideDesc");
    let slideList = document.querySelector("#slide-list");
    let uploadFile = document.querySelector("#uploadFile");

    let albums = [];

    addAlbum.addEventListener("click", handleAddAlbum);
    selectAlbum.addEventListener("change", handleSelectAlbum);
    newSlide.addEventListener("click", handleNewSlideClick);
    btnSaveSlide.addEventListener("click", handleSaveSlide);
    saveAlbum.addEventListener("click", saveToLocalStorage);
    removeAlbum.addEventListener("click", handleRemoveAlbum);
    exportAlbum.addEventListener("click", handleExportAlbum);
    importAlbum.addEventListener("click", handleImportAlbum);
    uploadFile.addEventListener("change", handleUploadFile);
    playAlbum.addEventListener("click", handlePlayAlbum);

    function handleAddAlbum() {
        let albumName = prompt("Enter a name for the new album");
        if (albumName == null) {
            return;
        }
        albumName = albumName.trim();
        if (!albumName) {
            alert("Empty name is not allowed");
            return;
        }
        let exists = albums.some(a => a.name == albumName);
        if (exists) {
            alert(albumName + " already exists. Try some other name");
            return;
        }
        //this code adds the album in album array
        let album = {
            name: albumName,
            selected: false,
            slides: []
        };
        albums.push(album);
        //this code adds album in dropdown.
        let optionTemplate = allTemplates.content.querySelector("[purpose=new-album]");
        //clone
        let newAlbumOption = document.importNode(optionTemplate, true);
        newAlbumOption.setAttribute("value", albumName);
        newAlbumOption.innerHTML = albumName;
        selectAlbum.appendChild(newAlbumOption);
        //auto-selection
        selectAlbum.value = albumName;
        selectAlbum.dispatchEvent(new Event("change"));

    }

    function handleSelectAlbum() {
        if (this.value == -1) {
            overlay.style.display = "block";
            contentMainOverlay.style.display = "none";
            //jab new album add kare to create a slide pichli ka nahi dikhna chaiye
            createSlide.style.display = "none";
            showSlide.style.display = "none";

        } else {
            overlay.style.display = "none";
            contentMainOverlay.style.display = "block";
            createSlide.style.display = "none";
            showSlide.style.display = "none";

            let album = albums.find(a => a.name == selectAlbum.value);
            // we aim that when we select a album its previous data(slides) should be displayed..
            //slide list k andar ka loop
            slideList.innerHTML = "";
            for (let i = 0; i < album.slides.length; i++) {
                let slideTemplate = allTemplates.content.querySelector(".slide");
                let slide = document.importNode(slideTemplate, true);

                slide.querySelector(".title").innerHTML = album.slides[i].title;
                slide.querySelector(".desc").innerHTML = album.slides[i].desc;
                slide.querySelector("img").setAttribute("src", album.slides[i].url);
                slide.addEventListener("click", handleSlideClick);

                album.slides[i].selected = false;

                slideList.append(slide);
            }
        }
    }

    function handleRemoveAlbum() {
        if (selectAlbum.value == "-1") {
            alert("Select an album to be deleted");
            return;
        }
        let aidx = albums.findIndex(a => a.name == selectAlbum.value);
        albums.splice(aidx, 1);

        selectAlbum.remove(selectAlbum.selectedIndex);

        selectAlbum.value = "-1";
        selectAlbum.dispatchEvent(new Event("change"));
    }

    function handleExportAlbum() {
        if (selectAlbum.value == "-1") {
            alert("Select an album to export");
            return;
        }

        let album = albums.find(a => a.name == selectAlbum.value);
        let ajson = JSON.stringify(album);
        let encodedJson = encodeURIComponent(ajson);

        let a = document.createElement("a");
        a.setAttribute("download", album.name + ".json");
        a.setAttribute("href", "data:text/json; charset=utf-8, " + encodedJson);

        a.click();
    }

    function handleNewSlideClick() {
        overlay.style.display = "none";
        contentMainOverlay.style.display = "none";
        createSlide.style.display = "block";
        showSlide.style.display = "none";
        //when we click on new slide previous slide data should be vanished..
        txtSlideUrl.value = "";
        txtSlideTitle.value = "";
        txtSlideDesc.value = "";
        btnSaveSlide.setAttribute("purpose", "create");
    }

    function handleImportAlbum() {
        uploadFile.click();
    }

    function handleUploadFile() {
        if (selectAlbum.value == "-1") {
            alert("Select an album to import data");
            return;
        }

        let file = window.event.target.files[0];
        let reader = new FileReader();
        reader.addEventListener("load", function () {
            let data = window.event.target.result;
            let importedAlbum = JSON.parse(data);

            let album = albums.find(a => a.name == selectAlbum.value);
            album.slides = album.slides.concat(importedAlbum.slides);

            slideList.innerHTML = "";
            for (let i = 0; i < album.slides.length; i++) {
                let slideTemplate = allTemplates.content.querySelector(".slide");
                let slide = document.importNode(slideTemplate, true);

                slide.querySelector(".title").innerHTML = album.slides[i].title;
                slide.querySelector(".desc").innerHTML = album.slides[i].desc;
                slide.querySelector("img").setAttribute("src", album.slides[i].url);
                slide.addEventListener("click", handleSlideClick);

                album.slides[i].selected = false;

                slideList.append(slide);
            }
        });

        reader.readAsText(file);
    }

    function handlePlayAlbum() {
        if (selectAlbum.value == "-1") {
            alert("Select an album to play");
            return;
        }

        playOverlay.style.display = "block";
        playOverlay.querySelector(".play-text-overlay").innerHTML = "Playing Album..";

        let album = albums.find(a => a.name == selectAlbum.value);
        let i = 0;
        let id = setInterval(function () {
            if (i < album.slides.length) {
                slideList.children[i].click();
                playOverlay.querySelector(".play-text-overlay").innerHTML = "Showing slide " + (i + 1);
                i++;
            } else if (i == album.slides.length) {
                clearInterval(id);
                playOverlay.style.display = "none";
            }
        }, 1000);
    }

    function handleSaveSlide() {

        let url = txtSlideUrl.value;
        let title = txtSlideTitle.value;
        let desc = txtSlideDesc.value;

        if (this.getAttribute("purpose") == "create") {
            let slideTemplate = allTemplates.content.querySelector(".slide");
            let slide = document.importNode(slideTemplate, true);

            slide.querySelector(".title").innerHTML = title;
            slide.querySelector(".desc").innerHTML = desc;
            slide.querySelector("img").setAttribute("src", url);
            slide.addEventListener("click", handleSlideClick);
            slideList.append(slide);

            let album = albums.find(a => a.name == selectAlbum.value);
            album.slides.push({
                title: title,
                url: url,
                desc: desc
            });
            //after appending immediately dispatch event of click
            slide.dispatchEvent(new Event("click"));
        } else {
            let album = albums.find(a => a.name == selectAlbum.value);
            let slideToUpdate = album.slides.find(s => s.selected == true);
            let slideDivToUpdate;
            for (let i = 0; i < slideList.children.length; i++) {
                let slideDiv = slideList.children[i];
                if (slideDiv.querySelector(".title").innerHTML == slideToUpdate.title) {
                    slideDivToUpdate = slideDiv;
                    break;
                }
            }
            slideDivToUpdate.querySelector(".title").innerHTML = title;
            slideDivToUpdate.querySelector(".desc").innerHTML = desc;
            slideDivToUpdate.querySelector("img").setAttribute("src", url);

            slideToUpdate.url = url;
            slideToUpdate.title = title;
            slideToUpdate.desc = desc;

            slideDivToUpdate.dispatchEvent(new Event("click"));
        }


    }

    function handleSlideClick() {
        overlay.style.display = "none";
        contentMainOverlay.style.display = "none";
        createSlide.style.display = "none";
        showSlide.style.display = "block";
        //show slide vali jagah par agar pehle se kch pda h to usko khali kardoo
        showSlide.innerHTML = "";
        //clone of slide in view template
        let slideInViewTemplate = allTemplates.content.querySelector(".slide-in-view");
        let slideInView = document.importNode(slideInViewTemplate, true);
        //"this" denotes the current slide which is selected
        slideInView.querySelector(".title").innerHTML = this.querySelector(".title").innerHTML;
        slideInView.querySelector(".desc").innerHTML = this.querySelector(".desc").innerHTML;
        slideInView.querySelector("img").setAttribute("src", this.querySelector("img").getAttribute("src"));
        slideInView.querySelector("[purpose=edit]").addEventListener("click", handleEditSlideClick);
        slideInView.querySelector("[purpose=delete]").addEventListener("click", handleDeleteSlideClick);
        showSlide.append(slideInView);

        let album = albums.find(a => a.name == selectAlbum.value);
        for (let i = 0; i < album.slides.length; i++) {
            if (album.slides[i].title == this.querySelector(".title").innerHTML) {
                album.slides[i].selected = true;
            } else {
                album.slides[i].selected = false;
            }
        }
    }

    function handleEditSlideClick() {
        overlay.style.display = "none";
        contentMainOverlay.style.display = "none";
        createSlide.style.display = "block";
        showSlide.style.display = "none";

        let album = albums.find(a => a.name == selectAlbum.value);
        //slide whose selected is true
        let slide = album.slides.find(s => s.selected == true);

        txtSlideUrl.value = slide.url;
        txtSlideTitle.value = slide.title;
        txtSlideDesc.value = slide.desc;

        btnSaveSlide.setAttribute("purpose", "update");
    }

    function handleDeleteSlideClick() {

        let album = albums.find(a => a.name == selectAlbum.value);
        let sidx = album.slides.findIndex(s => s.selected == true);
        console.log(album, sidx);

        let slideDivTBD;
        for (let i = 0; i < slideList.children.length; i++) {
            let slideDiv = slideList.children[i];
            // console.log(album.slides[sidx]);
            if (slideDiv.querySelector(".title").innerHTML == album.slides[sidx].title) {
                slideDivTBD = slideDiv;
                break;
            }
        }

        slideList.removeChild(slideDivTBD);

        album.slides.splice(sidx, 1);

        overlay.style.display = "none";
        contentMainOverlay.style.display = "block";
        createSlide.style.display = "none";
        showSlide.style.display = "none";

    }

    function saveToLocalStorage() {
        let json = JSON.stringify(albums); // used to convert jso to a json string which can be saved
        localStorage.setItem("data", json);
    }

    function loadFromLocalStorage() {
        let json = localStorage.getItem("data");
        if (!json) {
            return;
        }

        albums = JSON.parse(json);
        for (let i = 0; i < albums.length; i++) {
            let optionTemplate = allTemplates.content.querySelector("[purpose=new-album]");
            let newAlbumOption = document.importNode(optionTemplate, true);

            newAlbumOption.setAttribute("value", albums[i].name);
            newAlbumOption.innerHTML = albums[i].name;
            selectAlbum.appendChild(newAlbumOption);
        }

        selectAlbum.value = "-1";
    }

    loadFromLocalStorage();
})();