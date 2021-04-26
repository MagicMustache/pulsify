import './App.css';
import Camera from "./components/Camera";
import { SpotifyApiContext } from 'react-spotify-api'
import { SpotifyAuth, Scopes } from 'react-spotify-auth'
import Cookies from 'js-cookie'

function App() {
    const token = Cookies.get('spotifyAuthToken')
        return (
            <div className={"container-fluid justify-content-center align-content-center align-items-center"} style={{}}>
                <h1 className={"text-center"}>Pulsify</h1>
                {token ? (
                    <SpotifyApiContext.Provider value={token}>
                        <Camera/>
                        <h3>You are connected to spotify</h3>
                    </SpotifyApiContext.Provider>
                ):(
                    <SpotifyAuth
                        redirectUri='http://localhost:3000'
                        clientID='dd7a0938872c4219b6b83bbe40cb5404'
                        scopes={[Scopes.userReadPrivate, 'user-read-email']} // either style will work
                    />
                )
            }
            </div>

        );
}


export default App;
