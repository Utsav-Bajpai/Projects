let currentSong = new Audio;
let songs;
let currFolder;
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    // Calculate minutes and seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Format as MM:SS
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);//this will stop the other tasks until its loaded
    let response = await a.text();//this will change upper doc into a html
    //after that we will parse through this dom to get all the songs
    let div = document.createElement("div")//this will craete a new div in html
    div.innerHTML = response;//and this step will paste all the html from response to inside div
    let as = div.getElementsByTagName("a");//we are doing this because all the songs are inside an 'a' tag
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];//now we will go through every 'a' tag of the list 'as'
        if (element.href.endsWith(".mp3")) {//this will check if the 'href' of an element ends with '.mp3' then put it in song array
            songs.push(element.href.split(`/${folder}/`)[1]);//we are also using .split in it to remove path attach in it //.split() function returns a array of substring so u can guess what's [1] is for
        }
    }

    //show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]//this will tarck down the ul in songList and put the li below, inside that ul
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="img/08_music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ").replace(".mp3", "")} </div>
                                <div>Utsav</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img src="img/05_play.svg" alt="">
                            </div></li>`;
    }

    //Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {//this will select the whole list item
        // console.log(e)
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trimEnd() + ".mp3")//if someone clicked any list item ones it will call playMusic which will start playing music

        })
    })

    return songs;

}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;//this will give it the address of audio track

    if (!pause) {//if some one click play button, pause will be turn true which was false by default
        currentSong.play();
        play.src = "img/09_pause.svg"
        currentSong.volume = 0.5;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 50;
    }
    // currentSong.pause()
    document.querySelector(".songinfo").innerHTML = decodeURI(track).replace(".mp3", "")
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"


}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`);//this will stop the other tasks until its loaded
    let response = await a.text();//this will change upper doc into a html
    //after that we will parse through this dom to get all the songs
    let div = document.createElement("div")//this will craete a new div in html
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").splice(-1)[0];//this is slightly different from herry
            console.log(folder);

            //get the meta data of the folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <img src="img/05_play.svg" alt="Play">
                        </div>
                        <img class="rounded" src="/songs/${folder}/cover.jpg"
                            alt="">
                        <h2>${response.title}</h2>
                        <p>${response.descriptions}</p>
                    </div>`;
            console.log(folder)
        }
    }
    // console.log(anchors);

    //Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log(item.currentTarget.dataset.folder)
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)//when we use item.target.dataset.folder in it it will return the tag like img, p etc. that's why we will use item.currentTarget.dataset.folder so that whenever clicked it will return forlder name such as ncs, Punjabi
            playMusic(songs[0]);
        })
    })

}

async function main() {
    //get the list of all the songs
    await getSongs("songs/Punjabi");//Get the list of all the songs
    playMusic(songs[0], true)

    //display all the albums on the page
    displayAlbums();


    //Attach an event listener to play
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/09_pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/05_play.svg";
        }
    })

    //listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {//The "timeupdate" event is fired by the HTMLMediaElement object whenever the "currentTime" property of the media is updated.
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";//this will move the circle
    })

    //add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";  //e.offsetX will return the position along x axis where cursor just clicked in seekbar and e.target.getBoundingClientRect().width will return the total width of seekbar
        currentSong.currentTime = (currentSong.duration * percent) / 100
    })

    //Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    //Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    //Add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause();
        // console.log(currentSong.src.split("/"));   //try these two out
        // console.log(currentSong.src.split("/").slice(2));
        currentSong.src.split("/").slice(-1)[0];//this part will return the address of song that is in songs
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= length) {
            playMusic(songs[index - 1]);
        } else {
            index = (songs.length) - 1;
            playMusic(songs[index]);
        }
    })


    //Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause();
        currentSong.src.split("/").slice(-1)[0];//this part will return the address of song that is in songs
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        } else {
            index = 0;
            playMusic(songs[index]);
        }
    })


    //Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log(e.target.value);
        currentSong.volume = parseInt(e.target.value) / 100; //here range of volume is 0 to 1
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("img/13_mute.svg", "img/12_volume.svg")
        } else if (currentSong.volume >= 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("img/12_volume.svg", "img/13_mute.svg")
        }
    })

    //add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("img/12_volume.svg")) {
            e.target.src = e.target.src.replace("img/12_volume.svg", "img/13_mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("img/13_mute.svg", "img/12_volume.svg")
            currentSong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })
}

main();