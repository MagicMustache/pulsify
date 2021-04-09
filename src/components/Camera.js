import * as faceapi from "face-api.js";
import {useEffect, useState} from "react";
import "./Camera.css"
import IsHappy from "./IsHappy"

function Camera(){
    const [video, setvideo] =useState()
    const [happy, setHappy] =useState()
    useEffect(()=>{
        setvideo(document.getElementById("video"))
    },[])


    if(video!=null){
        Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]).then(startVideo)
    }

    async function checkEmotion() {
        const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
        if (detections !== undefined) {
            if (detections.expressions.happy > 0.50) {
                if (!happy) {
                    setHappy(true)
                }
            } else {
                if (happy) {
                    setHappy(false)
                }
            }
        }
    }

    function startVideo() {
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(function (stream) {
                    video.srcObject = stream;
                })
                .catch(function (err0r) {
                    console.log("Something went wrong!");
                    console.log(err0r)
                });
        }
    }
    return(
        <div className="container-fluid" >
            <video id={"video"} width="720" height="540" autoPlay muted style={{}}/>
            <br/>
            <button className={"btn btn-primary"} onClick={checkEmotion}>Check Emotion</button>
            <IsHappy happy={happy}/>

        </div>
    )
}

export default Camera
