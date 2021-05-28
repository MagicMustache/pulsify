function Playlist(props) {
    if (props.playlist.name) {
        return (
            <div className={"card"}>
                <img className={"card-img-top"} src={props.playlist.images[0].url} alt={""}/>
                <div className={"card-body background2"}>
                    <h5 className={"card-title"} style={{}}>{props.playlist.name}</h5>
                    <button className={"btn btn-primary"} style={{}} onClick={()=>props.getChoice(props.playlist.id)}>Choose this playlist</button>
                </div>
            </div>
        )
    } else {
        return null
    }
}

export default Playlist
