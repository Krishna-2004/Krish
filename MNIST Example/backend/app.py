from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import base64
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf
from tensorflow.keras.models import load_model, Sequential
from tensorflow.keras.layers import Dense, Flatten
from tensorflow.keras.datasets import mnist

app = Flask(__name__)
CORS(app, supports_credentials=True)

MODEL_PATH = "mnist_model.h5"

def build_model():
    model = Sequential([
        Flatten(input_shape=(28, 28)),
        Dense(128, activation="relu"),
        Dense(10, activation="softmax")
    ])
    model.compile(optimizer="adam",
                  loss="sparse_categorical_crossentropy",
                  metrics=["accuracy"])
    return model

def train_model():
    (x_train, y_train), (x_test, y_test) = mnist.load_data()
    x_train, x_test = x_train / 255.0, x_test / 255.0
    model = build_model()
    model.fit(x_train, y_train, epochs=5, verbose=1)
    loss, acc = model.evaluate(x_test, y_test, verbose=0)
    print("Trained model accuracy:", acc)
    model.save(MODEL_PATH)
    return model

if os.path.exists(MODEL_PATH):
    model = load_model(MODEL_PATH)
    print("Model loaded.")
else:
    print("Training model...")
    model = train_model()

def preprocess_image(image):
    image = image.convert("L")
    image = image.resize((28, 28))
    img_array = np.array(image)
    img_array = img_array / 255.0
    img_array = 1 - img_array  # Invert colors if needed
    img_array = img_array.reshape(1, 28, 28)
    return img_array

@app.route("/")
def index():
    return "MNIST Classifier API is running!"

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(force=True)
    if "image" not in data:
        return jsonify({"error": "No image data provided"}), 400

    image_data = data["image"]
    if "," in image_data:
        image_data = image_data.split(",")[1]

    try:
        decoded = base64.b64decode(image_data)
        image = Image.open(BytesIO(decoded))
    except Exception as e:
        return jsonify({"error": "Invalid image data", "message": str(e)}), 400

    processed_image = preprocess_image(image)
    prediction = model.predict(processed_image)
    predicted_digit = int(np.argmax(prediction, axis=1)[0])
    confidence = float(np.max(prediction))

    return jsonify({"prediction": predicted_digit, "confidence": confidence})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
