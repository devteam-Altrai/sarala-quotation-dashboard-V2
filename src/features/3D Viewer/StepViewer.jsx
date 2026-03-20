import { useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { TrackballControls } from "@react-three/drei";
import { LoadStep, preloadStepLoader } from "../../utils/StepLoader";
import * as THREE from "three";

function StepModel({ object }) {
  if (!object) return null;
  return <primitive object={object} />;
}

function ViewerControls({ controlsRef }) {
  const { camera, gl } = useThree();
  return (
    <TrackballControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      enableDamping
      dampingFactor={0.1}
      rotateSpeed={1.9}
      zoomSpeed={1.2}
      panSpeed={0.8}
      enablePan
      enableZoom
      enableRotate
      minDistance={10}
      maxDistance={2000}
    />
  );
}

// Utility: Fit camera to object based on bounding box
function fitCameraToObject(camera, controls, object, offset = 1.5) {
  const box = new THREE.Box3().setFromObject(object);
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();
  box.getCenter(center);
  box.getSize(size);

  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  const distance = Math.abs(maxDim / Math.tan(fov / 2)) * offset;

  camera.position.set(center.x, center.y, center.z + distance);
  camera.near = 0.1;
  camera.far = distance * 10;
  camera.lookAt(center);
  camera.updateProjectionMatrix();

  if (controls) {
    controls.target.copy(center);
    controls.update();
  }
}

export default function StepViewer({ stepFiles }) {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(false);
  const controlsRef = useRef();
  const cameraRef = useRef();

  useEffect(() => {
    preloadStepLoader().catch((err) => {
      console.error("Failed to preload STEP loader:", err);
    });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const loadModel = async () => {
      if (!stepFiles || typeof stepFiles !== "string") {
        console.warn("Invalid STEP file path:", stepFiles);
        setModel(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const loadedModel = await LoadStep(stepFiles, {
          signal: controller.signal,
        });

        if (cancelled) {
          return;
        }

        const bbox = new THREE.Box3().setFromObject(loadedModel);
        const center = new THREE.Vector3();
        bbox.getCenter(center);
        loadedModel.position.sub(center);

        setModel(loadedModel);

        if (cameraRef.current) {
          fitCameraToObject(
            cameraRef.current,
            controlsRef.current,
            loadedModel,
            1.5
          );
        }
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }
        console.error("Failed to load STEP model:", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadModel();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [stepFiles]);

  return (
    <div className="h-full w-full bg-white relative">
      {loading && (
        <div className="absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 bg-white rounded-lg shadow-md font-semibold text-lg">
          Loading STEP model...
        </div>
      )}

      <Canvas
        camera={{ position: [10, 10, 80], fov: 75 }}
        onCreated={({ camera }) => {
          cameraRef.current = camera;
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 10]} intensity={1.2} />
        <directionalLight position={[-10, -10, 5]} intensity={0.5} />
        <ViewerControls controlsRef={controlsRef} />
        <StepModel object={model} />
      </Canvas>
    </div>
  );
}
