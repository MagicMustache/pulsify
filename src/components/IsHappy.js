

function isHappy(props){

    let happy
    if(props.happy){
        happy =<h2>I'm Happy</h2>
    }else{
        happy =<h2>I'm not happy</h2>
    }
    return(
        <div>
            {happy}
        </div>
    )
}

export default isHappy
