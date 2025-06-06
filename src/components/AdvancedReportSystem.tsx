'use client'

import { useState, useMemo } from 'react'
import { 
  FileText, Download, Printer, Share2, Eye, BarChart3, PieChart, TrendingUp,
  Scissors, Package, AlertTriangle, CheckCircle, Clock, Zap, 
  ArrowRight, Maximize2, Layers, Grid3X3, Calculator, Target
} from 'lucide-react'

interface AdvancedReportSystemProps {
  optimizationResult: any
  pieces: any[]
  stockFoams: any[]
  onClose: () => void
}

export default function AdvancedReportSystem({ 
  optimizationResult, 
  pieces, 
  stockFoams, 
  onClose 
}: AdvancedReportSystemProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'cutting' | 'economics' | 'detailed'>('overview')
  const [reportFormat, setReportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf')

  // Gelişmiş analitik hesaplamalar
  const analytics = useMemo(() => {
    if (!optimizationResult) return null

    const totalStockVolume = stockFoams.reduce((sum, stock) => 
      sum + (stock.length * stock.width * stock.height * stock.quantity), 0
    )
    
    const totalPieceVolume = pieces.reduce((sum, piece) => 
      sum + (piece.length * piece.width * piece.height * piece.quantity), 0
    )

    const usedStocks = optimizationResult.layouts.length
    const totalStocks = stockFoams.reduce((sum, stock) => sum + stock.quantity, 0)

    const cuttingComplexity = optimizationResult.layouts.reduce((sum: number, layout: any) => 
      sum + layout.pieces.length, 0
    )

    const averageUtilization = optimizationResult.layouts.reduce((sum: number, layout: any) => 
      sum + layout.utilization, 0) / optimizationResult.layouts.length

    // Maliyet analizi
    const materialCost = stockFoams.reduce((sum, stock) => {
      const used = optimizationResult.layouts.filter((l: any) => l.stockId === stock.id).length
      return sum + (used * (stock.price || 0))
    }, 0)

    const wasteCost = materialCost * (optimizationResult.totalWaste / 100)
    const efficiencyScore = optimizationResult.efficiency
    
    // Zaman tahmini (kesim süreleri)
    const cuttingTime = cuttingComplexity * 2.5 // dakika per parça
    const setupTime = usedStocks * 15 // dakika per stok
    const totalTime = cuttingTime + setupTime

    return {
      totalStockVolume: totalStockVolume / 1000, // Litre
      totalPieceVolume: totalPieceVolume / 1000, // Litre
      usedStocks,
      totalStocks,
      stockUtilization: (usedStocks / totalStocks) * 100,
      cuttingComplexity,
      averageUtilization,
      materialCost,
      wasteCost,
      netCost: materialCost - wasteCost,
      efficiencyScore,
      cuttingTime,
      setupTime,
      totalTime,
      piecesPerHour: (pieces.reduce((sum, p) => sum + p.quantity, 0) / (totalTime / 60)),
      wasteVolume: (totalStockVolume * optimizationResult.totalWaste / 100) / 1000
    }
  }, [optimizationResult, pieces, stockFoams])

  // Kesim talimatları oluşturma
  const generateCuttingInstructions = () => {
    if (!optimizationResult) return []

    const instructions: any[] = []

    optimizationResult.layouts.forEach((layout: any, layoutIndex: number) => {
      const stock = stockFoams.find(s => s.id === layout.stockId)
      if (!stock) return

      instructions.push({
        type: 'setup',
        step: instructions.length + 1,
        title: `${stock.label} Hazırlığı`,
        description: `${stock.length}×${stock.width}×${stock.height}cm boyutlarındaki malzemeyi kesim masasına yerleştirin`,
        time: '15 dakika',
        tools: ['Ölçü aleti', 'İşaretleme kalemi', 'Kesim bıçağı'],
        safety: ['Eldiven takın', 'Gözlük kullanın', 'Çalışma alanını temizleyin']
      })

      // Her parça için kesim talimatı
      layout.pieces.forEach((placedPiece: any, pieceIndex: number) => {
        const originalPiece = pieces.find(p => placedPiece.pieceId.startsWith(p.id))
        if (!originalPiece) return

        instructions.push({
          type: 'cut',
          step: instructions.length + 1,
          title: `${originalPiece.label} Kesimi`,
          description: `Pozisyon: X=${(placedPiece.x/10).toFixed(1)}cm, Y=${(placedPiece.y/10).toFixed(1)}cm, Z=${(placedPiece.z/10).toFixed(1)}cm`,
          dimensions: `${originalPiece.length}×${originalPiece.width}×${originalPiece.height}cm`,
          time: '2.5 dakika',
          rotated: placedPiece.rotated || false,
          color: originalPiece.color,
          sequence: pieceIndex + 1,
          totalInLayout: layout.pieces.length
        })
      })

      instructions.push({
        type: 'quality',
        step: instructions.length + 1,
        title: 'Kalite Kontrolü',
        description: `Blok ${layoutIndex + 1} için tüm parçaları kontrol edin`,
        time: '5 dakika',
        checkpoints: [
          'Boyut doğruluğu',
          'Yüzey kalitesi',
          'Kenar düzgünlüğü',
          'Etiketleme'
        ]
      })
    })

    return instructions
  }

  // PDF raporu oluşturma
  const generateAdvancedPDFReport = () => {
    if (!optimizationResult || !analytics) return

    const instructions = generateCuttingInstructions()
    
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Gelişmiş Sünger Kesim Raporu</title>
        <style>
          @page { margin: 15mm; size: A4; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333;
            background: #f8f9fa;
          }
          .container { max-width: 100%; margin: 0 auto; background: white; padding: 20px; }
          .header { 
            text-align: center; 
            border-bottom: 3px solid #3b82f6; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin: -20px -20px 30px -20px;
            padding: 30px 20px 20px 20px;
          }
          .logo { max-width: 80px; height: auto; margin-bottom: 10px; }
          .section { margin-bottom: 30px; page-break-inside: avoid; }
          .section h2 { 
            color: #1e293b; 
            border-bottom: 2px solid #e2e8f0; 
            padding-bottom: 10px;
            font-size: 1.5em;
            display: flex;
            align-items: center;
          }
          .icon { width: 20px; height: 20px; margin-right: 10px; }
          .stats-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 20px; 
            margin: 20px 0; 
          }
          .stat-card { 
            background: #f8fafc; 
            padding: 20px; 
            border-radius: 10px; 
            text-align: center;
            border-left: 4px solid #3b82f6;
          }
          .stat-value { 
            font-size: 2em; 
            font-weight: bold; 
            color: #3b82f6; 
            margin-bottom: 5px;
          }
          .stat-label { 
            color: #64748b; 
            font-size: 0.9em; 
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .cutting-instruction {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }
          .instruction-header {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            font-weight: bold;
            color: #1e293b;
          }
          .instruction-step {
            background: #3b82f6;
            color: white;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            font-size: 0.9em;
          }
          .piece-color {
            width: 20px;
            height: 20px;
            border-radius: 4px;
            margin-right: 10px;
            border: 1px solid #ccc;
          }
          .warning-box {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin: 15px 0;
          }
          .success-box {
            background: #ecfdf5;
            border: 1px solid #10b981;
            border-radius: 6px;
            padding: 15px;
            margin: 15px 0;
          }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { 
            border: 1px solid #e2e8f0; 
            padding: 12px; 
            text-align: left;
            font-size: 0.9em;
          }
          th { 
            background: #f8fafc; 
            font-weight: 600;
            color: #374151;
          }
          .efficiency-high { color: #10b981; font-weight: bold; }
          .efficiency-medium { color: #f59e0b; font-weight: bold; }
          .efficiency-low { color: #ef4444; font-weight: bold; }
          .page-break { page-break-before: always; }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 0.8em;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Gelişmiş Sünger Kesim Raporu</h1>
            <p>Oluşturulma: ${new Date().toLocaleDateString('tr-TR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            <p>AI Destekli Optimizasyon Sonuçları</p>
          </div>

          <!-- Executive Summary -->
          <div class="section">
            <h2>📊 Yönetici Özeti</h2>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">${analytics.efficiencyScore.toFixed(1)}%</div>
                <div class="stat-label">Toplam Verimlilik</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${analytics.wasteVolume.toFixed(1)}L</div>
                <div class="stat-label">Fire Miktarı</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${analytics.usedStocks}/${analytics.totalStocks}</div>
                <div class="stat-label">Kullanılan Blok</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${Math.round(analytics.totalTime)} dk</div>
                <div class="stat-label">Tahmini Süre</div>
              </div>
            </div>
            
            <div class="${analytics.efficiencyScore >= 90 ? 'success-box' : analytics.efficiencyScore >= 70 ? 'warning-box' : 'warning-box'}">
              <strong>Performans Değerlendirmesi:</strong> 
              ${analytics.efficiencyScore >= 90 ? 'Mükemmel - Çok yüksek verimlilik!' : 
                analytics.efficiencyScore >= 70 ? 'İyi - Kabul edilebilir verimlilik seviyesi' : 
                'Geliştirilmeli - Düşük verimlilik, parça boyutlarını gözden geçirin'}
            </div>
          </div>

          <!-- Economic Analysis -->
          <div class="section">
            <h2>💰 Ekonomik Analiz</h2>
            <table>
              <tr>
                <th>Maliyet Kalemi</th>
                <th>Miktar</th>
                <th>Birim</th>
                <th>Toplam</th>
              </tr>
              <tr>
                <td>Ham Malzeme</td>
                <td>${analytics.totalStockVolume.toFixed(1)}</td>
                <td>₺/L</td>
                <td>₺${analytics.materialCost.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Fire Maliyeti</td>
                <td>${analytics.wasteVolume.toFixed(1)}</td>
                <td>₺/L</td>
                <td class="efficiency-low">₺${analytics.wasteCost.toFixed(2)}</td>
              </tr>
              <tr>
                <td>İşçilik (${Math.round(analytics.totalTime)} dk)</td>
                <td>${(analytics.totalTime/60).toFixed(1)}</td>
                <td>₺/saat</td>
                <td>₺${((analytics.totalTime/60) * 50).toFixed(2)}</td>
              </tr>
              <tr style="background: #f8fafc; font-weight: bold;">
                <td>TOPLAM MALİYET</td>
                <td>-</td>
                <td>-</td>
                <td class="efficiency-high">₺${(analytics.materialCost + (analytics.totalTime/60) * 50).toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <!-- Production Plan -->
          <div class="section page-break">
            <h2>🔄 Üretim Planı</h2>
            <p><strong>Tahmini Üretim Süresi:</strong> ${Math.round(analytics.totalTime)} dakika (${(analytics.totalTime/60).toFixed(1)} saat)</p>
            <p><strong>Saatlik Üretim:</strong> ${analytics.piecesPerHour.toFixed(1)} parça/saat</p>
            <p><strong>Kesim Karmaşıklığı:</strong> ${analytics.cuttingComplexity} farklı kesim</p>
            
            <h3>⚠️ Güvenlik Uyarıları</h3>
            <ul>
              <li>Kesim işlemlerinde daima koruyucu eldiven kullanın</li>
              <li>Keskin bıçakları güvenli şekilde saklayın</li>
              <li>Çalışma alanını temiz ve düzenli tutun</li>
              <li>Havalandırmaya dikkat edin</li>
            </ul>
          </div>

          <!-- Cutting Instructions -->
          <div class="section">
            <h2>✂️ Detaylı Kesim Talimatları</h2>
            ${instructions.map(instruction => `
              <div class="cutting-instruction">
                <div class="instruction-header">
                  <div class="instruction-step">${instruction.step}</div>
                  <div>
                    <strong>${instruction.title}</strong>
                    ${instruction.time ? `<span style="color: #64748b; margin-left: 10px;">⏱️ ${instruction.time}</span>` : ''}
                  </div>
                  ${instruction.color ? `<div class="piece-color" style="background-color: ${instruction.color}"></div>` : ''}
                </div>
                <p>${instruction.description}</p>
                ${instruction.dimensions ? `<p><strong>Boyutlar:</strong> ${instruction.dimensions}</p>` : ''}
                ${instruction.rotated ? '<p><span style="color: #f59e0b;">⚠️ Bu parça döndürülmüş konumda</span></p>' : ''}
                ${instruction.tools ? `<p><strong>Gerekli Araçlar:</strong> ${instruction.tools.join(', ')}</p>` : ''}
                ${instruction.safety ? `<p><strong>Güvenlik:</strong> ${instruction.safety.join(', ')}</p>` : ''}
                ${instruction.checkpoints ? `
                  <p><strong>Kontrol Noktaları:</strong></p>
                  <ul>${instruction.checkpoints.map((cp: string) => `<li>${cp}</li>`).join('')}</ul>
                ` : ''}
              </div>
            `).join('')}
          </div>

          <!-- Material Details -->
          <div class="section page-break">
            <h2>📦 Malzeme Detayları</h2>
            <table>
              <thead>
                <tr>
                  <th>Malzeme</th>
                  <th>Boyutlar (cm)</th>
                  <th>Adet</th>
                  <th>Hacim</th>
                  <th>Kullanım</th>
                  <th>Verimlilik</th>
                </tr>
              </thead>
              <tbody>
                ${optimizationResult.layouts.map((layout: any) => {
                  const stock = stockFoams.find((s: any) => s.id === layout.stockId)
                  return stock ? `
                    <tr>
                      <td>${stock.label}</td>
                      <td>${stock.length}×${stock.width}×${stock.height}</td>
                      <td>1</td>
                      <td>${((stock.length * stock.width * stock.height)/1000).toFixed(1)}L</td>
                      <td>${layout.pieces.length} parça</td>
                      <td class="${layout.utilization >= 80 ? 'efficiency-high' : layout.utilization >= 60 ? 'efficiency-medium' : 'efficiency-low'}">${layout.utilization.toFixed(1)}%</td>
                    </tr>
                  ` : ''
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- Piece Details -->
          <div class="section">
            <h2>🔷 Parça Detayları</h2>
            <table>
              <thead>
                <tr>
                  <th>Parça Adı</th>
                  <th>Boyutlar (cm)</th>
                  <th>Adet</th>
                  <th>Birim Hacim</th>
                  <th>Toplam Hacim</th>
                </tr>
              </thead>
              <tbody>
                ${pieces.map(piece => `
                  <tr>
                    <td>
                      <div style="display: flex; align-items: center;">
                        <div class="piece-color" style="background-color: ${piece.color}"></div>
                        ${piece.label}
                      </div>
                    </td>
                    <td>${piece.length}×${piece.width}×${piece.height}</td>
                    <td>${piece.quantity}</td>
                    <td>${((piece.length * piece.width * piece.height)/1000).toFixed(3)}L</td>
                    <td>${((piece.length * piece.width * piece.height * piece.quantity)/1000).toFixed(1)}L</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="footer">
            <p>Bu rapor FoamCut Pro v2.0 ile AI destekli optimizasyon algoritmaları kullanılarak oluşturulmuştur.</p>
            <p>🤖 Generated with Claude AI • © 2024 FoamCut Optimizer</p>
          </div>
        </div>
      </body>
      </html>
    `

    // PDF'i yeni pencerede aç
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(reportHTML)
      printWindow.document.close()
      printWindow.print()
    }
  }

  // Tab içeriği render fonksiyonu
  const renderTabContent = () => {
    if (!analytics) return null

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Ana Metrikler */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3">
                  <Target className="w-8 h-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-blue-900">{analytics.efficiencyScore.toFixed(1)}%</div>
                    <div className="text-sm text-blue-600">Verimlilik</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <Package className="w-8 h-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-green-900">{analytics.usedStocks}/{analytics.totalStocks}</div>
                    <div className="text-sm text-green-600">Kullanılan Blok</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-8 h-8 text-yellow-600" />
                  <div>
                    <div className="text-2xl font-bold text-yellow-900">{analytics.wasteVolume.toFixed(1)}L</div>
                    <div className="text-sm text-yellow-600">Fire Miktarı</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-3">
                  <Clock className="w-8 h-8 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold text-purple-900">{Math.round(analytics.totalTime)}</div>
                    <div className="text-sm text-purple-600">Dakika</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performans Analizi */}
            <div className="card-elevated p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                Performans Analizi
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Malzeme Verimliliği</span>
                    <span className="text-sm text-gray-600">{analytics.efficiencyScore.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${analytics.efficiencyScore}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Stok Kullanım Oranı</span>
                    <span className="text-sm text-gray-600">{analytics.stockUtilization.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${analytics.stockUtilization}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Üretim Hızı</span>
                    <span className="text-sm text-gray-600">{analytics.piecesPerHour.toFixed(1)} parça/saat</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(analytics.piecesPerHour * 2, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ekonomik Özet */}
            <div className="card-elevated p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Calculator className="w-5 h-5 mr-2 text-green-600" />
                Ekonomik Özet
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">₺{analytics.materialCost.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Malzeme Maliyeti</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">₺{analytics.wasteCost.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Fire Maliyeti</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">₺{((analytics.totalTime/60) * 50).toFixed(2)}</div>
                  <div className="text-sm text-gray-600">İşçilik Maliyeti</div>
                </div>
              </div>
            </div>
          </div>
        )
        
      case 'cutting':
        const instructions = generateCuttingInstructions()
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <Scissors className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-900">Kesim Talimatları</h3>
                  <p className="text-sm text-blue-700">Toplam {instructions.length} adım • Tahmini süre: {Math.round(analytics.totalTime)} dakika</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {instructions.map((instruction, index) => (
                <div key={index} className="card p-4 border-l-4 border-blue-500">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {instruction.step}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{instruction.title}</h4>
                        {instruction.time && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            ⏱️ {instruction.time}
                          </span>
                        )}
                        {instruction.color && (
                          <div 
                            className="w-4 h-4 rounded border border-gray-300"
                            style={{ backgroundColor: instruction.color }}
                          />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{instruction.description}</p>
                      
                      {instruction.dimensions && (
                        <p className="text-sm font-medium text-gray-800">📏 {instruction.dimensions}</p>
                      )}
                      
                      {instruction.rotated && (
                        <div className="bg-yellow-50 text-yellow-800 text-xs p-2 rounded mt-2">
                          ⚠️ Bu parça döndürülmüş konumda kesim yapılacak
                        </div>
                      )}
                      
                      {instruction.tools && (
                        <div className="mt-2">
                          <span className="text-xs font-medium text-gray-700">Gerekli Araçlar: </span>
                          <span className="text-xs text-gray-600">{instruction.tools.join(', ')}</span>
                        </div>
                      )}
                      
                      {instruction.checkpoints && (
                        <div className="mt-2">
                          <span className="text-xs font-medium text-gray-700">Kontrol Noktaları:</span>
                          <ul className="text-xs text-gray-600 mt-1">
                            {instruction.checkpoints.map((cp: string, i: number) => (
                              <li key={i}>• {cp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
        
      case 'economics':
        return (
          <div className="space-y-6">
            {/* Maliyet Dağılımı */}
            <div className="card-elevated p-6">
              <h3 className="text-lg font-semibold mb-4">💰 Detaylı Maliyet Analizi</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">Ham Malzeme</span>
                  <span className="font-bold text-green-600">₺{analytics.materialCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">Fire Maliyeti ({optimizationResult.totalWaste.toFixed(1)}%)</span>
                  <span className="font-bold text-red-600">₺{analytics.wasteCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">İşçilik ({(analytics.totalTime/60).toFixed(1)} saat)</span>
                  <span className="font-bold text-blue-600">₺{((analytics.totalTime/60) * 50).toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded font-bold">
                    <span>TOPLAM MALİYET</span>
                    <span className="text-blue-600">₺{(analytics.materialCost + (analytics.totalTime/60) * 50).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tasarruf Fırsatları */}
            <div className="card-elevated p-6">
              <h3 className="text-lg font-semibold mb-4">💡 Tasarruf Fırsatları</h3>
              
              <div className="space-y-3">
                {analytics.efficiencyScore < 80 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800">Düşük Verimlilik</h4>
                        <p className="text-sm text-yellow-700">
                          Verimlilik %{analytics.efficiencyScore.toFixed(1)} seviyesinde. Parça boyutlarını optimize ederek 
                          ₺{(analytics.wasteCost * 0.5).toFixed(2)} tasarruf sağlayabilirsiniz.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {analytics.stockUtilization < 100 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Package className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-800">Fazla Stok</h4>
                        <p className="text-sm text-blue-700">
                          {analytics.totalStocks - analytics.usedStocks} blok kullanılmadı. 
                          Daha büyük parçalar ekleyerek stok kullanımını artırabilirsiniz.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800">Optimizasyon Başarılı</h4>
                      <p className="text-sm text-green-700">
                        Mevcut tasarım dengeli ve verimli. Üretim planınız uygulanabilir durumda.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
        
      case 'detailed':
        return (
          <div className="space-y-6">
            {/* Blok Detayları */}
            <div className="card-elevated p-6">
              <h3 className="text-lg font-semibold mb-4">📦 Blok Bazında Analiz</h3>
              
              <div className="space-y-4">
                {optimizationResult.layouts.map((layout: any, index: number) => {
                  const stock = stockFoams.find((s: any) => s.id === layout.stockId)
                  if (!stock) return null
                  
                  return (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium">Blok {index + 1}: {stock.label}</h4>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          layout.utilization >= 80 ? 'bg-green-100 text-green-800' :
                          layout.utilization >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {layout.utilization.toFixed(1)}% verimlilik
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Boyutlar:</span>
                          <br />
                          <span className="font-medium">{stock.length}×{stock.width}×{stock.height}cm</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Hacim:</span>
                          <br />
                          <span className="font-medium">{((stock.length * stock.width * stock.height)/1000).toFixed(1)}L</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Parça Sayısı:</span>
                          <br />
                          <span className="font-medium">{layout.pieces.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Fire:</span>
                          <br />
                          <span className="font-medium">{(100 - layout.utilization).toFixed(1)}%</span>
                        </div>
                      </div>
                      
                      {/* Parça Listesi */}
                      <div className="mt-4">
                        <h5 className="text-sm font-medium mb-2">Yerleştirilen Parçalar:</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          {layout.pieces.map((placedPiece: any, pIndex: number) => {
                            const originalPiece = pieces.find(p => placedPiece.pieceId.startsWith(p.id))
                            if (!originalPiece) return null
                            
                            return (
                              <div key={pIndex} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                                <div 
                                  className="w-3 h-3 rounded border"
                                  style={{ backgroundColor: originalPiece.color }}
                                />
                                <span className="flex-1">{originalPiece.label}</span>
                                <span className="text-gray-500">
                                  ({(placedPiece.x/10).toFixed(1)}, {(placedPiece.y/10).toFixed(1)}, {(placedPiece.z/10).toFixed(1)})
                                </span>
                                {placedPiece.rotated && <span className="text-yellow-600">↻</span>}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
        
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col modal-content">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Gelişmiş Rapor Sistemi</h2>
              <p className="text-sm text-gray-500">Detaylı analiz ve kesim talimatları</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={reportFormat}
              onChange={(e) => setReportFormat(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="pdf">PDF Raporu</option>
              <option value="excel">Excel Dosyası</option>
              <option value="csv">CSV Verileri</option>
            </select>
            
            <button
              onClick={generateAdvancedPDFReport}
              className="btn btn-primary text-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Rapor İndir
            </button>
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { key: 'overview', label: 'Genel Bakış', icon: BarChart3 },
              { key: 'cutting', label: 'Kesim Talimatları', icon: Scissors },
              { key: 'economics', label: 'Ekonomik Analiz', icon: TrendingUp },
              { key: 'detailed', label: 'Detaylı Rapor', icon: Grid3X3 }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}