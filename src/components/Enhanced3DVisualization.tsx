'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Box, Text, Environment, Grid, ContactShadows, PerspectiveCamera, Html, Stats } from '@react-three/drei'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Eye, EyeOff, RotateCcw, Maximize2, Settings, Layers } from 'lucide-react'

interface FoamPiece {
  id: string
  length: number
  width: number
  height: number
  quantity: number
  label: string
  color?: string
}

interface StockFoam {
  id: string
  length: number
  width: number
  height: number
  quantity: number
  label: string
}

interface OptimizationResult {
  layouts: Array<{
    stockId: string
    pieces: Array<{
      pieceId: string
      x: number
      y: number
      z: number
      rotated?: boolean
    }>
    utilization: number
  }>
  totalWaste: number
  totalCost: number
  efficiency: number
}

interface Props {
  pieces: FoamPiece[]
  stockFoams: StockFoam[]
  optimizationResult: OptimizationResult | null
}

// Enhanced Stock Foam with animations and better materials
function StockFoamMesh({ stockFoam, position, isSelected, onClick, utilization }: { 
  stockFoam: StockFoam
  position: [number, number, number]
  isSelected?: boolean
  onClick?: () => void
  utilization?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const [hovered, setHovered] = useState(false)
  
  useFrame((state) => {
    if (meshRef.current) {
      if (isSelected) {
        meshRef.current.scale.setScalar(1.02 + Math.sin(state.clock.elapsedTime * 2) * 0.01)
      } else if (hovered) {
        meshRef.current.scale.setScalar(1.01)
      } else {
        meshRef.current.scale.setScalar(1)
      }
    }
  })
  
  const getUtilizationColor = (util?: number) => {
    if (!util) return "#f1f5f9"
    if (util >= 80) return "#10b981"
    if (util >= 60) return "#f59e0b"
    return "#ef4444"
  }
  
  return (
    <group position={position}>
      {/* Enhanced Stock container */}
      <Box
        ref={meshRef}
        args={[stockFoam.length / 10, stockFoam.width / 10, stockFoam.height / 10]}
        position={[0, 0, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
      >
        <meshPhysicalMaterial 
          color={isSelected ? "#3b82f6" : getUtilizationColor(utilization)}
          transparent 
          opacity={0.3}
          roughness={0.1}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </Box>
      
      {/* Wireframe outline */}
      <Box
        args={[stockFoam.length / 10, stockFoam.width / 10, stockFoam.height / 10]}
        position={[0, 0, 0]}
      >
        <meshBasicMaterial 
          color={isSelected ? "#1d4ed8" : "#64748b"} 
          wireframe 
          transparent 
          opacity={0.6} 
        />
      </Box>
      
      {/* Enhanced Label with background */}
      <Html
        position={[0, stockFoam.width / 10 / 2 + 1.5, 0]}
        center
        distanceFactor={10}
      >
        <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-gray-200">
          <div className="text-sm font-semibold text-gray-900">{stockFoam.label}</div>
          <div className="text-xs text-gray-600">
            {stockFoam.length}×{stockFoam.width}×{stockFoam.height}cm
          </div>
          {utilization && (
            <div className={`text-xs font-medium ${
              utilization >= 80 ? 'text-green-600' :
              utilization >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {utilization.toFixed(1)}% verimlilik
            </div>
          )}
        </div>
      </Html>
    </group>
  )
}

// Enhanced Piece with animations and better visuals
function PieceMesh({ piece, position, originalPiece, isHighlighted, onHover, opacity = 0.8 }: {
  piece: { pieceId: string; x: number; y: number; z: number; rotated?: boolean }
  position: [number, number, number]
  originalPiece: FoamPiece
  isHighlighted?: boolean
  onHover?: (pieceId: string | null) => void
  opacity?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const [hovered, setHovered] = useState(false)
  
  useFrame((state) => {
    if (meshRef.current) {
      if (isHighlighted) {
        meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.1
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1
      } else {
        meshRef.current.position.y = 0
        meshRef.current.rotation.y = 0
      }
    }
  })
  
  const handlePointerOver = () => {
    setHovered(true)
    onHover?.(piece.pieceId)
  }
  
  const handlePointerOut = () => {
    setHovered(false)
    onHover?.(null)
  }
  
  return (
    <group position={[
      position[0] + piece.x / 10 / 10,
      position[1] + piece.y / 10 / 10,
      position[2] + piece.z / 10 / 10
    ]}>
      <Box
        ref={meshRef}
        args={[
          originalPiece.length / 10,
          originalPiece.width / 10,
          originalPiece.height / 10
        ]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <meshPhysicalMaterial 
          color={originalPiece.color || '#3B82F6'} 
          transparent 
          opacity={isHighlighted ? 1.0 : hovered ? 0.9 : opacity}
          roughness={0.2}
          metalness={0.1}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
          emissive={isHighlighted ? new THREE.Color(originalPiece.color || '#3B82F6').multiplyScalar(0.2) : new THREE.Color(0x000000)}
        />
      </Box>
      
      {/* Enhanced wireframe for better definition */}
      <Box
        args={[
          originalPiece.length / 10,
          originalPiece.width / 10,
          originalPiece.height / 10
        ]}
      >
        <meshBasicMaterial 
          color={isHighlighted ? "#ffffff" : "#ffffff"}
          wireframe 
          transparent 
          opacity={isHighlighted ? 0.8 : 0.3}
        />
      </Box>
      
      {/* Piece label with enhanced visibility */}
      {(hovered || isHighlighted) && (
        <Html
          position={[0, 0, originalPiece.height / 10 / 2 + 0.8]}
          center
          distanceFactor={8}
        >
          <div className="bg-black/80 backdrop-blur-sm px-2 py-1 rounded shadow-lg border border-gray-600">
            <div className="text-xs font-medium text-white">{originalPiece.label}</div>
            <div className="text-xs text-gray-300">
              {originalPiece.length}×{originalPiece.width}×{originalPiece.height}cm
            </div>
            {piece.rotated && (
              <div className="text-xs text-yellow-300">🔄 Rotated</div>
            )}
          </div>
        </Html>
      )}
    </group>
  )
}

// Animation helper component
function AnimatedGroup({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const groupRef = useRef<THREE.Group>(null!)
  const [visible, setVisible] = useState(false)
  
  useFrame((state) => {
    if (!visible && state.clock.elapsedTime > delay) {
      setVisible(true)
    }
    
    if (groupRef.current && visible) {
      const targetScale = 1
      const currentScale = groupRef.current.scale.x
      groupRef.current.scale.setScalar(
        THREE.MathUtils.lerp(currentScale, targetScale, 0.1)
      )
    }
  })
  
  return (
    <group ref={groupRef} scale={visible ? 1 : 0}>
      {children}
    </group>
  )
}

export default function Enhanced3DVisualization({ pieces, stockFoams, optimizationResult }: Props) {
  const [selectedStock, setSelectedStock] = useState<string | null>(null)
  const [highlightedPiece, setHighlightedPiece] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'realistic' | 'wireframe' | 'xray'>('realistic')
  const [showStats, setShowStats] = useState(false)
  const [explodedView, setExplodedView] = useState(false)
  const [showPieces, setShowPieces] = useState(true)
  const [showStocks, setShowStocks] = useState(true)
  
  const sceneData = useMemo(() => {
    if (!optimizationResult) {
      return {
        stockPositions: stockFoams.map((stock, index) => ({
          stock,
          position: [index * (stock.length / 10 + 2), 0, 0] as [number, number, number],
          utilization: 0
        })),
        pieces: []
      }
    }

    const stockPositions = optimizationResult.layouts.map((layout, index) => {
      const stock = stockFoams.find(s => s.id === layout.stockId)
      return stock ? {
        stock,
        position: [index * (stock.length / 10 + 3), 0, 0] as [number, number, number],
        layout,
        utilization: layout.utilization
      } : null
    }).filter(Boolean) as Array<{ stock: StockFoam; position: [number, number, number]; layout: any; utilization: number }>

    const placedPieces = optimizationResult.layouts.flatMap((layout, layoutIndex) => {
      const stockPosition = stockPositions[layoutIndex]?.position || [0, 0, 0]
      return layout.pieces.map((piece, pieceIndex) => ({
        piece,
        position: explodedView ? [
          stockPosition[0] + (pieceIndex % 3) * 2,
          stockPosition[1] + Math.floor(pieceIndex / 3) * 2,
          stockPosition[2]
        ] as [number, number, number] : stockPosition,
        originalPiece: pieces.find(p => piece.pieceId.startsWith(p.id))!,
        stockId: layout.stockId
      }))
    }).filter(item => item.originalPiece)

    return {
      stockPositions,
      pieces: placedPieces
    }
  }, [pieces, stockFoams, optimizationResult, explodedView])

  const resetCamera = () => {
    // Camera reset logic would go here
    console.log('Camera reset')
  }

  return (
    <div className="h-full w-full relative">
      {/* Enhanced 3D Controls */}
      <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">3D Kontroller</h3>
          <button
            onClick={() => setShowStats(!showStats)}
            className="p-1 hover:bg-gray-200 rounded"
            title="İstatistikleri Göster/Gizle"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-600">Görünüm Modu:</label>
            <select 
              value={viewMode} 
              onChange={(e) => setViewMode(e.target.value as any)}
              className="w-full text-xs border border-gray-300 rounded px-2 py-1 mt-1"
            >
              <option value="realistic">Gerçekçi</option>
              <option value="wireframe">Wireframe</option>
              <option value="xray">X-Ray</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowStocks(!showStocks)}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                showStocks ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {showStocks ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              <span>Bloklar</span>
            </button>
            
            <button
              onClick={() => setShowPieces(!showPieces)}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                showPieces ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {showPieces ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              <span>Parçalar</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setExplodedView(!explodedView)}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                explodedView ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>{explodedView ? 'Normal' : 'Exploded'}</span>
            </button>
            
            <button
              onClick={resetCamera}
              className="flex items-center space-x-1 px-2 py-1 rounded text-xs bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
        
        {optimizationResult && (
          <div className="pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Verimlilik:</span>
                <span className="font-medium">{optimizationResult.efficiency.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Kullanılan Blok:</span>
                <span className="font-medium">{sceneData.stockPositions.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Toplam Parça:</span>
                <span className="font-medium">{sceneData.pieces.length}</span>
              </div>
              {selectedStock && (
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-xs font-medium text-blue-600">Seçili Blok</div>
                  <div className="text-xs text-gray-600">
                    {sceneData.stockPositions.find(s => s.stock.id === selectedStock)?.stock.label}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-xs">
        <div className="text-sm font-medium text-gray-700 mb-2">Parça Renkleri:</div>
        <div className="grid grid-cols-2 gap-1 text-xs">
          {pieces.slice(0, 6).map((piece, index) => (
            <div key={piece.id} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded border"
                style={{ backgroundColor: piece.color }}
              />
              <span className="truncate">{piece.label}</span>
            </div>
          ))}
          {pieces.length > 6 && (
            <div className="text-gray-500 col-span-2">+{pieces.length - 6} daha...</div>
          )}
        </div>
      </div>

      <Canvas camera={{ position: [15, 15, 15], fov: 50 }} shadows>
        {/* Stats */}
        {showStats && <Stats />}
        
        {/* Enhanced Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1} 
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <pointLight position={[-10, 10, -10]} intensity={0.3} />
        
        {/* Environment and Grid */}
        <Environment preset="warehouse" />
        <Grid 
          args={[50, 50]} 
          cellSize={1} 
          cellThickness={0.5} 
          cellColor="#6b7280" 
          sectionSize={10} 
          sectionThickness={1} 
          sectionColor="#374151" 
          fadeDistance={25} 
          fadeStrength={1} 
          followCamera={false} 
          infiniteGrid={true}
        />
        
        {/* Contact Shadows */}
        <ContactShadows 
          position={[0, -0.5, 0]} 
          opacity={0.4} 
          scale={50} 
          blur={1} 
          far={10} 
          resolution={256} 
          color="#000000" 
        />
        
        {/* Render stock foams with enhanced interactivity */}
        {showStocks && sceneData.stockPositions.map((item, index) => (
          <AnimatedGroup key={item.stock.id} delay={index * 0.2}>
            <StockFoamMesh
              stockFoam={item.stock}
              position={item.position}
              isSelected={selectedStock === item.stock.id}
              onClick={() => setSelectedStock(selectedStock === item.stock.id ? null : item.stock.id)}
              utilization={item.utilization}
            />
          </AnimatedGroup>
        ))}
        
        {/* Render placed pieces with enhanced interactivity */}
        {showPieces && sceneData.pieces
          .filter(item => !selectedStock || item.stockId === selectedStock)
          .map((item, index) => (
          <AnimatedGroup key={`${item.piece.pieceId}-${index}`} delay={0.5 + index * 0.1}>
            <PieceMesh
              piece={item.piece}
              position={item.position}
              originalPiece={item.originalPiece}
              isHighlighted={highlightedPiece === item.piece.pieceId}
              onHover={setHighlightedPiece}
              opacity={viewMode === 'xray' ? 0.3 : 0.8}
            />
          </AnimatedGroup>
        ))}
        
        {/* Enhanced Camera Controls */}
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05}
          enableZoom
          enablePan
          maxPolarAngle={Math.PI / 2}
          minDistance={5}
          maxDistance={100}
        />
        
        {/* Perspective Camera with better positioning */}
        <PerspectiveCamera makeDefault position={[15, 15, 15]} fov={50} />
      </Canvas>
    </div>
  )
}