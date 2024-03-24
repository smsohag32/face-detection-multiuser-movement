import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

const FaceDetact = () => {
  const webcamRef = useRef(null);
  const [faceCount, setFaceCount] = useState(0);
  const [prevFaceX, setPrevFaceX] = useState(null);
  //   const [capturedImages, setCapturedImages] = useState([]);
  const [position, setPosition] = useState("");
  useEffect(() => {
    // Load face-api.js models
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    ]).then(startFaceDetection);
  }, []);

  const startFaceDetection = () => {
    // Run detectFaces every second
    setInterval(() => {
      detectFaces();
    }, 100); // 1-second interval
  };

  //   useEffect(() => {
  //     // Capture and send image every minute
  //     const imageCaptureInterval = setInterval(() => {
  //       captureAndSendImage();
  //     }, 6000); // 1-minute interval

  //     // Clear interval on component unmount
  //     return () => clearInterval(imageCaptureInterval);
  //   }, []);

  const detectFaces = async () => {
    if (webcamRef.current) {
      const videoEl = webcamRef.current.video;
      const result = await faceapi
        .detectAllFaces(videoEl, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      if (result.length > 0) {
        const currentFaceX = result[0].landmarks._positions[0].x;

        if (prevFaceX !== null) {
          const movementThreshold = 10; // Adjust this threshold as needed
          const deltaX = currentFaceX - prevFaceX;

          if (deltaX > movementThreshold) {
            setPosition("Moved to the right");
            // Trigger action for moving right
          } else if (deltaX < movementThreshold) {
            setPosition("Moved to the left");
            // Trigger action for moving left
          } else {
            setPosition("Center");
          }
        }

        setPrevFaceX(currentFaceX);
      }

      setFaceCount(result.length);
    }
  };

  const captureAndSendImage = async () => {
    if (webcamRef.current) {
      const videoEl = webcamRef.current.video;
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      canvas.width = videoEl.width;
      canvas.height = videoEl.height;
      context.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL("image/jpeg");

      // Save the new image along with the previous ones
      //   setCapturedImages((prevImages) => [...prevImages, dataUrl]);

      // TODO: Send dataUrl to your backend using an HTTP request (e.g., fetch)
      console.log("Captured Image Data URL:", dataUrl);
    }
  };
  const videoConstraints = {
    width: 1280,
    height: 720,
  };

  return (
    <div className=" w-full text-2xl min-h-screen flex flex-col items-center justify-center">
      <div className="max-w-3xl ring-2 ring-violet-500 mx-auto  min-w-4xl">
        <Webcam
          ref={webcamRef}
          audio={false}
          mirrored={true}
          screenshotFormat="image/jpeg"
          className=""
          videoConstraints={videoConstraints}
        />
      </div>
      <p>Number of Faces: {faceCount}</p>
      <p>Face position: {position}</p>
    </div>
  );
};

export default FaceDetact;
