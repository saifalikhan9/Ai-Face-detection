import { useRef, useEffect } from 'react';
import './App.css';
import * as faceapi from 'face-api.js';
import logo from './assets/logopng.png';  // Assuming you have a logo.png file in the src directory

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    startVideo();
  }, []);

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((currentStream) => {
        videoRef.current.srcObject = currentStream;
        videoRef.current.onloadedmetadata = () => {
          loadModels();
        };
      })
      .catch((err) => {
        console.log('Error accessing webcam: ', err);
      });
  };

  const loadModels = async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models'),
      ]);
      faceMyDetect();
    } catch (error) {
      console.log('Error loading models: ', error);
    }
  };

  const faceMyDetect = () => {
    const canvas = faceapi.createCanvasFromMedia(videoRef.current);
    canvas.width = 640;
    canvas.height = 480;
    canvasRef.current.innerHTML = '';
    canvasRef.current.appendChild(canvas);

    const displaySize = { width: 640, height: 480 };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      try {
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
      } catch (error) {
        console.log('Error in detection: ', error);
      }
    }, 100);
  };

  return (
    <div className="myapp">
      <img src={logo} alt="Face Detection Logo" className="logo" />
      <h1>Face Detection</h1>
      <div className="appvideo">
        <video
          crossOrigin="anonymous"
          ref={videoRef}
          width="640"
          height="480"
          autoPlay
          muted
          onPlay={() => {
            const canvas = faceapi.createCanvasFromMedia(videoRef.current);
            canvas.width = 640;
            canvas.height = 480;
            faceapi.matchDimensions(canvas, { width: 640, height: 480 });
            canvasRef.current.innerHTML = '';
            canvasRef.current.appendChild(canvas);
          }}
        ></video>
        <div ref={canvasRef} className="appcanvas"></div>
      </div>
    </div>
  );
}

export default App;
