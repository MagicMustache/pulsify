function Playlist(props) {
    if (props.playlist.name) {
        return (
            <div className={"card"} style={{margin: "2em", width: "50%"}}>
                <img className={"card-img-top"} src={props.playlist.images[0].url}
                     style={{width: "150px", height: "150px", margin: "1em"}}/>
                <div className={"card-body"}>
                    <h5 className={"card-title"} style={{width: "50%"}}>{props.playlist.name}</h5>
                    <button className={"btn btn-primary"} style={{}}>Choose this playlist</button>
                </div>
            </div>
        )
    } else {
        return null
    }

}

export default Playlist
