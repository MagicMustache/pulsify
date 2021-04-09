import './App.css';
import * as faceapi from 'face-api.js';
import {useEffect, useState} from "react";


function App() {

    const [video, setvideo] =useState()
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
        video.addEventListener('play', () => {
            //create the canvas from video element as we have created above
            const canvas = faceapi.createCanvasFromMedia(video);
            //append canvas to body or the dom element where you want to append it
            document.body.append(canvas)
            // displaySize will help us to match the dimension with video screen and accordingly it will draw our detections
            // on the streaming video screen
            const displaySize = { width: video.width, height: video.height }
            faceapi.matchDimensions(canvas, displaySize)
            setInterval(async () => {
                const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
                const resizedDetections = faceapi.resizeResults(detections, displaySize)
                canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
                faceapi.draw.drawDetections(canvas, resizedDetections)
                faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
            }, 100)
        })
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

  return (
    <div className="App">
      <div id={"overlay"}>
          <video id={"video"} width="720" height="560" autoPlay muted/>
      </div>
    </div>
  );
}


export default App;
