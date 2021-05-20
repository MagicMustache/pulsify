import './App.css';
import Camera from "./components/Camera";
import React, {useEffect, useState} from 'react';
import {Scopes, SpotifyAuth} from 'react-spotify-auth'
import Axios from "axios"
import Cookies from 'js-cookie'
import SpotifyWebApi from "spotify-web-api-js";
import SpotifyPlayer from 'react-spotify-web-playback';
import Playlist from "./components/Playlist";
import $ from "jquery";

function App() {
    const token = Cookies.get('spotifyAuthToken')
    const [userId, setUserId] = useState("")
    const [userPlaylists, setPlaylists] = useState([])
    const [startCam, setStartCam] = useState(false)
    const [chosenPlaylist, setChosenPlaylist] = useState("")
    const [bpm, setBpm] = useState(75) //75 is our arbitrary average value of bpm (as it goes between 60-100)
    const [tempo, setTempo] = useState(116) //the tempo used to find a song, calculated using bpm -> 116 = average value
    const [tempos, setTempos] = useState({}) //array of all songs tempo in the playlist
    const [trackToPlay, setTrackToPlay] = useState("")

    const spotifyApi = new SpotifyWebApi()

    let lastTackChangeBPM = 75 //to check the delta bpm

    useEffect(() => {
        getUserID()
    }, [])

    useEffect(() => {
        if (chosenPlaylist !== "") {
            getTempos(chosenPlaylist)
        }
    }, [chosenPlaylist])

    useEffect(() => {
        if (chosenPlaylist !== "") {
            chooseCorrectTrack()
        }
    }, [tempo])

    useEffect(() => {
        if (chosenPlaylist !== "" && !chooseCorrectTrack()) {
            chooseCorrectTrack()
        }
    }, [bpm])

    useEffect(() => {
        const interval = setInterval(() => {
            Axios.get("http://localhost:3001/bpm").then((res)=>{
                console.log("current bpm : "+res.data)
                let currentBpm = parseInt(res.data)
                setBpm(currentBpm)
                deltaBpm(currentBpm)
            })
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    if (token) {
        spotifyApi.setAccessToken(token)
        if (chosenPlaylist !== "") {
            $("#playlistsModal").modal("hide")
            console.log("chosen playlist " + chosenPlaylist)
        }
        const Input = () => {
            const handleKeyDown = (event) => {
                if (event.key === 'Enter') {
                    setBpm(event.target.value)
                    deltaBpm(event.target.value)
                }
            }
            return (
                <div className={"input-group align-self-center"} style={{width: "20%"}}>
                    <div className="input-group-prepend">
                        <span className="input-group-text" id="basic-addon1">BPM</span>
                    </div>
                    <input type={"number"} className={"form-control"} placeholder={""} onKeyDown={handleKeyDown}/>
                </div>
            )
        }


        return (
            <div className={"container"} style={{}}>
                <h1 className={"text-center"}>Pulsify</h1>
                <div className={"d-flex flex-column"}>
                    {startCam ? (<Camera/>) : null}
                    <div className={"d-flex d-flex-column justify-content-center"}>
                        <h3>You are connected as "{userId}" on Spotify{"\n"}</h3>
                    </div>
                    <div className={"d-flex d-flex-row justify-content-center"}>
                        <button className={"btn btn-info"} onClick={() => getUserPlaylists()} data-toggle="modal"
                                data-target="#playlistsModal">
                            Choose a playlist
                        </button>
                        <button className={"btn btn-danger"} onClick={() => clearCookies()}
                                style={{marginLeft: "2em"}}>
                            Clear Cookies
                        </button>
                        <button className={"btn btn-primary"} onClick={() => setStartCam(!startCam)}
                                style={{marginLeft: "2em"}}>
                            Show Webcam
                        </button>
                    </div>
                    <br/>
                    {trackToPlay ? (
                        <SpotifyPlayer token={token} uris={['spotify:track:' + trackToPlay]} play={true} initialVolume={50} magnifySliderOnHover={true}
                                       styles={{
                                           activeColor: '#fff',
                                           bgColor: '#333',
                                           color: '#fff',
                                           loaderColor: '#fff',
                                           sliderColor: '#1cb954',
                                           trackArtistColor: '#ccc',
                                           trackNameColor: '#fff',
                                       }}/>) : null}
                    <br/>
                    {Input()}
                    <br/>
                    <p className={"align-self-center"}>Your current bpm is : {bpm}</p>
                    <p className={"align-self-center"}>The corresponding tempo is : {tempo}</p>
                    <div className="modal fade " id="playlistsModal" tabIndex="-1" role="dialog"
                         aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="exampleModalLabel">Choose a playlist</h5>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body align-content-center">
                                    {userPlaylists ? generatePlaylistsComponents(userPlaylists) : "error"}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        );
    } else {
        return (
            <div className={"container text-center"} style={{ marginTop:"25%"}}>
                <SpotifyAuth
                    redirectUri='http://localhost:3000'
                    clientID='dd7a0938872c4219b6b83bbe40cb5404'
                    showDialog={true}
                    noLogo={true}
                    scopes={[Scopes.userReadPrivate, Scopes.playlistReadPrivate, Scopes.playlistReadCollaborative,
                        Scopes.streaming, Scopes.userReadEmail, Scopes.userLibraryRead, Scopes.userLibraryModify, Scopes.userReadPlaybackState, Scopes.userModifyPlaybackState]}/>
            </div>
        )
    }

    function ruleOfThree(bpm){
        let tempo = Math.round(bpm*(116/75)) //bpm * average song tempo / arbitrary average rest heart rate (cause average is between 60-100)
        console.log("current tempo is: " + tempo)
        setTempo(tempo)
    }

    function deltaBpm(bpm){
        if (Math.abs(lastTackChangeBPM - bpm) >= 10){
            ruleOfThree(bpm)
        }
    }

    function clearCookies() {
        Cookies.remove("spotifyAuthToken")
        window.location.reload()
    }

    function getUserID() {
        Axios.get("https://api.spotify.com/v1/me", {
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        }).then(r => {
            console.log("user id: " + r.data.id)
            setUserId(r.data.id)
        })
    }

    function getUserPlaylists() {
        spotifyApi.getUserPlaylists(userId).then((res) => {
            setPlaylists(res.items)
        })
    }

    function generatePlaylistsComponents(playlists) {
        return playlists.map((playlist =>
                <Playlist key={playlist.id} playlist={playlist} choice={setChosenPlaylist}
                          getChoice={choice => setChosenPlaylist(choice)}/>
        ))
    }

    function getTempos(playlist) {
        let tempos = {}
        let tracksID = []
        spotifyApi.getPlaylist(playlist).then((res) => {
            if (res.tracks.items !== undefined) {
                res.tracks.items.forEach((song) => {
                    tracksID.push(song.track.id)
                })
                spotifyApi.getAudioFeaturesForTracks(tracksID).then((audioFeatures => {
                    audioFeatures.audio_features.forEach((feature) => {
                        tempos[feature.id] = feature.tempo
                    })
                    console.log(Object.keys(tempos).length)
                    setTempos(tempos)
                    console.log(Object.keys(tempos).length)
                }))
            }
        })
    }

    function chooseCorrectTrack() {
        console.log("tempos size " + Object.keys(tempos).length)
        let temposToGetClosest = []
        for (const [key, value] of Object.entries(tempos)) {
            temposToGetClosest.push(Math.round(Number(value)))
        }
        const closestSong = temposToGetClosest.sort((a, b) => {
            return Math.abs(tempo - a) - Math.abs(tempo - b);
        })
        for (const [key, value] of Object.entries(tempos)) {
            if (Math.round(Number(value)) === closestSong[0]) {
                console.log("new track to play : " + key)
                setTrackToPlay(key)
                return;
            }
        }
        console.log("could not find track to play")

    }

}


export default App;
