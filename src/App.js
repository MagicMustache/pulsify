import './App.css';
import Camera from "./components/Camera";
import React, {useEffect, useRef, useState} from 'react';
import {Scopes, SpotifyAuth} from 'react-spotify-auth'
import Axios from "axios"
import Cookies from 'js-cookie'
import SpotifyWebApi from "spotify-web-api-js";
import SpotifyPlayer from 'react-spotify-web-playback';
import Playlist from "./components/Playlist";
import $ from "jquery";
import Notifications from "./components/Notifications";

function App() {
    const token = Cookies.get('spotifyAuthToken')
    const spotifyApi = new SpotifyWebApi()
    const logo = require('./images/logopulsify.png');
    const [userId, setUserId] = useState("")
    const [userPlaylists, setPlaylists] = useState([])
    const [chosenPlaylist, setChosenPlaylist] = useState("")
    const [bpm, setBpm] = useState(75) //75 is our arbitrary average value of bpm (as it goes between 60-100)
    const [tempo, setTempo] = useState(116) //the tempo used to find a song, calculated using bpm -> 116 = average value
    const [tempos, setTempos] = useState({}) //array of all songs tempo in the playlist
    const [trackToPlay, setTrackToPlay] = useState("")
    const [lastTackChangeBPM, setLastTackChangeBPM] = useState(75)
    const [show, setShow] = useState(false)
    const [startLookingForSmile, setLookingForSmile] = useState(false)
    const [keepCurrentTrack, setKeepCurrentTrack] = useState(false)
    const [testKeepCurrentTrack, setTestKeepCurrentTrack] = useState(false)

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
        if (chosenPlaylist !== "" && trackToPlay === "") {
            chooseCorrectTrack()
        }
        deltaBpm(bpm)
    }, [bpm])

    useEffect(()=>{
        if(!keepCurrentTrack){
            chooseCorrectTrack()
        } else{
            setKeepCurrentTrack(false)
        }
    }, [testKeepCurrentTrack])


    useEffect(() => {
        const interval = setInterval(() => {
            Axios.get("http://localhost:3001/bpm").then((res) => {
                console.log("current bpm : " + res.data)
                let currentBpm = parseInt(res.data)
                setBpm(currentBpm)
                //deltaBpm(currentBpm)
            })
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    if (token && userId) {
        spotifyApi.setAccessToken(token)
        if (chosenPlaylist !== "") {
            $("#playlistsModal").modal("hide")
            console.log("chosen playlist " + chosenPlaylist)
        }
        const Input = () => {
            const handleKeyDown = (event) => {
                if (event.key === 'Enter') {
                    setBpm(event.target.value)
                    //deltaBpm(event.target.value)
                }
            }
            return (
                <div className={"input-group align-self-center"} style={{width: "10%"}}>
                    <div className="input-group-prepend">
                        <span className="input-group-text" id="basic-addon1">BPM</span>
                    </div>
                    <input type={"number"} className={"form-control"} placeholder={""} onKeyDown={handleKeyDown}/>
                </div>
            )
        }
        return (
            <div className={"pagesetup background"} style={{}}>
                <h1 className={"text-center"} style={{marginTop: "10px"}}><img src={logo.default} width={"100"}
                                                                               height={"100"} alt={""}/> Pulsify</h1>
                <div className={"d-flex flex-column"}>
                    <Camera lookForSmile={startLookingForSmile} keepSong={keepTheSong}/>
                    <div className={"d-flex d-flex-row justify-content-center"}>
                        <button className={"btn btn-success btnplaylist"} onClick={() => getUserPlaylists()}
                                data-toggle="modal"
                                data-target="#playlistsModal">
                            Choose a playlist
                        </button>
                        <br/>
                        <button className={"btn btn-warning btnlogout"} onClick={() => clearCookies()}
                                style={{marginLeft: "2em"}}>
                            Log out
                        </button>
                    </div>
                    <div className={"d-flex d-flex-column justify-content-center"}>
                        <p>Connected as <strong>{userId}</strong> on Spotify{"\n"}</p>
                    </div>
                    <br/>
                    {trackToPlay ? (
                        <div className={"input-group align-self-center"} style={{width: "30%"}}>
                            <SpotifyPlayer token={token} uris={['spotify:track:' + trackToPlay]} play={true}
                                           initialVolume={50} magnifySliderOnHover={true}
                                           styles={{
                                               activeColor: '#fff',
                                               bgColor: '#333',
                                               color: '#fff',
                                               loaderColor: '#fff',
                                               sliderColor: '#1cb954',
                                               trackArtistColor: '#ccc',
                                               trackNameColor: '#fff',
                                           }}/></div>) : null}

                    <br/>
                    <div className={"align-self-center bpm-container"}>
                        <div className={"some-margin"}>
                            <div className={"bpm-line"}>
                                <h4>❤ </h4><h4 className={"bpm square"}>{bpm}</h4>
                            </div>
                            <div className={"bpm-line"}>
                                <h4>🎶 </h4><h4 className={"bpm square"}>{tempo}</h4>
                            </div>
                        </div>
                    </div>

                    <Notifications trigger={show}/>

                    <br/>
                    {Input()}
                    <div className="modal fade " id="playlistsModal" tabIndex="-1" role="dialog"
                         aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header background2">
                                    <h5 className="modal-title" id="exampleModalLabel">Choose a playlist</h5>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body align-content-center background2">
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
            <div className={"container text-center"} style={{marginTop: "25%"}}>
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

    function keepTheSong() {
        if (!keepCurrentTrack) {
            setKeepCurrentTrack( true)
        }
    }

    function useInterval(callback, delay) {
        const savedCallback = useRef();

        // Remember the latest callback.
        useEffect(() => {
            savedCallback.current = callback;
        }, [callback]);

        // Set up the interval.
        useEffect(() => {
            function tick() {
                savedCallback.current();
            }

            if (delay !== null) {
                let id = setInterval(tick, delay);
                return () => clearInterval(id);
            }
        }, [delay]);
    }

    function ruleOfThree(bpm) {
        let tempo = Math.round(bpm * (116 / 75)) //bpm * average song tempo / arbitrary average rest heart rate (cause average is between 60-100)
        console.log("current tempo is: " + tempo)
        setTempo(tempo)
    }

    function deltaBpm(bpm) {
        console.log("lastTrackBPM: " + lastTackChangeBPM + "\n bpm: " + bpm)
        if (Math.abs(lastTackChangeBPM - bpm) >= 10) {
            console.log("rule of three")
            setLastTackChangeBPM(bpm)
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
        let randomClosestSong = Math.floor(Math.random() * 5)

        for (const [key, value] of Object.entries(tempos)) {
            if (Math.round(Number(value)) === closestSong[randomClosestSong]) {
                console.log("new track to play : " + key)
                if(trackToPlay===key){
                    chooseCorrectTrack()
                }
                setTrackToPlay(key)
                setShow(true)
                setLookingForSmile(true)
                setTimeout(() => {
                    console.log("keep "+ keepCurrentTrack)
                    setShow(false)
                    setLookingForSmile(false)
                    setTestKeepCurrentTrack(!testKeepCurrentTrack)
                }, 10000)
                return;
            }
        }
        console.log("could not find track to play")
    }
}


export default App;
