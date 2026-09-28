import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useGraph, useLoader } from '@react-three/fiber';
import { OrbitControls, Text, useCursor, useGLTF, useAnimations, Clone, Html, useFBX } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { UserRole } from '../../types';
import { Settings, X } from 'lucide-react';
import { VRMAvatar as SharedVRMAvatar } from '../common/VRMAvatar';
import { authService } from '../../services/authService';

interface Campus3DViewProps {
  userRole: UserRole;
  userId?: string;
  onNavigate: (tab: string) => void;
  isActive: boolean;
}

// -----------------------------------------
// Types & Constants
// -----------------------------------------

type Destination = {
  id: string;
  name: string;
  tab: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  modelUrl: string;
  allowedRoles: UserRole[];
};

const DESTINATIONS: Destination[] = [
  { id: 'admin', name: 'Administration', tab: 'dashboard', position: [0, 0, -18], rotation: [0, 0, 0], scale: [10, 10, 10], color: '#fca5a5', modelUrl: '/models/city/building-type-i.glb', allowedRoles: ['ADMIN', 'TEACHER'] },
  { id: 'classrooms', name: 'Academic Building', tab: 'classes', position: [-20, 0, 0], rotation: [0, Math.PI / 2, 0], scale: [6.5, 6.5, 6.5], color: '#93c5fd', modelUrl: '/models/academic_building.glb', allowedRoles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
  { id: 'library', name: 'Library', tab: 'library', position: [20, 0, 0], rotation: [0, -Math.PI / 2, 0], scale: [10, 10, 10], color: '#fcd34d', modelUrl: '/models/city/building-type-e.glb', allowedRoles: ['ADMIN', 'LIBRARIAN', 'STUDENT', 'TEACHER'] },
  { id: 'finance', name: 'Finance Office', tab: 'fees', position: [14, 0, 18], rotation: [0, Math.PI, 0], scale: [10, 10, 10], color: '#86efac', modelUrl: '/models/city/building-type-c.glb', allowedRoles: ['ADMIN', 'ACCOUNTANT', 'STUDENT', 'PARENT'] },
  { id: 'services', name: 'Student Services', tab: 'student_services', position: [-14, 0, 18], rotation: [0, Math.PI, 0], scale: [10, 10, 10], color: '#d8b4fe', modelUrl: '/models/city/building-type-d.glb', allowedRoles: ['ADMIN', 'TEACHER', 'STUDENT'] },
];

const START_POS: [number, number, number] = [0, 0, 8];
const PLAYER_SPEED = 8;
const REACH_RADIUS = 4.0;

// Preload models
DESTINATIONS.forEach(d => useGLTF.preload(d.modelUrl));
useGLTF.preload('/models/nature/BirchTree_1.gltf');
useGLTF.preload('/models/nature/Bush_Large.gltf');
useGLTF.preload('/models/nature/Flower_1_Clump.gltf');

// -----------------------------------------
// Helper: Checks Access
// -----------------------------------------
const hasAccess = (dest: Destination, role: UserRole) => {
  return dest.allowedRoles.includes(role);
};

// -----------------------------------------
// Components
// -----------------------------------------

// Original Placeholder Avatar
const ChibiAvatar = ({ position, rotation, isMoving, gender }: { position: THREE.Vector3, rotation: number, isMoving: boolean, gender: 'boy' | 'girl' | 'robot' }) => {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (isMoving) {
      const time = state.clock.getElapsedTime();
      const stride = Math.sin(time * 15) * 0.5;
      if (leftLegRef.current) leftLegRef.current.rotation.x = stride;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -stride;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -stride;
      if (rightArmRef.current) rightArmRef.current.rotation.x = stride;
    } else {
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0;
    }
    if (groupRef.current) {
      groupRef.current.position.copy(position);
      groupRef.current.rotation.y = rotation;
      groupRef.current.position.y = isMoving ? Math.abs(Math.sin(state.clock.getElapsedTime() * 15)) * 0.2 : 0;
    }
  });

  const skinColor = "#ffcd94";
  const shirtColor = gender === 'girl' ? '#ec4899' : '#3b82f6';
  const hairColor = gender === 'girl' ? '#451a03' : '#1e3a8a';
  
  return (
    <group ref={groupRef}>
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.8, 1, 32]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.5} />
      </mesh>
      <group position={[0, 1, 0]}>
        <mesh position={[0, 1.2, 0]} castShadow>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        {gender === 'girl' ? (
           <mesh position={[0, 1.4, -0.1]} castShadow>
             <sphereGeometry args={[0.65, 16, 16]} />
             <meshStandardMaterial color={hairColor} />
           </mesh>
        ) : (
           <mesh position={[0, 1.5, 0]} castShadow>
             <coneGeometry args={[0.65, 0.8, 8]} />
             <meshStandardMaterial color={hairColor} />
           </mesh>
        )}
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.8, 0.8, 0.5]} />
          <meshStandardMaterial color={shirtColor} />
        </mesh>
        <mesh position={[0, 0.3, 0.3]} castShadow>
          <boxGeometry args={[0.6, 0.7, 0.3]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh ref={leftArmRef} position={[-0.6, 0.3, 0]} castShadow>
          <boxGeometry args={[0.2, 0.7, 0.2]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        <mesh ref={rightArmRef} position={[0.6, 0.3, 0]} castShadow>
          <boxGeometry args={[0.2, 0.7, 0.2]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        <mesh ref={leftLegRef} position={[-0.2, -0.4, 0]} castShadow>
          <boxGeometry args={[0.3, 0.6, 0.3]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh ref={rightLegRef} position={[0.2, -0.4, 0]} castShadow>
          <boxGeometry args={[0.3, 0.6, 0.3]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>
    </group>
  );
};

// Error Boundary for Avatar
interface AvatarErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

class AvatarErrorBoundary extends React.Component<AvatarErrorBoundaryProps, { hasError: boolean }> {
  constructor(props: AvatarErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Avatar failed to load:", error);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Animated GLB Avatar loader and player
const AnimatedAvatar = ({ url, position, rotation, isMoving }: { url: string, position: THREE.Vector3, rotation: number, isMoving: boolean }) => {
  const group = useRef<THREE.Group>(null);
  
  const gltf = useGLTF(url);
  const scene = Array.isArray(gltf) ? gltf[0].scene : gltf.scene;
  const animations = Array.isArray(gltf) ? gltf[0].animations : gltf.animations;
  // We need to clone the scene properly so multiple instantiations don't share skeleton state if needed
  // But we only have one player, so scene is fine to use directly if properly deep cloned.
  const clone = React.useMemo(() => {
    // deep clone to allow proper animation
    const c = scene.clone();
    c.traverse((node: THREE.Object3D) => {
       if ((node as THREE.Mesh).isMesh) {
         node.castShadow = true;
       }
    });
    return c;
  }, [scene]);

  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    if (!actions || names.length === 0) return;
    
    // Attempt to match names (e.g., 'Idle', 'Walk', 'Run')
    const walkName = names.find(n => n.toLowerCase().includes('walk')) || names[0];
    const idleName = names.find(n => n.toLowerCase().includes('idle')) || names[0];
    
    const currentActionName = isMoving ? walkName : idleName;
    const currentAction = currentActionName ? actions[currentActionName] : null;
    
    if (currentAction) {
      currentAction.reset().fadeIn(0.2).play();
    }
    
    return () => {
      if (currentAction) {
        currentAction.fadeOut(0.2);
      }
    };
  }, [isMoving, actions, names]);

  useFrame((state) => {
    if (group.current) {
      // Sync root motion with our physics controller
      group.current.position.copy(position);
      
      // Smooth turning
      const targetQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotation);
      group.current.quaternion.slerp(targetQuat, 0.15);
    }
  });

  return (
    <group ref={group}>
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.8, 1, 32]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.5} />
      </mesh>
      <primitive object={clone} />
    </group>
  );
};

// Animated VRM Avatar loader
const AnimatedVRMAvatar = ({ url, position, rotation, isMoving }: { url: string, position: THREE.Vector3, rotation: number, isMoving: boolean }) => {
  return <SharedVRMAvatar url={url} position={position} rotation={rotation} isMoving={isMoving} isAssistant={false} />;
};

// Animated FBX Avatar loader (Multiple files combined)
const AnimatedFBXAvatar = ({ idleUrl, walkUrl, position, rotation, isMoving }: { idleUrl: string, walkUrl: string, position: THREE.Vector3, rotation: number, isMoving: boolean }) => {
  const group = useRef<THREE.Group>(null);
  
  const idleFbx = useFBX(idleUrl);
  const walkFbx = useFBX(walkUrl);
  
  const clone = React.useMemo(() => {
    // deep clone the idle fbx which contains our mesh and rig
    const c = idleFbx.clone(true);
    c.traverse((node: THREE.Object3D) => {
       if ((node as THREE.Mesh).isMesh) {
         node.castShadow = true;
       }
    });
    return c;
  }, [idleFbx]);

  const combinedAnimations = React.useMemo(() => {
    // Force exact names to avoid naming convention assumptions
    const idles = (idleFbx.animations || []).map(a => { 
      const ac = a.clone(); ac.name = 'Idle'; return ac; 
    });
    const walks = (walkFbx.animations || []).map(a => { 
      const ac = a.clone(); ac.name = 'Walk'; return ac; 
    });
    return [...idles, ...walks];
  }, [idleFbx, walkFbx]);

  const { actions } = useAnimations(combinedAnimations, group);

  useEffect(() => {
    if (!actions) return;
    
    // Explicitly use the mapped names
    const currentActionName = isMoving ? 'Walk' : 'Idle';
    const currentAction = actions[currentActionName];
    
    if (currentAction) {
      currentAction.reset().fadeIn(0.2).play();
    }
    
    return () => {
      if (currentAction) {
        currentAction.fadeOut(0.2);
      }
    };
  }, [isMoving, actions]);

  useFrame(() => {
    if (group.current) {
      // Sync root motion with our physics controller
      group.current.position.copy(position);
      
      // Smooth turning
      const targetQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotation);
      group.current.quaternion.slerp(targetQuat, 0.15);
    }
  });

  return (
    <group ref={group}>
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.8, 1, 32]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.5} />
      </mesh>
      <primitive object={clone} scale={0.01} />
    </group>
  );
};

const SafePlayerAvatar = ({ position, rotation, isMoving, gender, status }: { position: THREE.Vector3, rotation: number, isMoving: boolean, gender: 'boy' | 'girl' | 'robot', status: string }) => {
  if (status === 'unavailable' || status === 'loading') {
     return <ChibiAvatar position={position} rotation={rotation} isMoving={isMoving} gender={gender} />;
  }

  const fallbackAvatar = <ChibiAvatar position={position} rotation={rotation} isMoving={isMoving} gender={gender} />;

  return (
    <AvatarErrorBoundary fallback={fallbackAvatar}>
      <React.Suspense fallback={fallbackAvatar}>
         {status === 'ready-vrm' ? (
           <AnimatedVRMAvatar
             url={`/models/avatars/${gender}.vrm`}
             position={position}
             rotation={rotation}
             isMoving={isMoving}
           />
         ) : status === 'ready-fbx' ? (
           <AnimatedFBXAvatar 
             idleUrl={`/models/avatars/${gender}-idle.fbx`} 
             walkUrl={`/models/avatars/${gender}-walk.fbx`} 
             position={position} 
             rotation={rotation} 
             isMoving={isMoving} 
           />
         ) : (
           <AnimatedAvatar 
             url={gender === 'robot' ? '/models/RobotExpressive.glb' : `/models/avatars/${gender}.glb`} 
             position={position} 
             rotation={rotation} 
             isMoving={isMoving} 
           />
         )}
      </React.Suspense>
    </AvatarErrorBoundary>
  );
};

const NatureProp = ({ url, position, scale = [1, 1, 1], rotation = [0, 0, 0] }: any) => {
  const gltf = useGLTF(url);
  const scene = Array.isArray(gltf) ? gltf[0].scene : gltf.scene;
  return (
    <group position={position} scale={scale} rotation={rotation}>
      <Clone object={scene} castShadow />
    </group>
  );
};

const BuildingNode = ({ dest, onClick, role }: { dest: Destination, onClick: () => void, role: UserRole }) => {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  const access = hasAccess(dest, role);
  
  const gltf = useGLTF(dest.modelUrl);
  const scene = Array.isArray(gltf) ? gltf[0].scene : gltf.scene;

  const yOffset = dest.id === 'classrooms' ? 0.54 : 0;
  const entranceOffset = dest.id === 'classrooms' ? 8 : 6;

  return (
    <group position={dest.position}>
      {/* Invisible Collision Box & Interaction */}
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        position={[0, 3.5, 0]}
        visible={false}
      >
        <boxGeometry args={[12, 7, 10]} />
        <meshBasicMaterial color="red" wireframe />
      </mesh>

      <group rotation={dest.rotation}>
        {/* Shared GLB Model */}
        <group position={[0, yOffset, 0]} scale={dest.scale}>
          <Clone object={scene} castShadow receiveShadow />
        </group>

        {/* Subtle Entrance Marker instead of large pad */}
        <mesh position={[0, 0.02, entranceOffset - 1.5]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
          <planeGeometry args={[4, 3]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        <mesh position={[0, 0.03, entranceOffset - 1.5]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
          <planeGeometry args={[3.6, 2.6]} />
          <meshStandardMaterial color={dest.color} opacity={0.6} transparent />
        </mesh>

        {/* Props around the building */}
        {dest.id === 'library' && (
          <group position={[-6, 0, 5]}>
            <NatureProp url="/models/nature/BirchTree_1.gltf" position={[0, 0, 0]} scale={[1.5, 1.5, 1.5]} />
            <NatureProp url="/models/nature/Bush_Large.gltf" position={[2, 0.8, 1]} scale={[0.8, 0.8, 0.8]} />
            <mesh position={[0, 0.4, 3]} castShadow>
               <boxGeometry args={[2, 0.2, 0.8]} />
               <meshStandardMaterial color="#fbbf24" />
            </mesh>
            <mesh position={[0, 0.2, 3]} castShadow>
               <boxGeometry args={[1.6, 0.4, 0.5]} />
               <meshStandardMaterial color="#475569" />
            </mesh>
          </group>
        )}

        {dest.id !== 'library' && (
           <group position={[-4, 0, entranceOffset - 1]}>
             <NatureProp url="/models/nature/Flower_1_Clump.gltf" position={[0, 0, 0]} scale={[0.5, 0.5, 0.5]} />
           </group>
        )}
        <group position={[4, 0, entranceOffset - 1]}>
          <NatureProp url="/models/nature/Bush_Large.gltf" position={[0, 0.8, 0]} scale={[0.8, 0.8, 0.8]} />
        </group>
      </group>

      {/* Floating Sign - Outside rotation group so it doesn't get mirrored */}
      <group position={[
         Math.sin(dest.rotation[1]) * entranceOffset, 
         12, 
         Math.cos(dest.rotation[1]) * entranceOffset
      ]}>
        <Html center style={{ pointerEvents: 'none' }}>
           <div className="bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-lg border border-slate-200 text-center min-w-max pointer-events-none">
             <div className="font-bold text-slate-800 text-sm tracking-wide">{dest.name}</div>
             {!access && <div className="text-[10px] text-red-500 font-bold uppercase">No Access</div>}
           </div>
        </Html>
      </group>
    </group>
  );
};

const CampusScene = ({ 
  userRole, 
  onArrival,
  isActive,
  gender,
  onPlayerUpdate,
  controlsDisabled
}: { 
  userRole: UserRole, 
  onArrival: (dest: Destination) => void,
  isActive: boolean,
  gender: 'boy' | 'girl' | 'robot',
  status: string,
  onPlayerUpdate: (pos: THREE.Vector3, rot: number) => void,
  controlsDisabled: boolean
}) => {
  const [playerPos, setPlayerPos] = useState<THREE.Vector3>(new THREE.Vector3(...START_POS));
  const [playerRot, setPlayerRot] = useState(0);
  const [targetPos, setTargetPos] = useState<THREE.Vector3 | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  
  const [keys, setKeys] = useState({ w: false, a: false, s: false, d: false, up: false, down: false, left: false, right: false });

  // Handle keyboard inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (controlsDisabled || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        setTargetPos(null);
      }
      setKeys(k => ({ ...k, [key.replace('arrow', '')]: true }));
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setKeys(k => ({ ...k, [key.replace('arrow', '')]: false }));
    };
    const handleBlur = () => {
      setKeys({ w: false, a: false, s: false, d: false, up: false, down: false, left: false, right: false });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [controlsDisabled]);

  // Clear keys if controls get disabled
  useEffect(() => {
    if (controlsDisabled) {
      setKeys({ w: false, a: false, s: false, d: false, up: false, down: false, left: false, right: false });
      setTargetPos(null);
    }
  }, [controlsDisabled]);

  useFrame((state, delta) => {
    if (!isActive) return;

    const moveDir = new THREE.Vector3(0, 0, 0);
    
    if (keys.w || keys.up) moveDir.z -= 1;
    if (keys.s || keys.down) moveDir.z += 1;
    if (keys.a || keys.left) moveDir.x -= 1;
    if (keys.d || keys.right) moveDir.x += 1;

    let walking = false;
    let newPos = playerPos.clone();

    if (moveDir.length() > 0) {
      walking = true;
      moveDir.normalize();
      newPos.add(moveDir.multiplyScalar(PLAYER_SPEED * delta));
      setPlayerRot(Math.atan2(moveDir.x, moveDir.z));
    } else if (targetPos) {
      const toTarget = targetPos.clone().sub(playerPos);
      if (toTarget.length() > 0.1) {
        walking = true;
        toTarget.normalize();
        newPos.add(toTarget.multiplyScalar(PLAYER_SPEED * delta));
        setPlayerRot(Math.atan2(toTarget.x, toTarget.z));
      } else {
        setTargetPos(null);
      }
    }

    newPos.x = Math.max(-30, Math.min(30, newPos.x));
    newPos.z = Math.max(-30, Math.min(30, newPos.z));

    let collided = false;
    for (const dest of DESTINATIONS) {
      const localPos = newPos.clone().sub(new THREE.Vector3(...dest.position));
      const axis = new THREE.Vector3(0, 1, 0);
      localPos.applyAxisAngle(axis, -dest.rotation[1]);
      
      const dx = Math.abs(localPos.x);
      const dz = Math.abs(localPos.z);
      // Bounding box size: width ~10, depth ~8
      if (dx < 5 && dz < 4) {
        collided = true;
        break;
      }
    }

    if (!collided) {
      setPlayerPos(newPos);
      onPlayerUpdate(newPos, playerRot);
    } else if (walking && !targetPos) {
       walking = false;
    }

    setIsMoving(walking);

    let arrivedDest: Destination | null = null;
    for (const dest of DESTINATIONS) {
      const entranceOffset = dest.id === 'classrooms' ? 8 : 6;
      const entrancePos = new THREE.Vector3(0, 0, entranceOffset);
      entrancePos.applyAxisAngle(new THREE.Vector3(0, 1, 0), dest.rotation[1]);
      entrancePos.add(new THREE.Vector3(...dest.position));
      
      const dist = newPos.distanceTo(entrancePos);
      if (dist < REACH_RADIUS) {
        arrivedDest = dest;
        break;
      }
    }

    if (arrivedDest && !keys.w && !keys.a && !keys.s && !keys.d && !keys.up && !keys.down && !keys.left && !keys.right) {
      if (targetPos) setTargetPos(null);
      onArrival(arrivedDest);
    } else if (!arrivedDest) {
      onArrival(null as any);
    }
  });

  const handleGroundClick = (e: any) => {
    if (controlsDisabled) return;
    e.stopPropagation();
    setTargetPos(e.point);
  };

  return (
    <>
      <OrbitControls makeDefault maxPolarAngle={Math.PI / 2.5} minPolarAngle={Math.PI / 6} minDistance={25} maxDistance={80} target={[0, 0, 0]} enabled={!controlsDisabled} />
      
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 40, 20]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-40} shadow-camera-right={40} shadow-camera-top={40} shadow-camera-bottom={-40} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} onClick={handleGroundClick} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#86efac" />
      </mesh>

      {/* Central Courtyard Paving */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} onClick={handleGroundClick} receiveShadow>
         <planeGeometry args={[14, 14]} />
         <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      
      {/* Paths */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -11]} onClick={handleGroundClick} receiveShadow>
         <planeGeometry args={[4, 10]} />
         <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-11, 0.005, 0]} onClick={handleGroundClick} receiveShadow>
         <planeGeometry args={[10, 4]} />
         <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[11, 0.005, 0]} onClick={handleGroundClick} receiveShadow>
         <planeGeometry args={[10, 4]} />
         <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[6, 0.005, 10]} onClick={handleGroundClick} receiveShadow>
         <planeGeometry args={[4, 8]} />
         <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[12, 0.005, 13]} onClick={handleGroundClick} receiveShadow>
         <planeGeometry args={[4, 6]} />
         <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-6, 0.005, 10]} onClick={handleGroundClick} receiveShadow>
         <planeGeometry args={[4, 8]} />
         <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-12, 0.005, 13]} onClick={handleGroundClick} receiveShadow>
         <planeGeometry args={[4, 6]} />
         <meshStandardMaterial color="#e2e8f0" />
      </mesh>

      {/* Courtyard Trees */}
      <NatureProp url="/models/nature/BirchTree_1.gltf" position={[-5, 0, -5]} scale={[1.2, 1.2, 1.2]} />
      <NatureProp url="/models/nature/BirchTree_1.gltf" position={[5, 0, -5]} scale={[1.2, 1.2, 1.2]} />
      <NatureProp url="/models/nature/BirchTree_1.gltf" position={[-5, 0, 5]} scale={[1.2, 1.2, 1.2]} />
      <NatureProp url="/models/nature/BirchTree_1.gltf" position={[5, 0, 5]} scale={[1.2, 1.2, 1.2]} />

      {DESTINATIONS.map(dest => (
        <BuildingNode 
          key={dest.id} 
          dest={dest} 
          role={userRole} 
          onClick={() => {
            if (controlsDisabled) return;
            const entranceOffset = dest.id === 'classrooms' ? 8 : 6;
            const entrancePos = new THREE.Vector3(0, 0, entranceOffset);
            entrancePos.applyAxisAngle(new THREE.Vector3(0, 1, 0), dest.rotation[1]);
            entrancePos.add(new THREE.Vector3(...dest.position));
            setTargetPos(entrancePos);
          }} 
        />
      ))}

      <SafePlayerAvatar position={playerPos} rotation={playerRot} isMoving={isMoving} gender={gender} status={status} />
    </>
  );
};

export const Campus3DView: React.FC<Campus3DViewProps> = ({ userRole, userId, onNavigate, isActive }) => {
  const [arrivedAt, setArrivedAt] = useState<Destination | null>(null);
  const [webGLFailed, setWebGLFailed] = useState(false);
  const [gender, setGender] = useState<'boy' | 'girl' | 'robot'>('girl');
  const [playerPos, setPlayerPos] = useState({ x: 0, z: 8 });
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [tempGender, setTempGender] = useState<'boy' | 'girl' | 'robot'>('girl');
  const [avatarStatus, setAvatarStatus] = useState<Record<string, string>>({ boy: 'loading', girl: 'loading', robot: 'loading' });

  // Load persistence
  useEffect(() => {
    const key = userId ? `avatarAppearance_${userId}` : 'avatarAppearance';
    const saved = localStorage.getItem(key) as 'boy' | 'girl' | 'robot';
    if (saved === 'boy' || saved === 'girl' || saved === 'robot') {
      setGender(saved);
      setTempGender(saved);
    }
    
    const handleStorage = () => {
      const key = userId ? `avatarAppearance_${userId}` : 'avatarAppearance';
      const updated = localStorage.getItem(key) as 'boy' | 'girl' | 'robot';
      if (updated) setGender(updated);
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('avatarAppearanceChanged', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('avatarAppearanceChanged', handleStorage);
    };
  }, [userId]);

  // Check model availability
  useEffect(() => {
    const checkAvailability = async () => {
      for (const g of ['boy', 'girl']) {
        try {
          // Check for VRM
          const vrmFileName = `${g}.vrm`;
          const resVrm = await fetch(`/models/avatars/${vrmFileName}`, { method: 'HEAD' });
          if (resVrm.ok && !resVrm.headers.get('content-type')?.includes('text/html')) {
            try {
              const loader = new GLTFLoader();
              loader.register((parser: any) => new VRMLoaderPlugin(parser) as any);
              await loader.loadAsync(`/models/avatars/${vrmFileName}`);
              setAvatarStatus(prev => ({ ...prev, [g]: 'ready-vrm' }));
              continue;
            } catch (e) {
              console.error(`VRM parsing failed for ${g}:`, e);
              // Fall through
            }
          }

          // Check for dual FBX (idle/walk)
          const resIdle = await fetch(`/models/avatars/${g}-idle.fbx`, { method: 'HEAD' });
          const resWalk = await fetch(`/models/avatars/${g}-walk.fbx`, { method: 'HEAD' });
          if (resIdle.ok && resWalk.ok && 
              !resIdle.headers.get('content-type')?.includes('text/html') && 
              !resWalk.headers.get('content-type')?.includes('text/html')) {
            setAvatarStatus(prev => ({ ...prev, [g]: 'ready-fbx' }));
            continue;
          }

          // Fallback to check for single GLB
          const resGlb = await fetch(`/models/avatars/${g}.glb`, { method: 'HEAD' });
          if (resGlb.ok && !resGlb.headers.get('content-type')?.includes('text/html')) {
            setAvatarStatus(prev => ({ ...prev, [g]: 'ready-glb' }));
            continue;
          }
          
          setAvatarStatus(prev => ({ ...prev, [g]: 'unavailable' }));
        } catch {
          setAvatarStatus(prev => ({ ...prev, [g]: 'unavailable' }));
        }
      }

      // Check Robot
      try {
        const resRobot = await fetch(`/models/RobotExpressive.glb`, { method: 'HEAD' });
        if (resRobot.ok && !resRobot.headers.get('content-type')?.includes('text/html')) {
          setAvatarStatus(prev => ({ ...prev, robot: 'ready-glb' }));
        } else {
          setAvatarStatus(prev => ({ ...prev, robot: 'unavailable' }));
        }
      } catch {
        setAvatarStatus(prev => ({ ...prev, robot: 'unavailable' }));
      }
    };
    
    checkAvailability();
  }, []);

  const handleApplyAvatar = () => {
    setGender(tempGender);
    const key = userId ? `avatarAppearance_${userId}` : 'avatarAppearance';
    localStorage.setItem(key, tempGender);
    window.dispatchEvent(new Event('avatarAppearanceChanged'));
    setIsPickerOpen(false);
  };

  const handleCancelAvatar = () => {
    setTempGender(gender);
    setIsPickerOpen(false);
  };

  return (
    <div className="w-full h-full relative bg-sky-100 flex flex-col rounded-xl overflow-hidden border border-slate-200">
      
      {webGLFailed ? (
         <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <h2 className="text-xl font-bold text-slate-800 mb-2">3D Campus Unavailable</h2>
            <p className="text-slate-600 mb-6">Your device or browser does not support WebGL, or an error occurred.</p>
            <button onClick={() => onNavigate('dashboard')} className="px-6 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700">
              Return to Normal Dashboard
            </button>
         </div>
      ) : (
        <div className="flex-1 relative">
          <Canvas 
             camera={{ position: [0, 45, 60], fov: 45 }}
             onCreated={(state) => {
               state.gl.localClippingEnabled = true;
             }}
             onError={() => setWebGLFailed(true)}
             frameloop={isActive ? 'always' : 'never'}
             shadows
          >
            <React.Suspense fallback={<Html center><div className="bg-white p-4 rounded-xl shadow-lg font-bold text-teal-600 animate-pulse">Loading Assets...</div></Html>}>
              <CampusScene 
                userRole={userRole} 
                isActive={isActive} 
                gender={gender}
                status={avatarStatus[gender]}
                controlsDisabled={isPickerOpen}
                onArrival={(dest) => {
                   setArrivedAt(prev => prev?.id !== dest?.id ? dest : prev);
                }}
                onPlayerUpdate={(pos) => {
                   setPlayerPos({ x: pos.x, z: pos.z });
                }}
              />
            </React.Suspense>
          </Canvas>

          {/* Top Info Bar */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur p-3 rounded-xl shadow-lg border border-slate-200 pointer-events-none">
             <h3 className="font-bold text-slate-800 text-sm">3D Campus Map</h3>
             <p className="text-xs text-slate-600">Use WASD/Arrows to move, or click/tap a destination.</p>
          </div>

          {/* Settings / Avatar Picker Toggle */}
          <div className="absolute top-4 right-4">
             <button 
               onClick={() => { setIsPickerOpen(true); setTempGender(gender); }}
               className="bg-white/90 backdrop-blur p-2.5 rounded-full shadow-lg border border-slate-200 hover:bg-slate-50 transition-colors"
               title="Customize Avatar"
             >
               <Settings className="w-5 h-5 text-slate-700" />
             </button>
          </div>

          {/* Avatar Picker Modal */}
          {isPickerOpen && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
               <div className="bg-white rounded-2xl shadow-2xl p-6 w-96 max-w-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Choose Avatar</h2>
                    <button onClick={handleCancelAvatar} className="p-1 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-500" /></button>
                  </div>

                  <div className="flex gap-4 mb-8">
                     <button 
                       onClick={() => setTempGender('boy')}
                       className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${tempGender === 'boy' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-teal-300'}`}
                     >
                       <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-blue-200">
                         {/* Simple visual representation for picker UI */}
                         <div className="w-8 h-8 rounded-full bg-[#ffcd94] relative">
                           <div className="absolute -top-1 w-8 h-4 rounded-t-full bg-[#1e3a8a]"></div>
                         </div>
                       </div>
                       <span className={`font-semibold ${tempGender === 'boy' ? 'text-teal-700' : 'text-slate-600'}`}>Boy</span>
                       <span className="text-[10px] text-slate-400 font-medium">
                         {avatarStatus.boy === 'ready-vrm' ? 'VRM Procedural' : avatarStatus.boy.startsWith('ready') ? 'Custom 3D Model' : avatarStatus.boy === 'loading' ? 'Checking...' : 'Procedural Fallback'}
                       </span>
                     </button>
                     
                     <button 
                       onClick={() => setTempGender('girl')}
                       className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${tempGender === 'girl' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-teal-300'}`}
                     >
                       <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center overflow-hidden border-2 border-pink-200">
                         <div className="w-8 h-8 rounded-full bg-[#ffcd94] relative">
                           <div className="absolute -top-1 w-9 h-6 rounded-t-full bg-[#451a03] -left-0.5"></div>
                         </div>
                       </div>
                       <span className={`font-semibold ${tempGender === 'girl' ? 'text-teal-700' : 'text-slate-600'}`}>Girl</span>
                       <span className="text-[10px] text-slate-400 font-medium">
                         {avatarStatus.girl === 'ready-vrm' ? 'VRM Procedural' : avatarStatus.girl.startsWith('ready') ? 'Custom 3D Model' : avatarStatus.girl === 'loading' ? 'Checking...' : 'Procedural Fallback'}
                       </span>
                     </button>
                  </div>
                  
                  <div className="flex gap-4 mb-8">
                     <button 
                       onClick={() => setTempGender('robot')}
                       className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${tempGender === 'robot' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-teal-300'}`}
                     >
                       <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-slate-300">
                         <div className="w-8 h-8 rounded-md bg-[#64748b] relative">
                           <div className="absolute top-2 left-1 w-2 h-2 rounded-full bg-[#38bdf8]"></div>
                           <div className="absolute top-2 right-1 w-2 h-2 rounded-full bg-[#38bdf8]"></div>
                         </div>
                       </div>
                       <span className={`font-semibold ${tempGender === 'robot' ? 'text-teal-700' : 'text-slate-600'}`}>Temporary Robot</span>
                       <span className="text-[10px] text-slate-400 font-medium">
                         {avatarStatus.robot === 'ready-glb' ? 'GLB Model Available' : 'Unavailable'}
                       </span>
                     </button>
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <button onClick={handleCancelAvatar} className="flex-1 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleApplyAvatar} className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-md">
                      Apply Choice
                    </button>
                  </div>
               </div>
            </div>
          )}
          
          {/* Minimap */}
          <div className="absolute bottom-4 right-4 w-48 h-48 bg-white/95 rounded-xl shadow-lg border-2 border-slate-300 overflow-hidden">
            <div className="relative w-full h-full bg-green-100/50 pointer-events-none">
              {/* Paths in Minimap */}
              <div className="absolute w-full h-[15%] bg-slate-300 top-[35%] left-0 opacity-50" />
              <div className="absolute h-full w-[15%] bg-slate-300 top-0 left-[42.5%] opacity-50" />

              {/* Destinations */}
              {DESTINATIONS.map(d => {
                const mapScale = (val: number) => ((val + 30) / 60) * 100;
                return (
                  <div 
                    key={d.id}
                    className="absolute w-8 h-6 opacity-90 rounded-sm shadow-sm flex items-center justify-center"
                    style={{
                      backgroundColor: d.color,
                      left: `${mapScale(d.position[0])}%`,
                      top: `${mapScale(d.position[2])}%`,
                      transform: `translate(-50%, -50%) rotate(${-d.rotation[1]}rad)`,
                      border: arrivedAt?.id === d.id ? '2px solid black' : '1px solid rgba(0,0,0,0.2)'
                    }}
                  >
                     <span className="text-[8px] font-bold text-slate-800" style={{ transform: `rotate(${d.rotation[1]}rad)` }}>
                        {d.name.substring(0, 3)}
                     </span>
                  </div>
                );
              })}
              
              {/* Player Dot */}
              <div 
                className="absolute w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-md z-10 transition-all duration-75"
                style={{
                  left: `${((playerPos.x + 30) / 60) * 100}%`,
                  top: `${((playerPos.z + 30) / 60) * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            </div>
          </div>

          {/* Arrived Modal / Workspace Action */}
          {arrivedAt && !isPickerOpen && (
             <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white p-5 rounded-2xl shadow-2xl border-2 border-teal-500 flex flex-col items-center text-center animate-bounce-short z-40">
               <h3 className="font-bold text-lg text-slate-900 mb-1">{arrivedAt.name}</h3>
               {hasAccess(arrivedAt, userRole) ? (
                  <>
                    <p className="text-sm text-slate-600 mb-4">You have arrived. Open workspace?</p>
                    <button 
                      onClick={() => {
                        let targetTab = arrivedAt.tab;
                        if (arrivedAt.id === 'classrooms') {
                           if (userRole === 'STUDENT' || userRole === 'PARENT') targetTab = 'dashboard';
                           else targetTab = 'classes';
                        }
                        onNavigate(targetTab);
                      }}
                      className="px-6 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-md transition-all active:scale-95"
                    >
                      Enter {arrivedAt.name}
                    </button>
                  </>
               ) : (
                  <>
                    <p className="text-sm text-red-600 font-semibold mb-2">Access Denied</p>
                    <p className="text-xs text-slate-500">Your role ({userRole}) does not have permission.</p>
                  </>
               )}
             </div>
          )}
        </div>
      )}
    </div>
  );
};
