import * as faceapi from "face-api.js";
import React, {useEffect, useMemo, useState} from "react";
import "./Camera.css"

function Camera(props) {
    const [video, setvideo] = useState()
    const [loadedModels, setLoadedModels] = useState(false)

    useEffect(() => {
        setvideo(document.getElementById("video"))
    }, [video])

    useEffect(() => {
        if (props.lookForSmile) {
            let i = 0
            let interval = setInterval(async () => {
                if (i === 100) {
                    clearInterval(interval)
                }
                checkEmotion().then((res) => {
                    if (res) {
                        console.log("you smiled")
                        props.keepSong()
                    }
                })
                i += 1
            }, 100)
        } else {
            console.log("00000")
        }
    }, [props.lookForSmile])

    if (!loadedModels) {
        if (video != null) {
            Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
                faceapi.nets.faceExpressionNet.loadFromUri('/models')
            ]).then(() => {
                console.log("loaded models")
                setLoadedModels(true)
                startVideo()
            })
        }
    }

    const renderVideo = useMemo(() => (
        <center>
            <video id={"video"} width="400" autoPlay muted style={{}}/>
        </center>
    ), [])

    return (
        <div className="container-fluid">
            {renderVideo}
        </div>
    )

    async function checkEmotion() {
        let detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
        if (detections !== undefined) {
            if (detections.expressions.happy > 0.50) {
                return true
            }
        }
        return false
    }

    function startVideo() {
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({video: true})
                .then(function (stream) {
                    video.srcObject = stream;
                })
                .catch(function (err0r) {
                    console.log("Something went wrong!");
                    console.log(err0r)
                });
        }
    }
}


export default Camera
