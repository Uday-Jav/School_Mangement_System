const fs = require('fs');
const file = process.argv[2];
const buffer = fs.readFileSync(file);

if (file.endsWith('.glb')) {
  const chunkLength = buffer.readUInt32LE(12);
  const jsonString = buffer.toString('utf8', 20, 20 + chunkLength);
  const gltf = JSON.parse(jsonString);
  console.log('---', file, '---');
  console.log('Images:', gltf.images);
  console.log('Materials:', JSON.stringify(gltf.materials, null, 2));
  for (const mesh of gltf.meshes) {
    for (const primitive of mesh.primitives) {
       if (primitive.attributes.POSITION !== undefined) {
           const accessor = gltf.accessors[primitive.attributes.POSITION];
           console.log(`Box: MIN=${accessor.min} MAX=${accessor.max}`);
       }
    }
  }
} else {
  const gltf = JSON.parse(buffer.toString('utf8'));
  console.log('---', file, '---');
  console.log('Images:', gltf.images);
  console.log('Materials:', JSON.stringify(gltf.materials, null, 2));
  for (const mesh of gltf.meshes) {
    for (const primitive of mesh.primitives) {
       if (primitive.attributes.POSITION !== undefined) {
           const accessor = gltf.accessors[primitive.attributes.POSITION];
           console.log(`Box: MIN=${accessor.min} MAX=${accessor.max}`);
       }
    }
  }
}
