import './App.css';
import Camera from "./components/Camera";
import React, {useEffect, useState} from 'react';
import {Scopes, SpotifyAuth} from 'react-spotify-auth'
import Axios from "axios"
import Cookies from 'js-cookie'
import SpotifyWebApi from "spotify-web-api-js";
import Playlist from "./components/Playlist";

function App() {
    const token = Cookies.get('spotifyAuthToken')
    const [userId, setUserId] = useState("")
    const [userPlaylists, setPlaylists] = useState([])
    const [startCam, setStartCam] = useState(false)
    const spotifyApi = new SpotifyWebApi();

    useEffect(() => {
        getUserID()
    }, [])

    if (token) {
        spotifyApi.setAccessToken(token)

        return (
            <div className={"container"} style={{}}>
                <h1 className={"text-center"}>Pulsify</h1>
                <div className={"d-flex flex-column"}>
                    {startCam ? <Camera/> : null}
                    <div className={"d-flex d-flex-column justify-content-center"}>
                        <h3>You are connected as "{userId}" on Spotify{"\n"}</h3>
                    </div>
                    <div className={"d-flex d-flex-row justify-content-center"}>
                        <button className={"btn btn-info"} onClick={() => getUserPlaylists()}>
                            Get all playlists
                        </button>
                        <button className={"btn btn-danger"} onClick={() => Cookies.remove("spotifyAuthToken")}
                                style={{marginLeft: "2em"}}>
                            Clear Cookies
                        </button>
                    </div>
                    <div className={"d-flex flex-column"}>
                        {userPlaylists.length > 0 ? (generatePlaylistsComponents(userPlaylists)) : null}
                    </div>
                </div>
            </div>
        );
    } else {
        return (
            <SpotifyAuth
                redirectUri='http://localhost:3000'
                clientID='dd7a0938872c4219b6b83bbe40cb5404'
                scopes={[Scopes.userReadPrivate, 'user-read-email', Scopes.playlistReadPrivate, Scopes.playlistReadCollaborative]}/>
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
}

function generatePlaylistsComponents(playlists) {
    return playlists.map((playlist =>
            <Playlist key={playlist.id} playlist={playlist}/>
    ))
}


export default App;
