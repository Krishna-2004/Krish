
import React, { useRef, useState, useEffect } from 'react';
import './DigitDraw.css';

const DigitDraw = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      // Setup the canvas with a white background and smooth drawing style.
      context.lineWidth = 15;
      context.lineCap = 'round';
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const startDrawing = (e) => {
    setIsDrawing(true);
    draw(e);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    const context = canvasRef.current.getContext('2d');
    context.beginPath();
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    context.lineTo(x, y);
    context.stroke();
    context.beginPath();
    context.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    setPrediction(null);
  };

  const handlePredict = async () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL('image/png');

    try {
      // Replace the URL below with your backend's URL (e.g., https://your-backend-app.onrender.com/predict)
    //   const response = await fetch('https://your-backend-url/predict', {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData }),
      });
      const data = await response.json();
      setPrediction(data.prediction);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="digit-draw-container">
      <h1 className="title">Digit Classifier</h1>
      <canvas
        ref={canvasRef}
        width={280}
        height={280}
        className="digit-canvas"
        onMouseDown={startDrawing}
        onMouseUp={endDrawing}
        onMouseMove={draw}
        onMouseLeave={endDrawing}
      ></canvas>
      <div className="button-group">
        <button className="btn clear-btn" onClick={clearCanvas}>
          Clear
        </button>
        <button className="btn predict-btn" onClick={handlePredict}>
          Predict
        </button>
      </div>
      {prediction !== null && (
        <div className="prediction-result">
          <h2>Prediction: {prediction}</h2>
        </div>
      )}
    </div>
  );
};

export default DigitDraw;
