function isHappy(props) {
    let happy
    if (props.emotion.happy) {
        happy = <h2>I'm Happy (score={props.emotion.score})</h2>
    } else {
        happy = <h2>I'm not happy (score={props.emotion.score})</h2>
    }
    return (
        <div>
            {happy}
        </div>
    )
}

export default isHappy
