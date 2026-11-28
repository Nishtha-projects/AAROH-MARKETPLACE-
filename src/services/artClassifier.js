import * as ort from "onnxruntime-web";

let session = null;
let modelMetrics = null;

export async function getModelMetrics() {
    if (!modelMetrics) {
        const res = await fetch("/models/metrics.json");
        modelMetrics = await res.json();
    }
    return modelMetrics;
}

export async function predictCraftFromImage(imageElement) {
    const metrics = await getModelMetrics();
    if (!session) {
        session = await ort.InferenceSession.create("/models/aaroh_classifier.onnx");
    }

    // Preprocess image to 224x224 RGB normalized tensor
    const canvas = document.createElement("canvas");
    canvas.width = 224;
    canvas.height = 224;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imageElement, 0, 0, 224, 224);
    const { data } = ctx.getImageData(0, 0, 224, 224);

    const floatData = new Float32Array(3 * 224 * 224);
    const mean = [0.485, 0.456, 0.406];
    const std = [0.229, 0.224, 0.225];

    for (let i = 0; i < 224 * 224; i++) {
        floatData[i] = (data[i * 4] / 255 - mean[0]) / std[0];
        floatData[224 * 224 + i] = (data[i * 4 + 1] / 255 - mean[1]) / std[1];
        floatData[2 * 224 * 224 + i] = (data[i * 4 + 2] / 255 - mean[2]) / std[2];
    }

    const tensor = new ort.Tensor("float32", floatData, [1, 3, 224, 224]);
    const results = await session.run({ input: tensor });
    const logits = Array.from(results.output.data);

    // Softmax probabilities
    const maxLogit = Math.max(...logits);
    const exps = logits.map((v) => Math.exp(v - maxLogit));
    const sumExp = exps.reduce((a, b) => a + b, 0);
    const probs = exps.map((v) => v / sumExp);

    const bestIdx = probs.indexOf(Math.max(...probs));
    return {
        predictedClass: metrics.classes[bestIdx].replace(/_/g, " "),
        confidence: Math.round(probs[bestIdx] * 1000) / 10,
        modelAccuracy: metrics.accuracy,
        totalSamples: metrics.total_samples
    };
}