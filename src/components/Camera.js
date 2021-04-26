import * as faceapi from "face-api.js";
import React, {useEffect, useState} from "react";
import "./Camera.css"
import IsHappy from "./IsHappy"

function Camera() {
    const [video, setvideo] = useState()
    const [emotion, setEmotion] = useState({happy: false, score: 0.0})
    useEffect(() => {
        setvideo(document.getElementById("video"))

    }, [])


    if (video != null) {
        Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]).then(startVideo)
    }

    function checkEmotion() {
        faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().then(detections => {
            if (detections !== undefined) {
                if (detections.expressions.happy > 0.30) {
                    if (!emotion.happy) {
                        setEmotion({happy: true, score: detections.expressions.happy})
                    }
                } else {
                    if (emotion.happy) {
                        setEmotion({happy: false, score: detections.expressions.happy})
                    }
                }
            }
        })
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

    return (
        <div className="container-fluid">
            <video id={"video"} width="720" height="540" autoPlay muted style={{}}/>
            <br/>
            <button className={"btn btn-primary"} onClick={checkEmotion}>Check Emotion</button>
            <IsHappy emotion={emotion}/>

        </div>
    )
}

export default Camera