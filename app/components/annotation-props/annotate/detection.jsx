import React, { useEffect, useRef, useState } from "react";
import { Annotorious } from "@recogito/annotorious";
import "@recogito/annotorious/dist/annotorious.min.css";
import { Save, RefreshCw, Crosshair, ZoomIn, ZoomOut } from 'lucide-react';

function ImageWithBoundingBox({ idproject, iddetection, imageUrl }) {
  const imgEl = useRef(null);
  const [anno, setAnno] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [vocabulary, setVocabulary] = useState([]);
  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const fetchClassNames = async () => {
    try {
      const response = await fetch(
        `${process.env.ORIGIN_URL}/detection/class/${idproject}`,
        { credentials: "include" }
      );
      const data = await response.json();
      setVocabulary(data.strClass);
    } catch (error) {
      console.error("Error fetching class names:", error);
    }
  };

  const fetchBoundingBoxes = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(
        `${process.env.ORIGIN_URL}/detection/bounding_box/${iddetection}`,
        { credentials: "include" }
      );
      const data = await response.json();

      setAnnotations([]);

      if (anno) {
        anno.setAnnotations(data.annotation);
        const fetchedAnnotations = data.annotation.map((annotation) => {
          const shape = annotation.target.selector.value;
          const [x, y, width, height] = shape
            .split("=")[1]
            .split(":")[1]
            .split(",")
            .map(Number);

          return {
            id: annotation.id,
            x1: x,
            y1: y,
            x2: x + width,
            y2: y + height,
            width,
            height,
            class_label: annotation.body[0].value,
          };
        });

        setAnnotations(fetchedAnnotations);
      }
    } catch (error) {
      console.error("Error fetching bounding boxes:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let annotorious = null;

    if (imgEl.current) {
      annotorious = new Annotorious({
        image: imgEl.current,
        widgets: [
          {
            widget: "TAG",
            vocabulary: vocabulary,
            style: {
              color: 'white',
              backgroundColor: 'rgba(59, 130, 246, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.375rem',
              padding: '0.5rem',
              margin: '0.5rem',
              fontSize: '0.875rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            },
          },
        ],
      });

      annotorious.on("createAnnotation", (annotation) => {
        const shape = annotation.target.selector.value;
        const [x, y, width, height] = shape
          .split("=")[1]
          .split(":")[1]
          .split(",")
          .map(Number);

        const newAnnotation = {
          id: annotation.id,
          x1: x,
          y1: y,
          x2: x + width,
          y2: y + height,
          width,
          height,
          class_label: annotation.body[0].value,
        };

        setAnnotations((prevAnnotations) => [
          ...prevAnnotations,
          newAnnotation,
        ]);
      });

      annotorious.on("updateAnnotation", (annotation, previous) => {
        const shape = annotation.target.selector.value;
        const [x, y, width, height] = shape
          .split("=")[1]
          .split(":")[1]
          .split(",")
          .map(Number);

        const updatedAnnotation = {
          id: annotation.id,
          x1: x,
          y1: y,
          x2: x + width,
          y2: y + height,
          width,
          height,
          class_label: annotation.body[0].value,
        };

        setAnnotations((prevAnnotations) =>
          prevAnnotations.map((anno) =>
            anno.id === annotation.id ? updatedAnnotation : anno
          )
        );
      });

      annotorious.on("deleteAnnotation", (annotation) => {
        setAnnotations((prevAnnotations) =>
          prevAnnotations.filter((anno) => anno.id !== annotation.id)
        );
      });

      setAnno(annotorious);
    }

    return () => annotorious?.destroy();
  }, [vocabulary]);

  useEffect(() => {
    if (anno) {
      fetchBoundingBoxes();
    }
  }, [anno, iddetection]);

  const autofetch = () => {
    fetchClassNames();
    fetchBoundingBoxes();
  };

  const sendBoundingBoxToBackend = async () => {
    setIsSaving(true);
    const dataToSend = {
      idproject: idproject,
      iddetection: iddetection,
      bounding_box: annotations.map((annotation) => ({
        id: annotation.id,
        class_label: annotation.class_label,
        width: annotation.width,
        height: annotation.height,
        x1: annotation.x1,
        x2: annotation.x2,
        y1: annotation.y1,
        y2: annotation.y2,
      })),
    };

    try {
      const response = await fetch(
        `${process.env.ORIGIN_URL}/create/detection/bounding_box`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(dataToSend),
        }
      );
      const result = await response.json();
      console.log("Success:", result);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMouseMove = (event) => {
    const rect = imgEl.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setMouseCoords({ x, y });
  };

  const handleZoomToggle = () => {
    setIsZoomed(!isZoomed);
    if (anno) {
      // Force Annotorious to redraw annotations after zoom
      setTimeout(() => {
        const currentAnnotations = anno.getAnnotations();
        anno.setAnnotations(currentAnnotations);
      }, 100);
    }
  };

  return (
    <div className={`flex flex-col items-center bg-green-100  p-4 sm:p-8 rounded-lg shadow-lg ${isZoomed ? 'fixed inset-0 z-50 overflow-y-auto overflow-x-hidden' : ''}`}>
      <div className="self-end flex flex-wrap gap-2 mb-2 sticky top-0 z-10 bg-opacity-80 bg-blue-100 p-2 rounded-lg">
        <button
          onClick={sendBoundingBoxToBackend}
          className="bg-blue-600 text-white px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base rounded-full shadow-md hover:bg-blue-700 transition duration-300 flex items-center"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <RefreshCw className="animate-spin mr-1 sm:mr-2" size={16} />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-1 sm:mr-2" size={16} />
              Save
            </>
          )}
        </button>
        <button
          onClick={fetchBoundingBoxes}
          className="bg-blue-500 text-white px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base rounded-full shadow-md hover:bg-blue-600 transition duration-300 flex items-center"
          disabled={isRefreshing}
        >
          <RefreshCw className={`mr-1 sm:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} size={16} />
          Refresh
        </button>
        <button
          onClick={handleZoomToggle}
          className="bg-green-500 text-white px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base rounded-full shadow-md hover:bg-green-600 transition duration-300 flex items-center"
        >
          {isZoomed ? (
            <>
              <ZoomOut className="mr-1 sm:mr-2" size={16} />
              Exit Zoom
            </>
          ) : (
            <>
              <ZoomIn className="mr-1 sm:mr-2" size={16} />
              Zoom
            </>
          )}
        </button>
      </div>
      <div 
        className={`relative cursor-crosshair ${isZoomed ? 'min-w-screen' : 'min-w-screen max-w-4xl mx-auto'}`} 
        onMouseMove={handleMouseMove}
      >      
        <img
          onLoad={autofetch}
          ref={imgEl}
          src={imageUrl}
          alt="Annotate this image"
          className={`rounded-lg shadow-md ${isZoomed ? 'min-w-screen h-auto' : 'object-contain min-w-screen h-auto max-h-[70vh]'}`}
        />

        <div
          className="absolute left-0 top-0 w-full h-full pointer-events-none"
          style={{ zIndex: 10 }}
        >
          <div
            className="absolute bg-blue-500 opacity-100"
            style={{
              width: "1px",
              height: "100%",
              left: `${mouseCoords.x}px`,
              top: 0,
            }}
          ></div>
          <div
            className="absolute bg-blue-500 opacity-100"
            style={{
              width: "100%",
              height: "1px",
              top: `${mouseCoords.y}px`,
              left: 0,
            }}
          ></div>
          <div className="absolute bottom-2 right-2 bg-white bg-opacity-75 px-2 py-1 rounded text-xs sm:text-sm text-blue-800">
            <Crosshair className="inline-block mr-1" size={14} />
            {mouseCoords.x.toFixed(0)}, {mouseCoords.y.toFixed(0)}
          </div>
        </div>
      </div>
      <div className="mt-4 text-blue-700 text-sm">
        Total annotations: {annotations.length}
      </div>
    </div>
  );
}

export default ImageWithBoundingBox;