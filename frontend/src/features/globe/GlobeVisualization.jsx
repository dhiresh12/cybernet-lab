// Globe Components - Feature Module
import React, { useRef, useEffect, useState, useMemo, useImperativeHandle, forwardRef, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { generateNodes, generateArcs } from './globeData';

const GLOBE_RADIUS = 1.5;
const NODE_COUNT = 28;

const DESIGN_TOKENS = {
  primary: '#00E5FF',
  primaryDim: '#00BFFF',
  primaryBright: '#35CFFF',
  success: '#00ff88',
  warning: '#ffe600',
  error: '#ff3355',
  cyan: '#00E5FF',
  text: '#e6f7ff',
  muted: '#7fb8d4',
};

const STATUS_COLORS = {
  online: DESIGN_TOKENS.primary,
  warning: DESIGN_TOKENS.warning,
  critical: DESIGN_TOKENS.error,
  offline: DESIGN_TOKENS.muted,
};

const NODE_TYPE_SIZES = {
  core: 0.055,
  edge: 0.035,
  gateway: 0.045,
  datacenter: 0.065,
  endpoint: 0.028,
};

const Atmosphere = () => {
  const meshRef = useRef();
  const materialRef = useRef();
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} scale={[1.18, 1.18, 1.18]}>
      <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        side={THREE.BackSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
           uniforms={{
            uTime: { value: 0 },
            uColor1: { value: new THREE.Color(DESIGN_TOKENS.primary) },
            uColor2: { value: new THREE.Color(DESIGN_TOKENS.primaryBright) },
            uColor3: { value: new THREE.Color(DESIGN_TOKENS.primaryDim) },
          }}
        vertexShader={`
          varying vec3 vNormal;
          varying vec3 vWorldPosition;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec3 uColor1;
          uniform vec3 uColor2;
          uniform vec3 uColor3;
          varying vec3 vNormal;
          varying vec3 vWorldPosition;
          void main() {
            vec3 viewDir = normalize(cameraPosition - vWorldPosition);
            float intensity = pow(0.7 - dot(vNormal, viewDir), 2.5);
            float pulse = sin(uTime * 0.4 + vWorldPosition.y * 2.0) * 0.1 + 0.9;
            vec3 color = mix(uColor3, uColor1, intensity) * pulse;
            float fresnel = pow(1.0 - dot(vNormal, viewDir), 3.0);
            color += uColor2 * fresnel * 0.4;
            gl_FragColor = vec4(color, intensity * 0.45 * pulse);
          }
        `}
      />
    </mesh>
  );
};

const GlobeSurface = ({ paused }) => {
  const groupRef = useRef();
  const surfaceRef = useRef();
  const materialRef = useRef();
  const gridMaterialRef = useRef();
  
  useFrame((state, delta) => {
    if (groupRef.current && !paused) {
      groupRef.current.rotation.y += delta * 0.05;
    }
    if (surfaceRef.current && !paused) {
      surfaceRef.current.rotation.y += delta * 0.05;
    }
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    if (gridMaterialRef.current) {
      gridMaterialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={surfaceRef}>
        <sphereGeometry args={[GLOBE_RADIUS, 96, 96]} />
        <shaderMaterial
          ref={materialRef}
          uniforms={{
            uTime: { value: 0 },
            uOceanColor: { value: new THREE.Color(0x020f1c) },
            uLandColor: { value: new THREE.Color(0x041a2e) },
            uHighlightColor: { value: new THREE.Color(DESIGN_TOKENS.primary) },
            uGridColor: { value: new THREE.Color(DESIGN_TOKENS.primaryBright) },
            uRadius: { value: GLOBE_RADIUS },
          }}
          vertexShader={`
            varying vec3 vNormal;
            varying vec3 vPosition;
            varying vec2 vUv;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              vPosition = position;
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform float uTime;
            uniform vec3 uOceanColor;
            uniform vec3 uLandColor;
            uniform vec3 uHighlightColor;
            uniform vec3 uGridColor;
            uniform float uRadius;
            varying vec3 vNormal;
            varying vec3 vPosition;
            varying vec2 vUv;
            float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
            float noise(vec2 p) {
              vec2 i = floor(p);
              vec2 f = fract(p);
              f = f * f * (3.0 - 2.0 * f);
              return mix(mix(hash(i + vec2(0,0)), hash(i + vec2(1,0)), f.x),
                         mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
            }
            float fbm(vec2 p) {
              float v = 0.0, a = 0.5;
              for (int i = 0; i < 5; i++) {
                v += a * noise(p);
                p *= 2.0; a *= 0.5;
              }
              return v;
            }
            void main() {
              float lat = asin(vNormal.y);
              float lon = atan(vNormal.z, vNormal.x);
              vec2 uv = vec2(lon / (2.0 * 3.14159) + 0.5, lat / 3.14159 + 0.5);
              float land = fbm(uv * 8.0 + uTime * 0.01);
              land = smoothstep(0.45, 0.55, land);
              vec3 color = mix(uOceanColor, uLandColor, land);
              float grid = step(0.98, fract(vUv.x * 36.0)) + step(0.98, fract(vUv.y * 18.0));
              color += uGridColor * grid * 0.3 * (1.0 - land);
              float highlight = pow(max(0.0, dot(vNormal, normalize(vec3(0.5, 1.0, 0.3)))), 30.0);
              color += uHighlightColor * highlight * 0.4;
              float fresnel = pow(1.0 - dot(vNormal, normalize(cameraPosition - vPosition)), 2.5);
              color += uHighlightColor * fresnel * 0.15;
              gl_FragColor = vec4(color, 1.0);
            }
          `}
        />
      </mesh>
      
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 1.001, 96, 96]} />
        <shaderMaterial
          ref={gridMaterialRef}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={{
            uTime: { value: 0 },
            uGridColor: { value: new THREE.Color(DESIGN_TOKENS.primaryBright) },
            uRadius: { value: GLOBE_RADIUS },
          }}
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform float uTime;
            uniform vec3 uGridColor;
            varying vec2 vUv;
            void main() {
              float grid = step(0.97, fract(vUv.x * 48.0)) * step(0.99, fract(vUv.y * 24.0));
              float pulse = sin(uTime * 0.3 + vUv.y * 6.0) * 0.5 + 0.5;
              gl_FragColor = vec4(uGridColor, grid * 0.25 * pulse);
            }
          `}
        />
      </mesh>
    </group>
  );
};

const NetworkNode = React.memo(({ node, isHovered, isSelected, onPointerOver, onPointerOut, onClick }) => {
  const meshRef = useRef();
  const targetScale = useRef(1);
  const currentScale = useRef(1);
  
  useFrame(() => {
    if (meshRef.current) {
      targetScale.current = isHovered || isSelected ? 1.3 : 1;
      currentScale.current += (targetScale.current - currentScale.current) * 0.15;
      meshRef.current.scale.setScalar(currentScale.current);
      meshRef.current.lookAt(0, 0, 0);
    }
  });

  const statusColor = STATUS_COLORS[node.status] || DESIGN_TOKENS.primary;
  const size = NODE_TYPE_SIZES[node.type] || NODE_TYPE_SIZES.edge;

  return (
    <group onPointerOver={onPointerOver} onPointerOut={onPointerOut} onClick={onClick}>
      <mesh ref={meshRef} position={node.position}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial 
          color={statusColor} 
          emissive={statusColor} 
          emissiveIntensity={isHovered || isSelected ? 1.2 : 0.6}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      
      <mesh position={node.position}>
        <sphereGeometry args={[size * 2.2, 16, 16]} />
        <meshBasicMaterial
          color={statusColor}
          transparent
          opacity={0.15}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {(isHovered || isSelected) && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size * 2.5, size * 3.2, 32]} />
          <meshBasicMaterial
            color={DESIGN_TOKENS.primary}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
});

const NetworkArc = ({ from, to, intensity }) => {
  const lineRef = useRef();
  
  const points = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const distance = start.distanceTo(end);
    const mid = start.clone().add(end).multiplyScalar(0.5);
    const direction = end.clone().sub(start).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const perpendicular = direction.clone().cross(up).normalize();
    mid.add(perpendicular.multiplyScalar(distance * 0.25));
    mid.normalize().multiplyScalar(GLOBE_RADIUS * (1.0 + distance * 0.35));
    
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    return curve.getPoints(64);
  }, [from, to]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [points]);

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial
        color={DESIGN_TOKENS.primary}
        transparent
        opacity={intensity * 0.4}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </line>
  );
};

const DataPulse = ({ from, to, progress, color }) => {
  const meshRef = useRef();
  const trailRef = useRef();
  
  const position = useMemo(() => {
    const t = progress;
    const x = from[0] + (to[0] - from[0]) * t;
    const y = from[1] + (to[1] - from[1]) * t;
    const z = from[2] + (to[2] - from[2]) * t;
    return [x, y, z];
  }, [from, to, progress]);

  useFrame(() => {
    if (meshRef.current) {
      const pulse = Math.sin(progress * Math.PI) * 0.5 + 0.5;
      meshRef.current.scale.setScalar(0.8 + pulse * 0.6);
    }
  });

  const pulseColor = color || DESIGN_TOKENS.primary;

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.045, 12, 12]} />
      <meshBasicMaterial color={pulseColor} transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
};

const DataPulses = ({ nodes, arcs, paused }) => {
  const [pulses, setPulses] = useState([]);

  useEffect(() => {
    if (paused || arcs.length === 0) return;
    const interval = setInterval(() => {
      if (paused) return;
      const arc = arcs[Math.floor(Math.random() * arcs.length)];
      const fromNode = nodes[arc.from];
      const toNode = nodes[arc.to];
      if (!fromNode || !toNode) return;
      const pulseColor = fromNode.status === 'warning' || fromNode.status === 'critical' 
        ? fromNode.status 
        : toNode.status === 'warning' || toNode.status === 'critical'
          ? toNode.status
          : 'online';
      setPulses(prev => [...prev, { 
        id: Date.now(), 
        from: fromNode.position, 
        to: toNode.position, 
        progress: 0, 
        color: pulseColor,
        fromNode,
        toNode,
      }]);
    }, 400);
    return () => clearInterval(interval);
  }, [arcs, nodes, paused]);

  useFrame((state, delta) => {
    setPulses(prev => {
      const next = prev.map(p => ({ ...p, progress: Math.min(p.progress + delta * 1.5, 1) }))
        .filter(p => p.progress < 1);
      return next;
    });
  });

  return (
    <group>
      {pulses.map(p => (
        <DataPulse key={p.id} from={p.from} to={p.to} progress={p.progress} color={p.color} />
      ))}
    </group>
  );
};

const Scene = ({ 
  nodes, 
  arcs, 
  hoveredId, 
  selectedId, 
  paused, 
  onNodeHover, 
  onNodeSelect,
  controlsRef,
  performanceMode
}) => {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(0, 0.8, 4.5);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <>
      <ambientLight color={DESIGN_TOKENS.primaryBright} intensity={0.35} />
      <directionalLight position={[5, 8, 5]} color={DESIGN_TOKENS.primary} intensity={0.8} />
      <directionalLight position={[-5, -3, -5]} color={DESIGN_TOKENS.primaryDim} intensity={0.4} />
      <pointLight position={[0, 0, 0]} color={DESIGN_TOKENS.primary} intensity={0.3} />
      
      <Atmosphere />
      <GlobeSurface paused={paused} />
      
      <group name="nodes">
        {nodes.map(node => (
          <NetworkNode
            key={node.id}
            node={node}
            isHovered={hoveredId === node.id}
            isSelected={selectedId === node.id}
            onPointerOver={(e) => { e.stopPropagation(); onNodeHover(node.id); }}
            onPointerOut={() => onNodeHover(null)}
            onClick={(e) => { e.stopPropagation(); onNodeSelect(node.id); }}
          />
        ))}
      </group>
      
      {!performanceMode && (
        <group name="arcs">
          {arcs.map((arc, i) => (
            <NetworkArc key={i} from={nodes[arc.from].position} to={nodes[arc.to].position} intensity={arc.intensity} />
          ))}
        </group>
      )}
      
      <DataPulses nodes={nodes} arcs={arcs} paused={paused} />
      
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={2.5}
        maxDistance={8}
        rotateSpeed={0.5}
        zoomSpeed={0.6}
        autoRotate={true}
        autoRotateSpeed={0.3}
        dampingFactor={0.05}
        enableDamping={true}
      />
      
      {!performanceMode && <Stars radius={50} depth={50} count={2000} factor={4} fade speed={1} />}
    </>
  );
};

const GlobeVisualization = forwardRef(({
  width = '100%',
  height = '100%',
  nodes: customNodes,
  arcs: customArcs,
  onNodeSelect: externalOnNodeSelect,
  onNodeHover: externalOnNodeHover,
  paused = false,
  performanceMode = false,
  showInfoPanel = true,
}, ref) => {
  const [nodes] = useState(() => customNodes || generateNodes());
  const [arcs] = useState(() => customArcs || generateArcs(customNodes || generateNodes()));
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [contextLost, setContextLost] = useState(false);
  const controlsRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    setWebglSupported(!!gl);
    return () => {
      canvas.remove();
    };
  }, []);

  const handleContextLost = useCallback((e) => {
    e.preventDefault();
    setContextLost(true);
  }, []);

  const handleContextRestored = useCallback(() => {
    setContextLost(false);
  }, []);

  useImperativeHandle(ref, () => ({
    resetView: () => {
      if (controlsRef.current) {
        controlsRef.current.reset();
        controlsRef.current.object.position.set(0, 0.8, 4.5);
        controlsRef.current.object.lookAt(0, 0, 0);
      }
    }
  }));

  const handleNodeHover = useCallback((id) => {
    setHoveredId(id);
    if (externalOnNodeHover) {
      externalOnNodeHover(id, id !== null ? nodes.find(n => n.id === id) : null);
    }
  }, [externalOnNodeHover, nodes]);

  const handleNodeSelect = useCallback((id) => {
    setSelectedId(id);
    if (externalOnNodeSelect) {
      externalOnNodeSelect(id, nodes.find(n => n.id === id));
    }
  }, [externalOnNodeSelect, nodes]);

  const hoveredNode = hoveredId !== null ? nodes.find(n => n.id === hoveredId) : null;
  const selectedNode = selectedId !== null ? nodes.find(n => n.id === selectedId) : null;

  if (!webglSupported || contextLost) {
    return (
      <div style={{ width, height, position: 'relative', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
        <div style={{ color: 'var(--muted)', fontSize: '0.85em', textAlign: 'center' }}>
          {!webglSupported ? 'WebGL is not supported in this browser' : 'WebGL context lost'}
        </div>
        <div style={{ color: 'var(--primary)', fontSize: '0.75em', textAlign: 'center' }}>
          Network nodes: {nodes.length} | Links: {arcs.length}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', maxWidth: '300px' }}>
          {nodes.slice(0, 8).map(node => (
            <div key={node.id} style={{
              padding: '4px 8px',
              background: 'var(--panel)',
              border: '1px solid var(--panel-border-subtle)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.7em',
              color: STATUS_COLORS[node.status] || 'var(--primary)'
            }}>
              {node.label}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ width, height, position: 'relative', background: 'var(--bg)' }}>
      <Canvas
        ref={canvasRef}
        camera={{ position: [0, 0.8, 4.5], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
        shadows={false}
        gl={{ antialias: !performanceMode, alpha: false, preserveDrawingBuffer: false, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', handleContextLost);
          gl.domElement.addEventListener('webglcontextrestored', handleContextRestored);
        }}
      >
        <color attach="background" args={['#020711']} />
        <fog attach="fog" args={['#020711', 8, 25]} />
        
        <Scene
          nodes={nodes}
          arcs={arcs}
          hoveredId={hoveredId}
          selectedId={selectedId}
          paused={paused}
          onNodeHover={handleNodeHover}
          onNodeSelect={handleNodeSelect}
          controlsRef={controlsRef}
          performanceMode={performanceMode}
        />
      </Canvas>
      
      {showInfoPanel && (hoveredNode || selectedNode) && (
        <div style={{
          position: 'absolute',
          top: 16,
          right: 16,
          width: 280,
          background: 'var(--panel)',
          border: '1px solid var(--panel-border)',
          borderRadius: 'var(--radius)',
          padding: 12,
          color: 'var(--text)',
          fontSize: '0.8em',
          zIndex: 10,
          boxShadow: 'var(--glow-primary)',
        }}>
          <div style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ 
              width: 10, height: 10, borderRadius: '50%',
              background: STATUS_COLORS[selectedNode?.status || hoveredNode?.status] || DESIGN_TOKENS.primary
            }} />
            {selectedNode?.label || hoveredNode?.label || 'NODE'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: '0.75em' }}>
            <span>Region:</span> <span style={{ color: 'var(--primary)' }}>{selectedNode?.region || hoveredNode?.region || '-'}</span>
            <span>Type:</span> <span style={{ color: 'var(--primary)', textTransform: 'capitalize' }}>{selectedNode?.type || hoveredNode?.type || '-'}</span>
            <span>Status:</span> <span style={{ 
              color: selectedNode?.status === 'warning' ? 'var(--warning)' : 
                     selectedNode?.status === 'critical' ? 'var(--error)' : 
                     selectedNode?.status === 'offline' ? 'var(--muted)' : 'var(--success)',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}>
              {selectedNode?.status || hoveredNode?.status || '-'}
            </span>
            <span>Load:</span> <span style={{ color: 'var(--primary)' }}>{selectedNode?.load ?? hoveredNode?.load ?? 0}%</span>
            <span>Uptime:</span> <span style={{ color: 'var(--primary)' }}>{selectedNode?.uptime ?? hoveredNode?.uptime ?? 0}%</span>
          </div>
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--panel-border-subtle)', fontSize: '0.7em', color: 'var(--muted)' }}>
            Lat: {(selectedNode?.lat || hoveredNode?.lat || 0).toFixed(2)}° • Lon: {(selectedNode?.lon || hoveredNode?.lon || 0).toFixed(2)}°
          </div>
        </div>
      )}
    </div>
  );
});

GlobeVisualization.displayName = 'GlobeVisualization';

export { GlobeVisualization, generateNodes, generateArcs };
export default GlobeVisualization;
