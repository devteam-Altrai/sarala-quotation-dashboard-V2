import * as THREE from "three";
import occtimportjs from "occt-import-js";

const wasmUrl =
  "https://cdn.jsdelivr.net/npm/occt-import-js@0.0.23/dist/occt-import-js.wasm";

let occtInstancePromise;
const stepCache = new Map();

function ensureOcctInstance() {
  if (!occtInstancePromise) {
    occtInstancePromise = occtimportjs({
      locateFile: () => wasmUrl,
    });
  }
  return occtInstancePromise;
}

function normaliseToUint8Array(input) {
  if (input instanceof Uint8Array) {
    return input;
  }

  if (input instanceof ArrayBuffer) {
    return new Uint8Array(input);
  }

  if (ArrayBuffer.isView(input)) {
    return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  }

  throw new Error(
    "LoadStep expects a STEP file URL or an ArrayBuffer/TypedArray input."
  );
}

async function fetchToUint8Array(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch STEP file (${response.status}): ${response.statusText}`
    );
  }
  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

function buildThreeObject(result) {
  const targetObject = new THREE.Object3D();

  for (const resultMesh of result.meshes) {
    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(resultMesh.attributes.position.array, 3)
    );

    if (resultMesh.attributes.normal) {
      geometry.setAttribute(
        "normal",
        new THREE.Float32BufferAttribute(resultMesh.attributes.normal.array, 3)
      );
    }

    const index = Uint32Array.from(resultMesh.index.array);
    geometry.setIndex(new THREE.BufferAttribute(index, 1));

    const color = resultMesh.color
      ? new THREE.Color(...resultMesh.color)
      : new THREE.Color(0xcccccc);

    const material = new THREE.MeshPhongMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);

    targetObject.add(mesh);
  }

  return targetObject;
}

export function preloadStepLoader() {
  return ensureOcctInstance();
}

export function clearStepCache() {
  stepCache.clear();
}

export async function LoadStep(input, { signal } = {}) {
  const occt = await ensureOcctInstance();

  let fileBuffer;
  let cacheKey = null;

  if (typeof input === "string") {
    cacheKey = input;
    const cached = stepCache.get(cacheKey);
    if (cached) {
      return cached.clone(true);
    }
    fileBuffer = await fetchToUint8Array(input, signal);
  } else {
    fileBuffer = normaliseToUint8Array(input);
  }

  const result = occt.ReadStepFile(fileBuffer);
  const object3d = buildThreeObject(result);

  if (cacheKey) {
    stepCache.set(cacheKey, object3d);
    return object3d.clone(true);
  }

  return object3d;
}
