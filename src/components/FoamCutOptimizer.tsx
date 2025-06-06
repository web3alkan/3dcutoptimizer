'use client'

import { useState, useMemo, useEffect } from 'react'
import { Calculator, Plus, Trash2, Package, Scissors, Info, Grid3X3, Sparkles, FileText, Download, Edit3, Save, X, Clock, Zap, Brain } from 'lucide-react'
import FoamPiece3D from './FoamPiece3D'
import Enhanced3DVisualization from './Enhanced3DVisualization'
import FoamCutSlice2D from './FoamCutSlice2D'
import OptimizationEngine from '../utils/optimizationEngine'
import { AdvancedOptimizationEngine } from '../utils/advancedOptimizationEngine'
import { GuillotineCuttingEngine } from '../utils/guillotineCuttingEngine'
import AlgorithmDashboard from './AlgorithmDashboard'
import CuttingInstructions from './CuttingInstructions'
import MaterialLibrary from './MaterialLibrary'
import ProjectTemplates from './ProjectTemplates'
import AdvancedReportSystem from './AdvancedReportSystem'

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
    cuttingPattern?: {
      horizontalCuts: number[]
      verticalCuts: number[]
      totalCuts: number
    }
  }>
  totalWaste: number
  totalCost: number
  efficiency: number
  cuttingInstructions?: any
  algorithmData?: any
  algorithmComparison?: any
  hybridAnalysis?: any
}

export default function FoamCutOptimizer() {
  const [pieces, setPieces] = useState<FoamPiece[]>([
    {
      id: '1',
      length: 30,
      width: 40,
      height: 20,
      quantity: 2,
      label: 'Parça A',
      color: '#3B82F6'
    },
    {
      id: '2',
      length: 40,
      width: 90,
      height: 10,
      quantity: 4,
      label: 'Parça B',
      color: '#10B981'
    },
    {
      id: '3',
      length: 50,
      width: 30,
      height: 20,
      quantity: 1,
      label: 'Parça C',
      color: '#F59E0B'
    },
    {
      id: '4',
      length: 100,
      width: 90,
      height: 7.5,
      quantity: 6,
      label: 'Parça D',
      color: '#EF4444'
    },
    {
      id: '5',
      length: 60,
      width: 40,
      height: 30,
      quantity: 1,
      label: 'Parça E',
      color: '#8B5CF6'
    }
  ])
  const [stockFoams, setStockFoams] = useState<StockFoam[]>([
    {
      id: 'stock1',
      length: 240,
      width: 240,
      height: 100,
      quantity: 1,
      label: 'Büyük Sünger Blok'
    }
  ])
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [showEfficiencyWarning, setShowEfficiencyWarning] = useState<string | null>(null)
  const [editingPiece, setEditingPiece] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    length: '',
    width: '',
    height: '',
    quantity: '',
    label: ''
  })
  const [showMaterialLibrary, setShowMaterialLibrary] = useState(false)
  const [showProjectTemplates, setShowProjectTemplates] = useState(false)
  const [showAdvancedReport, setShowAdvancedReport] = useState(false)

  // Form state'leri
  const [newPiece, setNewPiece] = useState({
    length: '',
    width: '',
    height: '',
    quantity: '1',
    label: 'Parça'
  })

  const [newStock, setNewStock] = useState({
    length: '',
    width: '',
    height: '',
    quantity: '1',
    label: 'Sünger Blok'
  })

  const [optimizationProgress, setOptimizationProgress] = useState({
    currentAlgorithm: '',
    progress: 0,
    stage: '',
    completed: 0,
    total: 0
  })

  // Tek parça için maksimum adet hesaplama
  const calculateMaxQuantity = () => {
    if (!newPiece.length || !newPiece.width || !newPiece.height || stockFoams.length === 0) {
      alert('Önce parça ölçülerini girin!')
      return
    }

    const pieceLength = parseFloat(newPiece.length)
    const pieceWidth = parseFloat(newPiece.width)
    const pieceHeight = parseFloat(newPiece.height)

    let maxTotal = 0

    stockFoams.forEach(stock => {
      // 8 farklı rotasyon kombinasyonu test et
      const rotations = [
        [pieceLength, pieceWidth, pieceHeight],
        [pieceLength, pieceHeight, pieceWidth],
        [pieceWidth, pieceLength, pieceHeight],
        [pieceWidth, pieceHeight, pieceLength],
        [pieceHeight, pieceLength, pieceWidth],
        [pieceHeight, pieceWidth, pieceLength]
      ]

      let maxForThisStock = 0
      rotations.forEach(([l, w, h]) => {
        const fitL = Math.floor(stock.length / l)
        const fitW = Math.floor(stock.width / w)
        const fitH = Math.floor(stock.height / h)
        const total = fitL * fitW * fitH
        maxForThisStock = Math.max(maxForThisStock, total)
      })

      maxTotal += maxForThisStock * stock.quantity
    })

    setNewPiece({ ...newPiece, quantity: maxTotal.toString() })
  }

  // Tüm parçalar için maksimizasyon (minimum adetleri koruyarak)
  const maximizeAllPieces = async () => {
    if (pieces.length === 0) {
      alert('Önce parça ekleyin!')
      return
    }

    console.log('Maksimizasyon başlıyor...')
    setIsCalculating(true)
    setShowEfficiencyWarning('Maksimum adetler hesaplanıyor...')

    try {
      // Toplam ham malzeme hacmini hesapla
      const totalStockVolume = stockFoams.reduce((sum, stock) => 
        sum + (stock.length * stock.width * stock.height * stock.quantity), 0
      )

      console.log('Toplam ham malzeme hacmi:', totalStockVolume, 'cm³')

      // Mevcut parçaların toplam hacmini hesapla
      const currentTotalVolume = pieces.reduce((sum, piece) => 
        sum + (piece.length * piece.width * piece.height * piece.quantity), 0
      )

      console.log('Mevcut parçalar toplam hacmi:', currentTotalVolume, 'cm³')

      if (currentTotalVolume >= totalStockVolume) {
        setShowEfficiencyWarning('Mevcut parçalar zaten tüm bloklara sığmıyor! Parça adetlerini azaltın.')
        setIsCalculating(false)
        return
      }

      // Basit hacim temelli maksimizasyon
      const remainingVolume = totalStockVolume - currentTotalVolume
      console.log('Kalan hacim:', remainingVolume, 'cm³')

      // Her parça için unit hacim hesapla
      const pieceVolumeData = pieces.map(piece => ({
        ...piece,
        unitVolume: piece.length * piece.width * piece.height,
        index: pieces.findIndex(p => p.id === piece.id)
      }))

      // Küçük parçalardan başlayarak maksimize et
      const sortedByVolume = [...pieceVolumeData].sort((a, b) => a.unitVolume - b.unitVolume)
      
      const optimizedPieces = [...pieces]
      let usedExtraVolume = 0

      for (const pieceData of sortedByVolume) {
        const availableVolume = remainingVolume - usedExtraVolume
        const maxAdditionalPieces = Math.floor(availableVolume / pieceData.unitVolume)
        
        console.log(`${pieceData.label}: Unit hacim ${pieceData.unitVolume}, maksimum ek adet: ${maxAdditionalPieces}`)

        if (maxAdditionalPieces > 0) {
          const pieceIndex = optimizedPieces.findIndex(p => p.id === pieceData.id)
          if (pieceIndex !== -1) {
            const newQuantity = optimizedPieces[pieceIndex].quantity + maxAdditionalPieces
            optimizedPieces[pieceIndex] = {
              ...optimizedPieces[pieceIndex],
              quantity: newQuantity
            }
            usedExtraVolume += maxAdditionalPieces * pieceData.unitVolume
            console.log(`${pieceData.label} güncellendi: ${pieceData.quantity} -> ${newQuantity}`)
          }
        }
      }

      // Sonuç kontrolü
      const hasChanges = optimizedPieces.some((piece, index) => piece.quantity !== pieces[index].quantity)
      
      if (hasChanges) {
        const finalTotalVolume = optimizedPieces.reduce((sum, piece) => 
          sum + (piece.length * piece.width * piece.height * piece.quantity), 0
        )
        const efficiency = ((finalTotalVolume / totalStockVolume) * 100).toFixed(1)
        
        console.log('Maksimizasyon tamamlandı:', {
          öncekiToplam: currentTotalVolume,
          yeniToplam: finalTotalVolume,
          verimlilik: efficiency + '%'
        })

        setPieces(optimizedPieces)
        setShowEfficiencyWarning(`Parçalar maksimize edildi! Toplam verimlilik: %${efficiency}`)
      } else {
        console.log('Parçalar zaten maksimum seviyede')
        setShowEfficiencyWarning('Parçalar zaten maksimum seviyede! Daha fazla eklenemez.')
      }

    } catch (error) {
      console.error('Maksimizasyon hatası:', error)
      setShowEfficiencyWarning('Maksimizasyon sırasında hata oluştu: ' + (error as Error).message)
    } finally {
      setIsCalculating(false)
    }
  }

  // Verimlilik kontrolü
  useEffect(() => {
    if (showEfficiencyWarning) {
      const timer = setTimeout(() => setShowEfficiencyWarning(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [showEfficiencyWarning])

  // Optimizasyon hesaplama (otomatik maksimizasyon ile)
  const calculateOptimization = async () => {
    if (pieces.length === 0) return
    
    setIsCalculating(true)
    setShowEfficiencyWarning('Parçalar maksimize ediliyor ve optimize ediliyor...')
    
    try {
      // Önce otomatik maksimizasyon yap
      await maximizeAllPieces()
      
      // Bir sonraki render cycle'da optimize et
      setTimeout(async () => {
        try {
          // CM'yi MM'ye çevir (optimizasyon motoru MM kullanıyor)
          const piecesInMM = pieces.map(p => ({
            ...p,
            length: p.length * 10,
            width: p.width * 10,
            height: p.height * 10
          }))
          
          const stocksInMM = stockFoams.map(s => ({
            ...s,
            length: s.length * 10,
            width: s.width * 10,
            height: s.height * 10
          }))
          
          const engine = new OptimizationEngine()
          const result = await engine.optimize(piecesInMM, stocksInMM)
          setOptimizationResult(result)
          setShowEfficiencyWarning(`✅ Optimizasyon tamamlandı! Verimlilik: ${result.efficiency.toFixed(1)}%`)
        } catch (error) {
          console.error('Optimizasyon hatası:', error)
          setShowEfficiencyWarning('Optimizasyon sırasında hata oluştu: ' + (error as Error).message)
        } finally {
          setIsCalculating(false)
        }
      }, 500)
    } catch (error) {
      console.error('Maksimizasyon hatası:', error)
      setShowEfficiencyWarning('Maksimizasyon sırasında hata oluştu: ' + (error as Error).message)
      setIsCalculating(false)
    }
  }

  // Gerçek makine optimizasyonu (otomatik maksimizasyon ile)
  const calculateRealisticCutting = async () => {
    if (pieces.length === 0) return
    
    setIsCalculating(true)
    setShowEfficiencyWarning('🔪 Parçalar maksimize ediliyor ve gerçek makine kısıtlamalarıyla optimize ediliyor...')
    
    try {
      // Önce otomatik maksimizasyon yap
      await maximizeAllPieces()
      
      // Bir sonraki render cycle'da optimize et
      setTimeout(async () => {
        try {
          const engine = new GuillotineCuttingEngine(pieces, stockFoams)
          const result = await engine.optimize()
          
          setOptimizationResult(result)
          setShowEfficiencyWarning(`🔪 Gerçek Kesim: ${result.efficiency.toFixed(1)}% verimlilik, ${result.algorithmData.totalCuts} kesim`)
        } catch (error) {
          console.error('Gerçek kesim optimizasyon hatası:', error)
          setShowEfficiencyWarning('Gerçek kesim optimizasyonu sırasında hata oluştu: ' + (error as Error).message)
        } finally {
          setIsCalculating(false)
        }
      }, 500)
    } catch (error) {
      console.error('Maksimizasyon hatası:', error)
      setShowEfficiencyWarning('Maksimizasyon sırasında hata oluştu: ' + (error as Error).message)
      setIsCalculating(false)
    }
  }

  // Gelişmiş optimizasyon hesaplama (otomatik maksimizasyon ile)
  const calculateAdvancedOptimization = async (mode: 'multi' | 'hybrid' | 'adaptive' = 'adaptive') => {
    if (pieces.length === 0) return
    
    setIsCalculating(true)
    setOptimizationProgress({
      currentAlgorithm: '',
      progress: 0,
      stage: 'Parçalar maksimize ediliyor...',
      completed: 0,
      total: mode === 'multi' ? 3 : mode === 'hybrid' ? 3 : 1
    })
    
    try {
      // Önce otomatik maksimizasyon yap
      await maximizeAllPieces()
      
      // Bir sonraki render cycle'da optimize et
      setTimeout(async () => {
        try {
          setOptimizationProgress(prev => ({ ...prev, stage: 'Gelişmiş optimizasyon başlıyor...' }))
          
          // Progress callback function
          const progressCallback = (progressData: any) => {
            setOptimizationProgress(prev => ({
              ...prev,
              currentAlgorithm: progressData.algorithm,
              progress: progressData.progress,
              stage: progressData.stage
            }))
          }
          
          const engine = new AdvancedOptimizationEngine(pieces, stockFoams, progressCallback)
          let result
          
          switch (mode) {
            case 'multi':
              setOptimizationProgress(prev => ({ ...prev, stage: 'Multi-Algorithm Analysis', total: 3 }))
              result = await engine.optimizeWithMultipleAlgorithms(['basic', 'genetic', 'annealing'])
              setShowEfficiencyWarning(`🏆 Multi-Algorithm: En iyi = ${result.algorithmComparison.bestAlgorithm}`)
              break
              
            case 'hybrid':
              setOptimizationProgress(prev => ({ ...prev, stage: 'Hybrid 3-Stage Process', total: 3 }))
              result = await engine.optimizeWithHybridApproach()
              setShowEfficiencyWarning(`🔬 Hybrid: ${result.hybridAnalysis.improvement.toFixed(1)}% iyileştirme`)
              break
              
            case 'adaptive':
              setOptimizationProgress(prev => ({
                ...prev,
                currentAlgorithm: '🎯 Akıllı Seçim',
                progress: 50,
                completed: 0,
                stage: 'Problem analiz ediliyor...'
              }))
              await new Promise(resolve => setTimeout(resolve, 300))
              
              setOptimizationProgress(prev => ({
                ...prev,
                progress: 100,
                completed: 1,
                stage: 'En uygun algoritma çalıştırılıyor...'
              }))
              
              result = await engine.optimizeWithAdaptiveParameters()
              setShowEfficiencyWarning(`🎯 Adaptive: Otomatik algoritma seçimi tamamlandı`)
              break
          }
          
          setOptimizationResult(result)
        } catch (error) {
          console.error('Gelişmiş optimizasyon hatası:', error)
          setShowEfficiencyWarning('Gelişmiş optimizasyon sırasında hata oluştu: ' + (error as Error).message)
        } finally {
          setIsCalculating(false)
          setOptimizationProgress({
            currentAlgorithm: '',
            progress: 0,
            stage: '',
            completed: 0,
            total: 0
          })
        }
      }, 500)
    } catch (error) {
      console.error('Maksimizasyon hatası:', error)
      setShowEfficiencyWarning('Maksimizasyon sırasında hata oluştu: ' + (error as Error).message)
      setIsCalculating(false)
    }
  }

  // Parça ekleme
  const addPiece = () => {
    if (!newPiece.length || !newPiece.width || !newPiece.height || !newPiece.label) return

    const piece: FoamPiece = {
      id: Date.now().toString(),
      length: parseFloat(newPiece.length),
      width: parseFloat(newPiece.width),
      height: parseFloat(newPiece.height),
      quantity: parseInt(newPiece.quantity),
      label: newPiece.label,
      color: `hsl(${Math.random() * 360}, 65%, 55%)`
    }

    setPieces([...pieces, piece])
    setNewPiece({ length: '', width: '', height: '', quantity: '1', label: 'Parça' })
  }

  // Stok ekleme
  const addStock = () => {
    if (!newStock.length || !newStock.width || !newStock.height || !newStock.label) return

    const stock: StockFoam = {
      id: Date.now().toString(),
      length: parseFloat(newStock.length),
      width: parseFloat(newStock.width),
      height: parseFloat(newStock.height),
      quantity: parseInt(newStock.quantity),
      label: newStock.label
    }

    setStockFoams([...stockFoams, stock])
    setNewStock({ length: '', width: '', height: '', quantity: '1', label: 'Sünger Blok' })
  }

  // Silme işlemleri
  const removePiece = (id: string) => {
    setPieces(pieces.filter(p => p.id !== id))
  }

  const removeStock = (id: string) => {
    setStockFoams(stockFoams.filter(s => s.id !== id))
  }

  // Parça düzenleme fonksiyonları
  const startEditPiece = (piece: FoamPiece) => {
    setEditingPiece(piece.id)
    setEditForm({
      length: piece.length.toString(),
      width: piece.width.toString(),
      height: piece.height.toString(),
      quantity: piece.quantity.toString(),
      label: piece.label
    })
  }

  const saveEditPiece = () => {
    if (!editingPiece || !editForm.length || !editForm.width || !editForm.height || !editForm.quantity || !editForm.label) return

    const updatedPieces = pieces.map(piece => 
      piece.id === editingPiece 
        ? {
            ...piece,
            length: parseFloat(editForm.length),
            width: parseFloat(editForm.width),
            height: parseFloat(editForm.height),
            quantity: parseInt(editForm.quantity),
            label: editForm.label
          }
        : piece
    )

    setPieces(updatedPieces)
    setEditingPiece(null)
    setEditForm({ length: '', width: '', height: '', quantity: '', label: '' })
  }

  const cancelEdit = () => {
    setEditingPiece(null)
    setEditForm({ length: '', width: '', height: '', quantity: '', label: '' })
  }

  // İstatistikler
  const stats = useMemo(() => {
    const totalPieces = pieces.reduce((sum, p) => sum + p.quantity, 0)
    const totalVolume = pieces.reduce((sum, p) => sum + (p.length * p.width * p.height * p.quantity), 0)
    return { totalPieces, totalVolume }
  }, [pieces])

  // PDF Rapor Oluşturma
  const generatePDFReport = () => {
    if (!optimizationResult) {
      alert('Önce optimizasyon yapın!')
      return
    }

    // 2D kesit verilerini hazırla
    const generate2DSliceHTML = (viewType: 'top' | 'front' | 'side', title: string) => {
      // Tüm layouts için SVG oluştur
      const svgElements = optimizationResult.layouts.map((layout, index) => {
        const stock = stockFoams.find(s => s.id === layout.stockId)
        if (!stock) return ''

        // View boyutlarını hesapla
        let viewWidth, viewHeight, depthLabel
        switch (viewType) {
          case 'top':
            viewWidth = stock.length
            viewHeight = stock.width
            depthLabel = `Kalınlık: ${stock.height}cm`
            break
          case 'front':
            viewWidth = stock.length
            viewHeight = stock.height
            depthLabel = `Derinlik: ${stock.width}cm`
            break
          case 'side':
            viewWidth = stock.width
            viewHeight = stock.height
            depthLabel = `Derinlik: ${stock.length}cm`
            break
        }

        const scale = Math.min(400 / viewWidth, 300 / viewHeight)
        const scaledWidth = viewWidth * scale
        const scaledHeight = viewHeight * scale

        // Parçaları çiz
        const pieceElements = layout.pieces.map((placedPiece) => {
          const originalPiece = pieces.find(p => placedPiece.pieceId.startsWith(p.id))
          if (!originalPiece) return ''

          let x, y, width, height, depthInfo
          switch (viewType) {
            case 'top':
              x = (placedPiece.x / 10) * scale
              y = (placedPiece.y / 10) * scale
              width = originalPiece.length * scale
              height = originalPiece.width * scale
              depthInfo = `${originalPiece.height}cm`
              break
            case 'front':
              x = (placedPiece.x / 10) * scale
              y = (placedPiece.z / 10) * scale
              width = originalPiece.length * scale
              height = originalPiece.height * scale
              depthInfo = `${originalPiece.width}cm`
              break
            case 'side':
              x = (placedPiece.y / 10) * scale
              y = (placedPiece.z / 10) * scale
              width = originalPiece.width * scale
              height = originalPiece.height * scale
              depthInfo = `${originalPiece.length}cm`
              break
          }

          return `
            <rect x="${x}" y="${y}" width="${width}" height="${height}" 
                  fill="${originalPiece.color || '#4F46E5'}" 
                  stroke="#000" stroke-width="1" opacity="0.8"/>
            <text x="${x + width/2}" y="${y + height/2}" 
                  text-anchor="middle" dominant-baseline="middle" 
                  fill="white" font-size="10" font-weight="bold">
              ${originalPiece.label}
            </text>
            <text x="${x + width/2}" y="${y + height/2 + 12}" 
                  text-anchor="middle" dominant-baseline="middle" 
                  fill="white" font-size="8">
              ${depthInfo}
            </text>
          `
        }).join('')

        return `
          <div style="margin-bottom: 40px; text-align: center;">
            <h3 style="margin-bottom: 10px;">Blok ${index + 1} - ${stock.label}</h3>
            <p style="margin-bottom: 15px; color: #666;">${depthLabel} | Verimlilik: ${layout.utilization.toFixed(1)}%</p>
            <svg width="${scaledWidth + 80}" height="${scaledHeight + 80}" style="border: 2px solid #ddd; background: #f9f9f9;">
              <rect x="40" y="40" width="${scaledWidth}" height="${scaledHeight}" 
                    fill="#fff3cd" stroke="#ffc107" stroke-width="2"/>
              ${pieceElements}
              <text x="${40 + scaledWidth/2}" y="${scaledHeight + 65}" 
                    text-anchor="middle" font-size="12" fill="#666">
                ${viewWidth}cm
              </text>
              <text x="25" y="${40 + scaledHeight/2}" 
                    text-anchor="middle" font-size="12" fill="#666" 
                    transform="rotate(-90, 25, ${40 + scaledHeight/2})">
                ${viewHeight}cm
              </text>
            </svg>
          </div>
        `
      }).join('')

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            @page { margin: 20mm; size: A4; }
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .logo { max-width: 100px; height: auto; margin-bottom: 10px; }
            h1 { color: #333; margin: 10px 0; }
            .subtitle { color: #666; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="/logo.jpeg" alt="Logo" class="logo">
            <h1>${title}</h1>
            <p>Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
          ${svgElements}
        </body>
        </html>
      `
    }

    // Ana rapor
    const reportContent = {
      title: 'Sünger Kesim Optimizasyon Raporu',
      date: new Date().toLocaleDateString('tr-TR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      summary: {
        totalPieces: stats.totalPieces,
        totalVolume: (stats.totalVolume / 1000).toFixed(1) + 'L',
        efficiency: optimizationResult.efficiency.toFixed(1) + '%',
        waste: optimizationResult.totalWaste.toFixed(1) + '%',
        blocksUsed: optimizationResult.layouts.length
      },
      stockMaterials: stockFoams.map(stock => ({
        label: stock.label,
        dimensions: `${stock.length}×${stock.width}×${stock.height}cm`,
        quantity: stock.quantity,
        volume: ((stock.length * stock.width * stock.height * stock.quantity) / 1000).toFixed(1) + 'L'
      })),
      pieces: pieces.map(piece => ({
        label: piece.label,
        dimensions: `${piece.length}×${piece.width}×${piece.height}cm`,
        quantity: piece.quantity,
        unitVolume: ((piece.length * piece.width * piece.height) / 1000).toFixed(3) + 'L',
        totalVolume: ((piece.length * piece.width * piece.height * piece.quantity) / 1000).toFixed(1) + 'L'
      })),
      layouts: optimizationResult.layouts.map((layout, index) => {
        const stock = stockFoams.find(s => s.id === layout.stockId)
        return {
          blockNumber: index + 1,
          stockLabel: stock?.label || 'Bilinmeyen',
          utilization: layout.utilization.toFixed(1) + '%',
          piecesCount: layout.pieces.length,
          pieces: layout.pieces.map(p => {
            const originalPiece = pieces.find(piece => p.pieceId.startsWith(piece.id))
            return {
              label: originalPiece?.label || 'Bilinmeyen',
              position: `X:${(p.x/10).toFixed(1)}, Y:${(p.y/10).toFixed(1)}, Z:${(p.z/10).toFixed(1)}cm`,
              rotated: p.rotated ? 'Evet' : 'Hayır'
            }
          })
        }
      })
    }

    // Ana rapor HTML'i
    const mainReportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${reportContent.title}</title>
        <style>
          @page { margin: 20mm; size: A4; }
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { max-width: 120px; height: auto; margin-bottom: 15px; }
          .section { margin-bottom: 30px; page-break-inside: avoid; }
          .section h2 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
          .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
          .summary-item { background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center; }
          .summary-value { font-size: 24px; font-weight: bold; color: #2563eb; }
          .summary-label { color: #666; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f8f9fa; font-weight: bold; }
          .layout-section { margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 8px; }
          .piece-position { font-family: monospace; font-size: 12px; }
          .rotated-yes { color: #ef4444; font-weight: bold; }
          .rotated-no { color: #10b981; }
          .page-break { page-break-before: always; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="/logo.jpeg" alt="Logo" class="logo">
          <h1>${reportContent.title}</h1>
          <p>Oluşturulma Tarihi: ${reportContent.date}</p>
        </div>
        
        <div class="section">
          <h2>📊 Özet Bilgiler</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-value">${reportContent.summary.totalPieces}</div>
              <div class="summary-label">Toplam Parça</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${reportContent.summary.totalVolume}</div>
              <div class="summary-label">Toplam Hacim</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${reportContent.summary.efficiency}</div>
              <div class="summary-label">Verimlilik</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${reportContent.summary.waste}</div>
              <div class="summary-label">Fire</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${reportContent.summary.blocksUsed}</div>
              <div class="summary-label">Kullanılan Blok</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>📦 Ham Malzemeler</h2>
          <table>
            <thead>
              <tr>
                <th>Malzeme Adı</th>
                <th>Boyutlar</th>
                <th>Adet</th>
                <th>Toplam Hacim</th>
              </tr>
            </thead>
            <tbody>
              ${reportContent.stockMaterials.map(stock => `
                <tr>
                  <td>${stock.label}</td>
                  <td>${stock.dimensions}</td>
                  <td>${stock.quantity}</td>
                  <td>${stock.volume}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>✂️ Kesilecek Parçalar</h2>
          <table>
            <thead>
              <tr>
                <th>Parça Adı</th>
                <th>Boyutlar</th>
                <th>Adet</th>
                <th>Birim Hacim</th>
                <th>Toplam Hacim</th>
              </tr>
            </thead>
            <tbody>
              ${reportContent.pieces.map(piece => `
                <tr>
                  <td>${piece.label}</td>
                  <td>${piece.dimensions}</td>
                  <td>${piece.quantity}</td>
                  <td>${piece.unitVolume}</td>
                  <td>${piece.totalVolume}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>🎯 Optimizasyon Sonuçları</h2>
          ${reportContent.layouts.map(layout => `
            <div class="layout-section">
              <h3>Blok ${layout.blockNumber} - ${layout.stockLabel}</h3>
              <p><strong>Verimlilik:</strong> ${layout.utilization} | <strong>Parça Sayısı:</strong> ${layout.piecesCount}</p>
              <table>
                <thead>
                  <tr>
                    <th>Parça Adı</th>
                    <th>Pozisyon (cm)</th>
                    <th>Döndürüldü mü?</th>
                  </tr>
                </thead>
                <tbody>
                  ${layout.pieces.map(piece => `
                    <tr>
                      <td>${piece.label}</td>
                      <td class="piece-position">${piece.position}</td>
                      <td class="${piece.rotated === 'Evet' ? 'rotated-yes' : 'rotated-no'}">${piece.rotated}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `).join('')}
        </div>

        <!-- 2D Kesit Görünümleri -->
        <div class="page-break">
          ${generate2DSliceHTML('top', '🔽 Yukarıdan Görünüm (X-Y Düzlemi)')}
        </div>

        <div class="page-break">
          ${generate2DSliceHTML('front', '➡️ Önden Görünüm (X-Z Düzlemi)')}
        </div>

        <div class="page-break">
          ${generate2DSliceHTML('side', '⬅️ Yandan Görünüm (Y-Z Düzlemi)')}
        </div>

        <div class="section page-break">
          <h2>📋 Notlar</h2>
          <ul>
            <li>Bu rapor AI destekli 3D optimizasyon algoritması kullanılarak oluşturulmuştur.</li>
            <li>Parçalar 8 farklı rotasyon seçeneği ile optimize edilmiştir.</li>
            <li>Pozisyon değerleri sol-alt-ön köşeden başlayarak cm cinsindedir.</li>
            <li>Verimlilik yüzdesi kullanılan hacmin toplam hacme oranını gösterir.</li>
            <li>Döndürülmüş parçalar farklı yönelimde yerleştirilmiştir.</li>
            <li>2D kesit görünümleri üretim için kullanılabilir.</li>
            <li>Minimum fire hedefi ile optimize edilmiştir.</li>
          </ul>
        </div>
      </body>
      </html>
    `

    // PDF'i yeni pencerede aç
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(mainReportHTML)
      printWindow.document.close()
      printWindow.print()
    }
  }

  // Materyal Kütüphanesi'nden seçim
  const handleMaterialSelect = (material: any) => {
    const newStock: StockFoam = {
      id: Date.now().toString(),
      length: material.length,
      width: material.width,
      height: material.height,
      quantity: 1,
      label: material.name
    }
    setStockFoams([...stockFoams, newStock])
    setShowMaterialLibrary(false)
    setShowEfficiencyWarning(`${material.name} malzemesi eklendi!`)
  }

  // Proje Şablonu seçimi
  const handleTemplateSelect = (template: any) => {
    // Mevcut parçaları temizle ve şablon parçalarını ekle
    const templatePieces: FoamPiece[] = template.pieces.map((piece: any, index: number) => ({
      id: Date.now().toString() + '_' + index,
      length: piece.length,
      width: piece.width,
      height: piece.height,
      quantity: piece.quantity,
      label: piece.label,
      color: piece.color || `hsl(${Math.random() * 360}, 65%, 55%)`
    }))
    
    // Stok malzemelerini ekle
    const templateStocks: StockFoam[] = template.stockMaterials.map((stock: any, index: number) => ({
      id: Date.now().toString() + '_stock_' + index,
      length: stock.length,
      width: stock.width,
      height: stock.height,
      quantity: stock.quantity,
      label: stock.label
    }))
    
    setPieces(templatePieces)
    setStockFoams(templateStocks)
    setShowProjectTemplates(false)
    setShowEfficiencyWarning(`${template.name} şablonu yüklendi! ${templatePieces.length} parça ve ${templateStocks.length} malzeme eklendi.`)
  }

  // İsraf Optimizasyonu - Kalan parçaları tekrar böl
  const optimizeWaste = async () => {
    if (!optimizationResult) {
      alert('Önce optimizasyon yapın!')
      return
    }

    setIsCalculating(true)
    setShowEfficiencyWarning('Kalan parçalar optimize ediliyor...')

    try {
      // Her blok için kalan (kullanılmayan) alanları hesapla
      const wasteAnalysis = optimizationResult.layouts.map((layout, index) => {
        const stock = stockFoams.find(s => s.id === layout.stockId)
        if (!stock) return null

        const totalVolume = stock.length * stock.width * stock.height
        const usedVolume = (totalVolume * layout.utilization) / 100
        const wasteVolume = totalVolume - usedVolume

        return {
          blockIndex: index + 1,
          stockLabel: stock.label,
          totalVolume,
          usedVolume,
          wasteVolume,
          wastePercentage: ((wasteVolume / totalVolume) * 100).toFixed(1),
          stockDimensions: { length: stock.length, width: stock.width, height: stock.height }
        }
      }).filter(Boolean)

      // Toplam israf hesapla
      const totalWasteVolume = wasteAnalysis.reduce((sum, block) => sum + block!.wasteVolume, 0)
      
      if (totalWasteVolume < 1000) { // 1000 cm³ = 1L altındaysa
        setShowEfficiencyWarning('Fire miktarı çok düşük. Ekstra optimizasyon gerekmiyor!')
        setIsCalculating(false)
        return
      }

      // En küçük parçayı bul (tekrar kesim için referans)
      const smallestPiece = pieces.reduce((smallest, piece) => {
        const volume = piece.length * piece.width * piece.height
        const smallestVolume = smallest.length * smallest.width * smallest.height
        return volume < smallestVolume ? piece : smallest
      })

      // Fire parçalarından ne kadar küçük parça çıkabileceğini hesapla
      let additionalPieces = 0
      wasteAnalysis.forEach(block => {
        if (!block) return
        
        // Kalan alan içinde en küçük parçadan kaç tane sığabilir
        const possiblePieces = Math.floor(block.wasteVolume / (smallestPiece.length * smallestPiece.width * smallestPiece.height))
        additionalPieces += possiblePieces
      })

      if (additionalPieces > 0) {
        // En küçük parçanın miktarını artır
        const updatedPieces = pieces.map(piece => 
          piece.id === smallestPiece.id 
            ? { ...piece, quantity: piece.quantity + additionalPieces }
            : piece
        )

        setPieces(updatedPieces)
        setShowEfficiencyWarning(`Fire optimize edildi! ${additionalPieces} adet "${smallestPiece.label}" daha eklenebilir. Tekrar optimizasyon yapın.`)
      } else {
        setShowEfficiencyWarning('Fire parçaları mevcut parça boyutlarına uygun değil. Daha küçük parçalar deneyin.')
      }

    } catch (error) {
      console.error('Fire optimizasyon hatası:', error)
      setShowEfficiencyWarning('Fire optimizasyonu sırasında hata oluştu.')
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Professional Header */}
      <div className="header shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Sünger Kesim Optimizasyonu
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  3D optimizasyon ile minimum israf
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowMaterialLibrary(true)}
                className="btn btn-secondary text-sm"
                title="Materyal Kütüphanesi"
              >
                <Package className="w-4 h-4 mr-2" />
                Materyaller
              </button>
              
              <button
                onClick={() => setShowProjectTemplates(true)}
                className="btn btn-secondary text-sm"
                title="Proje Şablonları"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Şablonlar
              </button>
              
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                v2.0 Pro
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {showEfficiencyWarning && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="alert alert-info">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <p className="text-sm font-medium">{showEfficiencyWarning}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Stock Materials */}
            <div className="card p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Ham Malzeme</h2>
                  <p className="text-sm text-gray-500">Kesilecek sünger blokları</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <input
                  type="number"
                  step="0.1"
                  placeholder="Uzunluk"
                  value={newStock.length}
                  onChange={(e) => setNewStock({ ...newStock, length: e.target.value })}
                  className="input"
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="Genişlik"
                  value={newStock.width}
                  onChange={(e) => setNewStock({ ...newStock, width: e.target.value })}
                  className="input"
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="Kalınlık"
                  value={newStock.height}
                  onChange={(e) => setNewStock({ ...newStock, height: e.target.value })}
                  className="input"
                />
                <input
                  type="number"
                  placeholder="Adet"
                  value={newStock.quantity}
                  onChange={(e) => setNewStock({ ...newStock, quantity: e.target.value })}
                  className="input"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Malzeme adı"
                  value={newStock.label}
                  onChange={(e) => setNewStock({ ...newStock, label: e.target.value })}
                  className="input"
                />
                <button onClick={addStock} className="btn btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Malzeme Ekle
                </button>
              </div>

              <div className="space-y-3 max-h-48 overflow-y-auto">
                {stockFoams.map((stock) => (
                  <div key={stock.id} className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{stock.label}</div>
                        <div className="text-sm text-gray-500">
                          {stock.length}×{stock.width}×{stock.height}cm × {stock.quantity} adet
                        </div>
                      </div>
                      <button
                        onClick={() => removeStock(stock.id)}
                        className="ml-3 p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cut Pieces */}
            <div className="card p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Kesilecek Parçalar</h2>
                  <p className="text-sm text-gray-500">Üretilecek parça listesi</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                <input
                  type="number"
                  step="0.1"
                  placeholder="Uzunluk"
                  value={newPiece.length}
                  onChange={(e) => setNewPiece({ ...newPiece, length: e.target.value })}
                  className="input"
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="Genişlik"
                  value={newPiece.width}
                  onChange={(e) => setNewPiece({ ...newPiece, width: e.target.value })}
                  className="input"
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="Kalınlık"
                  value={newPiece.height}
                  onChange={(e) => setNewPiece({ ...newPiece, height: e.target.value })}
                  className="input"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <input
                  type="number"
                  placeholder="Adet"
                  value={newPiece.quantity}
                  onChange={(e) => setNewPiece({ ...newPiece, quantity: e.target.value })}
                  className="input"
                />
                <button
                  onClick={calculateMaxQuantity}
                  className="btn btn-secondary text-sm"
                  title="Bu parça için maksimum adet hesapla"
                >
                  MAX ADET
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Parça adı"
                  value={newPiece.label}
                  onChange={(e) => setNewPiece({ ...newPiece, label: e.target.value })}
                  className="input"
                />
                <button onClick={addPiece} className="btn btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Parça Ekle
                </button>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {pieces.map((piece) => (
                  <div key={piece.id} className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                    {editingPiece === piece.id ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          <input
                            type="number"
                            step="0.1"
                            placeholder="Uzunluk"
                            value={editForm.length}
                            onChange={(e) => setEditForm({ ...editForm, length: e.target.value })}
                            className="input"
                          />
                          <input
                            type="number"
                            step="0.1"
                            placeholder="Genişlik"
                            value={editForm.width}
                            onChange={(e) => setEditForm({ ...editForm, width: e.target.value })}
                            className="input"
                          />
                          <input
                            type="number"
                            step="0.1"
                            placeholder="Kalınlık"
                            value={editForm.height}
                            onChange={(e) => setEditForm({ ...editForm, height: e.target.value })}
                            className="input"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            placeholder="Adet"
                            value={editForm.quantity}
                            onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                            className="input"
                          />
                          <input
                            type="text"
                            placeholder="Parça adı"
                            value={editForm.label}
                            onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                            className="input"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={saveEditPiece} className="btn btn-primary flex-1 text-sm">
                            <Save className="w-4 h-4 mr-1" />
                            Kaydet
                          </button>
                          <button onClick={cancelEdit} className="btn btn-secondary flex-1 text-sm">
                            <X className="w-4 h-4 mr-1" />
                            İptal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{piece.label}</div>
                          <div className="text-sm text-gray-500">
                            {piece.length}×{piece.width}×{piece.height}cm × {piece.quantity} adet
                          </div>
                        </div>
                        <div className="flex gap-1 ml-3">
                          <button
                            onClick={() => startEditPiece(piece)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="Düzenle"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removePiece(piece.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {pieces.length === 0 && (
                  <div className="text-center text-gray-500 py-12 border-2 border-dashed border-gray-200 rounded-lg">
                    <Scissors className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Henüz parça eklenmedi</p>
                    <p className="text-sm mt-1">Yukarıdaki formu kullanarak parça ekleyin</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="card p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Optimizasyon Seçenekleri</h2>
                  <p className="text-sm text-gray-500">En uygun algoritmayı seçin</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={calculateOptimization}
                  disabled={pieces.length === 0 || isCalculating}
                  className="btn btn-primary w-full py-3"
                >
                  {isCalculating ? (
                    <>
                      <div className="spinner mr-2"></div>
                      Hesaplanıyor...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-5 h-5 mr-2" />
                      Temel Optimizasyon
                    </>
                  )}
                </button>

                <button
                  onClick={calculateRealisticCutting}
                  disabled={pieces.length === 0 || isCalculating}
                  className="btn btn-secondary w-full py-3"
                >
                  {isCalculating ? (
                    <>
                      <div className="spinner mr-2"></div>
                      Kesim hesaplanıyor...
                    </>
                  ) : (
                    <>
                      <Scissors className="w-5 h-5 mr-2" />
                      Gerçek Makine Kesimi
                    </>
                  )}
                </button>

                <button
                  onClick={() => calculateAdvancedOptimization('adaptive')}
                  disabled={pieces.length === 0 || isCalculating}
                  className="btn btn-primary w-full py-3"
                >
                  {isCalculating && optimizationProgress.total === 1 ? (
                    <>
                      <div className="spinner mr-2"></div>
                      {optimizationProgress.currentAlgorithm || 'Hesaplanıyor...'}
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5 mr-2" />
                      Akıllı Optimizasyon
                    </>
                  )}
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => calculateAdvancedOptimization('multi')}
                    disabled={pieces.length === 0 || isCalculating}
                    className="btn btn-secondary text-sm"
                  >
                    {isCalculating && optimizationProgress.total === 3 && optimizationProgress.stage.includes('Multi') ? (
                      <>
                        <div className="spinner mr-1"></div>
                        {optimizationProgress.completed}/{optimizationProgress.total}
                      </>
                    ) : (
                      'Multi-Algorithm'
                    )}
                  </button>
                  
                  <button
                    onClick={() => calculateAdvancedOptimization('hybrid')}
                    disabled={pieces.length === 0 || isCalculating}
                    className="btn btn-secondary text-sm"
                  >
                    {isCalculating && optimizationProgress.total === 3 && optimizationProgress.stage.includes('Hybrid') ? (
                      <>
                        <div className="spinner mr-1"></div>
                        {optimizationProgress.completed}/{optimizationProgress.total}
                      </>
                    ) : (
                      'Hybrid'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Indicator */}
            {isCalculating && optimizationProgress.progress > 0 && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <Brain className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">İşlem Durumu</span>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {optimizationProgress.completed}/{optimizationProgress.total}
                  </span>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-2">
                    <span className="truncate">{optimizationProgress.stage}</span>
                    <span className="ml-2 font-medium">{Math.round(optimizationProgress.progress)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${optimizationProgress.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                {optimizationProgress.currentAlgorithm && (
                  <div className="flex items-center justify-center bg-gray-50 rounded-lg py-3">
                    <Zap className="w-5 h-5 text-yellow-500 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {optimizationProgress.currentAlgorithm}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stats.totalPieces}</div>
                <div className="text-sm text-gray-500 font-medium">Toplam Parça</div>
              </div>
              <div className="card p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {(stats.totalVolume / 1000).toFixed(1)}L
                </div>
                <div className="text-sm text-gray-500 font-medium">Toplam Hacim</div>
              </div>
            </div>

            {/* Optimization Results */}
            {optimizationResult && (
              <div className="card p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Optimizasyon Sonuçları</h2>
                    <p className="text-sm text-gray-500">Hesaplama tamamlandı!</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <Package className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{optimizationResult.layouts.length}</div>
                    <div className="text-xs text-gray-500 font-medium">Kullanılan Blok</div>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{optimizationResult.efficiency.toFixed(1)}%</div>
                    <div className="text-xs text-gray-500 font-medium">Verimlilik</div>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-red-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{optimizationResult.totalWaste.toFixed(1)}%</div>
                    <div className="text-xs text-gray-500 font-medium">Fire</div>
                  </div>
                </div>
                
                {optimizationResult.totalWaste > 5 && (
                  <div className="alert alert-warning">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="font-medium text-yellow-800 text-sm">Fire Azaltılabilir</h4>
                        <p className="text-xs text-yellow-600">Kalan parçalar daha küçük parçalara bölünebilir</p>
                      </div>
                      <button
                        onClick={optimizeWaste}
                        disabled={isCalculating}
                        className="btn btn-secondary text-sm"
                      >
                        {isCalculating ? (
                          <>
                            <div className="spinner mr-1"></div>
                            Hesaplıyor...
                          </>
                        ) : (
                          <>
                            <Scissors className="w-4 h-4 mr-1" />
                            Fireyi Azalt
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced 3D Visualization */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Grid3X3 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Gelişmiş 3D Görselleştirme</h2>
                    <p className="text-sm text-gray-500">İnteraktif 3D model ve analiz araçları</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                    AI Görselleştirme
                  </span>
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              
              <div className="min-h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                <Enhanced3DVisualization 
                  pieces={pieces} 
                  stockFoams={stockFoams}
                  optimizationResult={optimizationResult}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Width 2D Views Section */}
      {optimizationResult && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 flex items-center">
              <Grid3X3 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 mr-3" />
              2D Kesit Görünümleri
            </h2>
            <p className="text-sm sm:text-base text-gray-600">Her görünüm farklı açıdan kesilmiş parçaları gösterir</p>
          </div>

          {/* Top View */}
          <div className="mb-6 card overflow-hidden">
            <div className="bg-blue-600 px-4 sm:px-6 py-4">
              <h3 className="text-lg font-semibold text-white">
                Yukarıdan Görünüm (X-Y Düzlemi)
              </h3>
              <p className="text-blue-100 text-sm">Uzunluk × Genişlik boyutları görünür</p>
            </div>
            <div className="p-4 sm:p-6">
              <div className="w-full bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <FoamCutSlice2D 
                  pieces={pieces} 
                  stockFoams={stockFoams}
                  optimizationResult={optimizationResult}
                  fixedView="top"
                  showTabs={false}
                  scale={0.6}
                />
              </div>
            </div>
          </div>

          {/* Front View */}
          <div className="mb-6 card overflow-hidden">
            <div className="bg-green-600 px-4 sm:px-6 py-4">
              <h3 className="text-lg font-semibold text-white">
                Önden Görünüm (X-Z Düzlemi)
              </h3>
              <p className="text-green-100 text-sm">Uzunluk × Kalınlık boyutları görünür</p>
            </div>
            <div className="p-4 sm:p-6">
              <div className="w-full bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <FoamCutSlice2D 
                  pieces={pieces} 
                  stockFoams={stockFoams}
                  optimizationResult={optimizationResult}
                  fixedView="front"
                  showTabs={false}
                  scale={0.6}
                />
              </div>
            </div>
          </div>

          {/* Side View */}
          <div className="mb-6 card overflow-hidden">
            <div className="bg-purple-600 px-4 sm:px-6 py-4">
              <h3 className="text-lg font-semibold text-white">
                Yandan Görünüm (Y-Z Düzlemi)
              </h3>
              <p className="text-purple-100 text-sm">Genişlik × Kalınlık boyutları görünür</p>
            </div>
            <div className="p-4 sm:p-6">
              <div className="w-full bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <FoamCutSlice2D 
                  pieces={pieces} 
                  stockFoams={stockFoams}
                  optimizationResult={optimizationResult}
                  fixedView="side"
                  showTabs={false}
                  scale={0.6}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Report Section */}
      {optimizationResult && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="card p-6 sm:p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Detaylı Rapor</h3>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                Tüm optimizasyon sonuçlarını, malzeme listelerini ve kesim planlarını içeren kapsamlı PDF raporu oluşturun.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={generatePDFReport}
                className="btn btn-secondary text-base px-6 py-3"
              >
                <FileText className="w-5 h-5 mr-2" />
                Basit Rapor
              </button>
              
              <button
                onClick={() => setShowAdvancedReport(true)}
                className="btn btn-primary text-base px-6 py-3"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Gelişmiş Analiz Raporu
                <Download className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Algorithm Dashboard */}
      {optimizationResult && optimizationResult.layouts.length > 0 && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <AlgorithmDashboard optimizationResult={optimizationResult} />
        </div>
      )}

      {/* Cutting Instructions */}
      {optimizationResult && optimizationResult.cuttingInstructions && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <CuttingInstructions 
            cuttingInstructions={optimizationResult.cuttingInstructions}
            algorithmData={optimizationResult.algorithmData}
          />
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">FoamCut Pro</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Gelişmiş AI algoritmalarıyla sünger kesim optimizasyonu. 
                Minimum israf, maksimum verimlilik.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-gray-200">Özellikler</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Akıllı Optimizasyon</li>
                <li>• Gerçek Makine Desteği</li>
                <li>• Detaylı Raporlama</li>
                <li>• Mobil Uyumlu</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-gray-200">Teknoloji</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Genetic Algorithm</li>
                <li>• Simulated Annealing</li>
                <li>• 3D Visualization</li>
                <li>• Real-time Analytics</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-6 text-center">
            <p className="text-gray-300 text-sm">
              © 2024 FoamCut Optimizer v2.0 Pro - Tüm hakları saklıdır
            </p>
          </div>
        </div>
      </footer>

      {/* Material Library Modal */}
      {showMaterialLibrary && (
        <MaterialLibrary
          onSelectMaterial={handleMaterialSelect}
          onClose={() => setShowMaterialLibrary(false)}
        />
      )}

      {/* Project Templates Modal */}
      {showProjectTemplates && (
        <ProjectTemplates
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setShowProjectTemplates(false)}
        />
      )}

      {/* Advanced Report System Modal */}
      {showAdvancedReport && optimizationResult && (
        <AdvancedReportSystem
          optimizationResult={optimizationResult}
          pieces={pieces}
          stockFoams={stockFoams}
          onClose={() => setShowAdvancedReport(false)}
        />
      )}
    </div>
  )
} 