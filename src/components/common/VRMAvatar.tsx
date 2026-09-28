import React, { useRef, useEffect } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';

export const VRMAvatar = ({ url, position = new THREE.Vector3(0, 0, 0), rotation = 0, isMoving = false, isAssistant = false }: { url: string, position?: THREE.Vector3, rotation?: number, isMoving?: boolean, isAssistant?: boolean }) => {
  const group = useRef<THREE.Group>(null);
  
  const gltf = useLoader(GLTFLoader, isAssistant ? `${url}?assistant=1` : url, (loader: any) => {
    loader.crossOrigin = 'anonymous';
    loader.register((parser: any) => new VRMLoaderPlugin(parser) as any);
  });

  const vrm = gltf.userData.vrm;
  
  useEffect(() => {
    if (gltf.scene) {
      gltf.scene.traverse((node: THREE.Object3D) => {
         if ((node as THREE.Mesh).isMesh) {
           node.castShadow = true;
           node.receiveShadow = true;
         }
      });
    }
  }, [gltf.scene]);

  useEffect(() => {
    if (vrm) {
      VRMUtils.removeUnnecessaryVertices(gltf.scene);
      VRMUtils.removeUnnecessaryJoints(gltf.scene);
      // VRM models inherently face +Z (towards the camera when it is at +Z).
      // We no longer apply a blanket Math.PI rotation here to preserve natural orientation.
    }
  }, [vrm, gltf.scene]);

  // Procedural Animation Fallback
  useFrame(({ clock }) => {
    if (group.current && !isAssistant) {
      // Sync root motion with physics controller only for campus
      group.current.position.copy(position);
      // Apply Math.PI correction ONLY to the campus movement heading
      const targetQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotation + Math.PI);
      group.current.quaternion.slerp(targetQuat, 0.15);
    } else if (group.current && isAssistant) {
      group.current.position.copy(position);
      group.current.rotation.y = rotation;
    }

    if (vrm && vrm.humanoid) {
      const time = clock.getElapsedTime();
      vrm.update(clock.getDelta()); // Update physics/spring bones

      const leftLeg = vrm.humanoid.getNormalizedBoneNode('leftUpperLeg');
      const rightLeg = vrm.humanoid.getNormalizedBoneNode('rightUpperLeg');
      const leftLowerLeg = vrm.humanoid.getNormalizedBoneNode('leftLowerLeg');
      const rightLowerLeg = vrm.humanoid.getNormalizedBoneNode('rightLowerLeg');
      const leftArm = vrm.humanoid.getNormalizedBoneNode('leftUpperArm');
      const rightArm = vrm.humanoid.getNormalizedBoneNode('rightUpperArm');
      const spine = vrm.humanoid.getNormalizedBoneNode('spine');

      if (isMoving && !isAssistant) {
        const speed = 10;
        if (leftLeg) leftLeg.rotation.x = Math.sin(time * speed) * 0.5;
        if (rightLeg) rightLeg.rotation.x = Math.sin(time * speed + Math.PI) * 0.5;
        if (leftLowerLeg) leftLowerLeg.rotation.x = Math.max(0, Math.sin(time * speed - Math.PI/2)) * 0.5;
        if (rightLowerLeg) rightLowerLeg.rotation.x = Math.max(0, Math.sin(time * speed + Math.PI - Math.PI/2)) * 0.5;
        if (leftArm) leftArm.rotation.x = Math.sin(time * speed + Math.PI) * 0.5;
        if (rightArm) rightArm.rotation.x = Math.sin(time * speed) * 0.5;
        if (spine) spine.rotation.x = 0;
      } else {
        // Idle breathing
        const idleSpeed = 2;
        if (leftLeg) leftLeg.rotation.x = 0;
        if (rightLeg) rightLeg.rotation.x = 0;
        if (leftLowerLeg) leftLowerLeg.rotation.x = 0;
        if (rightLowerLeg) rightLowerLeg.rotation.x = 0;
        
        // Gentle arm swing in a relaxed A-pose
        // Left arm points +X in T-pose, rotate -Z to drop down towards -Y
        if (leftArm) leftArm.rotation.z = Math.sin(time * idleSpeed) * 0.05 - 1.2;
        // Right arm points -X in T-pose, rotate +Z to drop down towards -Y
        if (rightArm) rightArm.rotation.z = -Math.sin(time * idleSpeed) * 0.05 + 1.2;
        if (leftArm) leftArm.rotation.x = 0;
        if (rightArm) rightArm.rotation.x = 0;
        
        // Gentle breathing (spine)
        if (spine) spine.rotation.x = Math.sin(time * idleSpeed) * 0.02;
      }

      // Blinking
      if (vrm.expressionManager) {
        const blinkTime = time % 4; // every 4 seconds
        let blinkWeight = 0;
        if (blinkTime > 3.8) { // 0.2s duration
           blinkWeight = Math.sin((blinkTime - 3.8) * 5 * Math.PI); // fast sine wave
        }
        vrm.expressionManager.setValue('blink', blinkWeight);
      }
    }
  });

  return (
    <group ref={group}>
      {!isAssistant && (
        <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[0.8, 1, 32]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.5} />
        </mesh>
      )}
      <primitive object={gltf.scene} />
    </group>
  );
};
