// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

var CLIENTID = "A07j1cpqUpv3gVwYN2V9tz4qqZZTkhhkVHrPmPTWhKT3G36e9Z1bGVsQ6YF_SAFA";
var accessToken = "access_token=9i5hcvW6rC2HvU4xfaSltzCRMsQ5nHWzo22wj6rXuBR1cFXgNLRF9zSKzMP_AlZX";
var APISong = "https://api.genius.com/songs/";
var APISearch = "https://api.genius.com/search?q=";
var APIReferent = "https://api.genius.com/referents?song_id=";
var xhr = new XMLHttpRequest();
var streak = 0;
var correctSong = 0;

//Format song title to input into api request
function formatSong(inputText) {
    var formattedSong = inputText;
    if (formattedSong.length > 20) {
        formattedSong = inputText.slice(0, 20);
    }
    formattedSong = encodeURI(formattedSong)
    return formattedSong;
}

//using the genius ID of song return a random lyric from the given song
function getLyric(songInput) {
    var songID = songInput['id'];
    xhr.open("GET", APIReferent + songID + "&" + accessToken, false); // false for synchronous request
    xhr.send(null);
    var referent = JSON.parse(xhr.responseText);
    referent = referent['response']['referents']
    if (Object.keys(referent).length == 0) {  //return 0 if there are not available lyrics to use
        return 0;
    } else {
        refLength = Object.keys(referent).length;
        var randLyric = Math.floor(Math.random() * refLength)
        lyric = referent[randLyric]['fragment'];
        if (lyric.charAt(0) == "[") { //lyrics starting with this character are not actual lyrics
            return 0;
        } else {
            return lyric;
        }
    }
}

//Choose a random song ang get a lyric from that song
function updateLyric() {
    correctSong = Math.ceil(Math.random() * 4);
    let i = 1;
    for (i; i <= 4; i++) {
        if (i == correctSong) {
            var songLyric = getLyric(songs[i - 1]);
            if (songLyric == 0) {
                console.log("finding new lyrics");
                updateLyric();  //call again if getLyric did not return a lyric
            } else {
                answerDetails(songs[i-1]);
                document.getElementById("lyric").innerHTML = '"' + songLyric + '"';
            }
        }
    }
}

//get all the details to the answer song for the answer section
function answerDetails(song) {
    var songID = song['id'];
    fetch(APISong + songID + "?" + accessToken)
        .then(function (response) {
            return response.json();
        }).then(function (data) {
            data = data['response']['song'];
            document.getElementById("songImage").innerHTML =
                "<img src=\"" + data['song_art_image_url'] + "\"alt=\"Some Awesome Album Art\"style =\"width:auto;height:auto;max-height:200px;max-width:200px;\">";
            document.getElementById("title").innerHTML = "Title: " + data['title_with_featured'];
            document.getElementById("artist").innerHTML = "Artist: " + data['primary_artist']['name'];
            if (data['album'] != null) {
                document.getElementById("album").innerHTML = "Album: " + data['album']['name'];
            } else {
                document.getElementById("album").innerHTML = null;
            }
            if (data['apple_music_id'] == null) {
                document.getElementById("player").innerHTML = null;
            } else {
                document.getElementById("player").innerHTML = "<iframe src=\"" + data['apple_music_player_url'] + "\"></iframe>";

            }
        }).catch(function (error) {
            // if there's an error, log it

            console.log(error);
        });

}

//check whether the user selected the correct song then act on it
function validateAnswer(element, answerNum) {
    let i = 1;
    for (i; i <= 4; i++) {
        document.getElementById("song" + i).disabled = true;
    }
    if (answerNum == correctSong) {
        element.style.backgroundColor = "green";
        streak++;
        document.getElementById("streak").innerHTML = "STREAK: " + streak;
    } else {
        element.style.backgroundColor = "red";
        document.getElementById("song" + correctSong).style.backgroundColor = "green";
        streak = 0;
        document.getElementById("streak").innerHTML = "STREAK: " + streak;
    }
    document.getElementById("answer").style.display = "block";
    document.getElementById("nextSong").disabled = false;
}

var song1;
var song2;
var song3;
var song4;

var songs = [song1, song2, song3, song4];

//search the genius api with the 4 given song titles and save the results to variables and display the titles
function searchSongs() {
    document.getElementById("songs").style.display = "none";
    document.getElementById("loader").style.display = "block";
    var songTitle1 = formatSong(document.getElementById("songList1").innerHTML);
    var songTitle2 = formatSong(document.getElementById("songList2").innerHTML);
    var songTitle3 = formatSong(document.getElementById("songList3").innerHTML);
    var songTitle4 = formatSong(document.getElementById("songList4").innerHTML);
    document.getElementById("lyric").innerHTML = null;
    document.getElementById("song1").innerHTML = null;
    document.getElementById("song2").innerHTML = null;
    document.getElementById("song3").innerHTML = null;
    document.getElementById("song4").innerHTML = null;
    Promise.all([
        fetch(APISearch + songTitle1 + "&" + accessToken),
        fetch(APISearch + songTitle2 + "&" + accessToken),
        fetch(APISearch + songTitle3 + "&" + accessToken),
        fetch(APISearch + songTitle4 + "&" + accessToken)
    ])
        .then(function (responses) {
            // Get a JSON object from each of the responses
            responses.forEach((song, index) => {
                process(song.json(), index);
            })
        })
        .catch(function (error) {
            // if there's an error, log it

            console.log(error);
        });
    let counter = 0;
    let process = (prom, songIndex) => {
        prom.then(data => {
            songs[songIndex] = data['response']['hits'][0]['result']
            if (songs[songIndex]['full_title'].length > 65) {
                let title = songs[songIndex]['full_title'].slice(0, 65);
                document.getElementById("song" + (songIndex + 1)).innerHTML = title + "...";
            } else {
                document.getElementById("song" + (songIndex + 1)).innerHTML = songs[songIndex]['full_title'];

            }
            counter++
            if (counter == 4) {
                document.getElementById("loader").style.display = "none";
                updateLyric();
                document.getElementById("songs").style.display = "block";
                counter = 0;
            }
        })

    }

}

//clear answers
function resetAnswers() {
    var i;
    for (i = 1; i <= 4; i++) {
        document.getElementById("song" + i).disabled = false;
        document.getElementById("song" + i).style.backgroundColor = "";
    }
}

//resets everything and calls the searchSong
function loadSongs() {
    document.getElementById("answer").style.display = "none";
    document.getElementById("nextSong").disabled = true;
    resetAnswers();
    searchSongs();
    refreshSongList();

}

loadSongs();







