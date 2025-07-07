import React, { useState, useEffect } from 'react'
import { BookOpen, Plus, BarChart3, Bug, Search, Heart, Clock, Filter, Grid, List, ChevronDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../ui/resizable'
import { Badge } from '../ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { useIsMobile } from '../../hooks/use-mobile'
import VadeMecumSearch from './VadeMecumSearchEnhanced'
import VadeMecumList from './VadeMecumListEnhanced'
import VadeMecumViewer from './VadeMecumViewerEnhanced'
import VadeMecumStats from './VadeMecumStats'
import VadeMecumDebug from './VadeMecumDebug'
import { 
  getAllVadeMecumDocuments, 
  searchVadeMecum, 
  getVadeMecumByType,
  getVadeMecumStats
} from '../../services/vadeMecumService'

const VadeMecum = () => {
  const [documents, setDocuments] = useState([])
  const [filteredDocuments, setFilteredDocuments] = useState([])
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const [activeTab, setActiveTab] = useState("browse")
  const [showSearch, setShowSearch] = useState(false)
  const [panelSizes, setPanelSizes] = useState([40, 60])
  const [viewMode, setViewMode] = useState('grid') // 'grid' ou 'list'
  const [sortBy, setSortBy] = useState('recent') // 'recent', 'alphabetical', 'type'
  const [favorites, setFavorites] = useState(new Set())
  const [recentlyViewed, setRecentlyViewed] = useState([])
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const isMobile = useIsMobile()

  // Restaurar dados do localStorage
  useEffect(() => {
    const savedSizes = localStorage.getItem('vademecum-panel-sizes')
    const savedFavorites = localStorage.getItem('vademecum-favorites')
    const savedRecentlyViewed = localStorage.getItem('vademecum-recent')
    const savedViewMode = localStorage.getItem('vademecum-view-mode')
    const savedSortBy = localStorage.getItem('vademecum-sort-by')

    if (savedSizes) {
      try {
        const sizes = JSON.parse(savedSizes)
        if (Array.isArray(sizes) && sizes.length === 2) {
          setPanelSizes(sizes)
        }
      } catch (error) {
        console.error('Erro ao restaurar proporções dos painéis:', error)
      }
    }

    if (savedFavorites) {
      try {
        setFavorites(new Set(JSON.parse(savedFavorites)))
      } catch (error) {
        console.error('Erro ao restaurar favoritos:', error)
      }
    }

    if (savedRecentlyViewed) {
      try {
        setRecentlyViewed(JSON.parse(savedRecentlyViewed))
      } catch (error) {
        console.error('Erro ao restaurar histórico:', error)
      }
    }

    if (savedViewMode) {
      setViewMode(savedViewMode)
    }

    if (savedSortBy) {
      setSortBy(savedSortBy)
    }
  }, [])

  // Carregar todos os documentos na inicialização
  useEffect(() => {
    loadAllDocuments()
    loadStats()
  }, [])

  // Aplicar filtros e ordenação
  useEffect(() => {
    let filtered = [...documents]

    // Filtrar favoritos se ativo
    if (showFavoritesOnly) {
      filtered = filtered.filter(doc => favorites.has(doc.id))
    }

    // Aplicar ordenação
    switch (sortBy) {
      case 'alphabetical':
        filtered.sort((a, b) => a.titulo.localeCompare(b.titulo))
        break
      case 'type':
        filtered.sort((a, b) => a.tipo.localeCompare(b.tipo))
        break
      case 'recent':
      default:
        // Manter ordem original ou por data de criação
        break
    }

    setFilteredDocuments(filtered)
  }, [documents, favorites, showFavoritesOnly, sortBy])

  const loadAllDocuments = async () => {
    setLoading(true)
    try {
      const result = await getAllVadeMecumDocuments()
      if (result.success) {
        setDocuments(result.documents)
        setFilteredDocuments(result.documents)
      } else {
        console.error('Erro ao carregar documentos:', result.error)
      }
    } catch (error) {
      console.error('Erro ao carregar documentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const result = await getVadeMecumStats()
      if (result.success) {
        setStats(result.stats)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const handleSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredDocuments(documents)
      return
    }

    setSearchLoading(true)
    try {
      const result = await searchVadeMecum(searchTerm)
      if (result.success) {
        setFilteredDocuments(result.documents)
      } else {
        console.error('Erro na busca:', result.error)
      }
    } catch (error) {
      console.error('Erro na busca:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleFilterByType = async (type) => {
    if (!type) {
      setFilteredDocuments(documents)
      return
    }

    setSearchLoading(true)
    try {
      const result = await getVadeMecumByType(type)
      if (result.success) {
        setFilteredDocuments(result.documents)
      } else {
        console.error('Erro no filtro:', result.error)
      }
    } catch (error) {
      console.error('Erro no filtro:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleDocumentSelect = (document) => {
    setSelectedDocument(document)
    
    // Adicionar ao histórico
    const newRecentlyViewed = [
      document,
      ...recentlyViewed.filter(doc => doc.id !== document.id)
    ].slice(0, 10) // Manter apenas os 10 mais recentes
    
    setRecentlyViewed(newRecentlyViewed)
    localStorage.setItem('vademecum-recent', JSON.stringify(newRecentlyViewed))
  }

  const handleCloseViewer = () => {
    setSelectedDocument(null)
  }

  const toggleFavorite = (documentId) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(documentId)) {
      newFavorites.delete(documentId)
    } else {
      newFavorites.add(documentId)
    }
    setFavorites(newFavorites)
    localStorage.setItem('vademecum-favorites', JSON.stringify([...newFavorites]))
  }

  const handleViewModeChange = (mode) => {
    setViewMode(mode)
    localStorage.setItem('vademecum-view-mode', mode)
  }

  const handleSortChange = (sort) => {
    setSortBy(sort)
    localStorage.setItem('vademecum-sort-by', sort)
  }

  const getSortLabel = (sort) => {
    const labels = {
      'recent': 'Mais Recentes',
      'alphabetical': 'Alfabética',
      'type': 'Por Tipo'
    }
    return labels[sort] || sort
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header melhorado */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
            <BookOpen className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              Vade Mecum
            </h1>
          </div>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Acesse rapidamente leis, decretos, portarias e outros documentos legais organizados e pesquisáveis.
          Agora com favoritos, histórico e interface aprimorada.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-center">
          <TabsList className="grid w-full grid-cols-2 lg:w-96">
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Navegar
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Estatísticas
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="browse" className="space-y-6">
          {/* Barra de ações melhorada */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Toggle de busca para mobile */}
              {isMobile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSearch(!showSearch)}
                  className="flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  {showSearch ? 'Ocultar Busca' : 'Buscar'}
                </Button>
              )}

              {/* Filtro de favoritos */}
              <Button
                variant={showFavoritesOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className="flex items-center gap-2"
              >
                <Heart className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                Favoritos
                {favorites.size > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {favorites.size}
                  </Badge>
                )}
              </Button>

              {/* Histórico */}
              {recentlyViewed.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Histórico
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {recentlyViewed.length}
                      </Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-80">
                    {recentlyViewed.slice(0, 5).map((doc) => (
                      <DropdownMenuItem
                        key={doc.id}
                        onClick={() => handleDocumentSelect(doc)}
                        className="flex flex-col items-start p-3"
                      >
                        <span className="font-medium text-sm">{doc.titulo}</span>
                        <span className="text-xs text-muted-foreground">{doc.tipo}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Controles de visualização */}
            <div className="flex items-center gap-2">
              {/* Ordenação */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    {getSortLabel(sortBy)}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleSortChange('recent')}>
                    Mais Recentes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange('alphabetical')}>
                    Ordem Alfabética
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange('type')}>
                    Por Tipo
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Modo de visualização */}
              {!isMobile && (
                <div className="flex items-center border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleViewModeChange('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleViewModeChange('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Componente de busca */}
          {(!isMobile || showSearch) && (
            <VadeMecumSearch
              onSearch={handleSearch}
              onFilterByType={handleFilterByType}
              loading={searchLoading}
            />
          )}

          {/* Contador de resultados melhorado */}
          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground">
              {filteredDocuments.length > 0 ? (
                <span className="flex items-center gap-2">
                  Mostrando {filteredDocuments.length} documento(s)
                  {filteredDocuments.length !== documents.length && 
                    ` de ${documents.length} total`
                  }
                  {showFavoritesOnly && (
                    <Badge variant="outline" className="text-xs">
                      Apenas Favoritos
                    </Badge>
                  )}
                </span>
              ) : (
                <span>Nenhum documento encontrado</span>
              )}
            </div>
          </div>

          {/* Layout principal */}
          {isMobile ? (
            <div className="space-y-4">
              <div className="h-[350px] border rounded-lg overflow-hidden bg-muted/30">
                <div className="h-full overflow-auto p-4 custom-scrollbar">
                  <VadeMecumList
                    documents={filteredDocuments}
                    onDocumentSelect={handleDocumentSelect}
                    loading={loading}
                    selectedDocument={selectedDocument}
                    viewMode={viewMode}
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                  />
                </div>
              </div>
              <div className="h-[450px] border rounded-lg overflow-hidden bg-background">
                <div className="h-full overflow-auto custom-scrollbar">
                  {selectedDocument ? (
                    <VadeMecumViewer
                      document={selectedDocument}
                      onClose={handleCloseViewer}
                      isEmbedded={true}
                      isFavorite={favorites.has(selectedDocument.id)}
                      onToggleFavorite={() => toggleFavorite(selectedDocument.id)}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground p-8">
                      <div className="text-center">
                        <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">Selecione um documento</p>
                        <p className="text-sm">Escolha um documento da lista acima para visualizar seu conteúdo</p>
                        {favorites.size > 0 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            💡 Dica: Use o botão "Favoritos" para ver apenas seus documentos marcados
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-grow border rounded-lg overflow-hidden min-h-[650px] bg-background shadow-sm">
              <ResizablePanelGroup 
                direction="horizontal" 
                className="h-full"
                onLayout={(sizes) => {
                  localStorage.setItem('vademecum-panel-sizes', JSON.stringify(sizes))
                  setPanelSizes(sizes)
                }}
              >
                <ResizablePanel 
                  defaultSize={panelSizes[0]} 
                  minSize={25} 
                  maxSize={70}
                  className="min-w-0"
                >
                  <div className="h-full overflow-auto p-4 bg-muted/30 custom-scrollbar">
                    <VadeMecumList
                      documents={filteredDocuments}
                      onDocumentSelect={handleDocumentSelect}
                      loading={loading}
                      selectedDocument={selectedDocument}
                      viewMode={viewMode}
                      favorites={favorites}
                      onToggleFavorite={toggleFavorite}
                    />
                  </div>
                </ResizablePanel>
                
                <ResizableHandle withHandle className="bg-border hover:bg-accent transition-colors" />
                
                <ResizablePanel 
                  defaultSize={panelSizes[1]} 
                  minSize={30} 
                  maxSize={75}
                  className="min-w-0"
                >
                  <div className="h-full overflow-auto bg-background custom-scrollbar">
                    {selectedDocument ? (
                      <VadeMecumViewer
                        document={selectedDocument}
                        onClose={handleCloseViewer}
                        isEmbedded={true}
                        isFavorite={favorites.has(selectedDocument.id)}
                        onToggleFavorite={() => toggleFavorite(selectedDocument.id)}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground p-8">
                        <div className="text-center max-w-md">
                          <BookOpen className="h-20 w-20 mx-auto mb-6 opacity-50" />
                          <p className="text-xl font-medium mb-3">Selecione um documento</p>
                          <p className="text-sm mb-4">
                            Escolha um documento da lista à esquerda para visualizar seu conteúdo completo
                          </p>
                          {favorites.size > 0 && (
                            <div className="bg-muted/50 rounded-lg p-4 text-left">
                              <p className="text-xs text-muted-foreground">
                                💡 <strong>Dica:</strong> Use o botão "Favoritos" para filtrar apenas seus documentos marcados, 
                                ou acesse o "Histórico" para ver documentos visualizados recentemente.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <VadeMecumStats stats={stats} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default VadeMecum

