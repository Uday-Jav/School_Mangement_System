const fs = require('fs');

const buffer = fs.readFileSync('public/models/academic_building.glb');

// GLB Header
const magic = buffer.toString('utf8', 0, 4);
const version = buffer.readUInt32LE(4);
const length = buffer.readUInt32LE(8);

// JSON Chunk
const chunkLength = buffer.readUInt32LE(12);
const chunkType = buffer.toString('utf8', 16, 20);

if (magic !== 'glTF' || chunkType !== 'JSON') {
  console.log('Not a valid GLB file');
  process.exit(1);
}

const jsonString = buffer.toString('utf8', 20, 20 + chunkLength);
const gltf = JSON.parse(jsonString);

console.log('--- GLB Analysis ---');
console.log(`Meshes: ${gltf.meshes ? gltf.meshes.length : 0}`);
console.log(`Materials: ${gltf.materials ? gltf.materials.length : 0}`);
console.log(`Textures: ${gltf.textures ? gltf.textures.length : 0}`);
console.log(`Images: ${gltf.images ? gltf.images.length : 0}`);
console.log(`Nodes: ${gltf.nodes ? gltf.nodes.length : 0}`);

let triangleCount = 0;
let vertexCount = 0;
if (gltf.meshes) {
  for (const mesh of gltf.meshes) {
    for (const primitive of mesh.primitives) {
      if (primitive.indices !== undefined) {
        const accessor = gltf.accessors[primitive.indices];
        triangleCount += accessor.count / 3;
      }
      if (primitive.attributes.POSITION !== undefined) {
         const accessor = gltf.accessors[primitive.attributes.POSITION];
         vertexCount += accessor.count;
         console.log(`Position Box: MIN=${accessor.min} MAX=${accessor.max}`);
      }
    }
  }
}
console.log(`Estimated Triangles: ${triangleCount}`);
console.log(`Estimated Vertices: ${vertexCount}`);
