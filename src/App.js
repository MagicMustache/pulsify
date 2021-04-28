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

    const spotifyApi = new SpotifyWebApi();

    useEffect(() => {
        getUserID()
    }, [])

    if (token) {
        spotifyApi.setAccessToken(token)
        if (chosenPlaylist !== "") {
            $("#playlistsModal").modal("hide")
            console.log("chose playlist " + chosenPlaylist)
        }
        return (
            <div className={"container"} style={{}}>
                <h1 className={"text-center"}>Pulsify</h1>
                <div className={"d-flex flex-column"}>
                    {startCam ? <Camera/> : null}
                    <div className={"d-flex d-flex-column justify-content-center"}>
                        <h3>You are connected as "{userId}" on Spotify{"\n"}</h3>
                    </div>
                    <div className={"d-flex d-flex-row justify-content-center"}>
                        <button className={"btn btn-info"} onClick={() => getUserPlaylists()} data-toggle="modal"
                                data-target="#playlistsModal">
                            Choose a playlist
                        </button>
                        <button className={"btn btn-danger"} onClick={() => Cookies.remove("spotifyAuthToken")}
                                style={{marginLeft: "2em"}}>
                            Clear Cookies
                        </button>
                        <button className={"btn btn-primary"} onClick={() => setStartCam(!startCam)}
                                style={{marginLeft: "2em"}}>
                            Show Webcam
                        </button>
                    </div>
                    <br/>
                    {chosenPlaylist ? (
                        <SpotifyPlayer token={token} uris={['spotify:playlist:'+chosenPlaylist]} styles={{
                            activeColor: '#fff',
                            bgColor: '#333',
                            color: '#fff',
                            loaderColor: '#fff',
                            sliderColor: '#1cb954',
                            trackArtistColor: '#ccc',
                            trackNameColor: '#fff',
                        }}/>) : null}

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
            <SpotifyAuth
                redirectUri='http://localhost:3000'
                clientID='dd7a0938872c4219b6b83bbe40cb5404'
                scopes={[Scopes.userReadPrivate, Scopes.playlistReadPrivate, Scopes.playlistReadCollaborative,
                    Scopes.streaming, Scopes.userReadEmail, Scopes.userLibraryRead, Scopes.userLibraryModify, Scopes.userReadPlaybackState, Scopes.userModifyPlaybackState]}/>
        )
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
}


export default App;
