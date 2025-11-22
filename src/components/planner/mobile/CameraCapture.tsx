"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  CameraIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import {
  requestCameraAccess,
  stopCameraStream,
  capturePhoto,
  hasCamera,
} from "@/utils/mobile";

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>("");
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );
  const [cameraAvailable, setCameraAvailable] = useState(false);

  useEffect(() => {
    checkCamera();
  }, []);

  useEffect(() => {
    if (cameraAvailable) {
      startCamera();
    }

    return () => {
      if (stream) {
        stopCameraStream(stream);
      }
    };
  }, [facingMode, cameraAvailable]);

  const checkCamera = async () => {
    const available = await hasCamera();
    setCameraAvailable(available);
    if (!available) {
      setError("No camera available on this device");
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await requestCameraAccess();
      if (mediaStream && videoRef.current) {
        setStream(mediaStream);
        videoRef.current.srcObject = mediaStream;
        setError("");
      } else {
        setError("Camera access denied");
      }
    } catch (err) {
      setError("Failed to access camera");
      console.error("Camera error:", err);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const imageData = capturePhoto(videoRef.current, canvasRef.current);
    if (imageData) {
      onCapture(imageData);
      handleClose();
    }
  };

  const handleFlipCamera = () => {
    if (stream) {
      stopCameraStream(stream);
    }
    setFacingMode(facingMode === "user" ? "environment" : "user");
  };

  const handleClose = () => {
    if (stream) {
      stopCameraStream(stream);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
        <button
          onClick={handleClose}
          className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
          aria-label="Close camera"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <button
          onClick={handleFlipCamera}
          className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
          aria-label="Flip camera"
        >
          <ArrowPathIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Video Preview */}
      <div className="relative w-full h-full flex items-center justify-center">
        {error ? (
          <div className="text-center text-white p-6">
            <CameraIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">{error}</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
          </>
        )}
      </div>

      {/* Capture Button */}
      {!error && (
        <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center p-8 bg-gradient-to-t from-black/50 to-transparent">
          <button
            onClick={handleCapture}
            className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 hover:border-teal-500 transition-colors"
            aria-label="Capture photo"
          >
            <div className="w-full h-full rounded-full bg-white" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
