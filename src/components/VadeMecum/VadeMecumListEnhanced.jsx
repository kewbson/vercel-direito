import React from 'react'
import { FileText, Calendar, Tag, ExternalLink, Heart, Clock, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'

const VadeMecumList = ({ 
  documents, 
  onDocumentSelect, 
  loading, 
  selectedDocument, 
  viewMode = 'grid',
  favorites = new Set(),
  onToggleFavorite 
}) => {
  const formatDate = (date) => {
    if (!date) return 'Data não disponível'
    
    let dateObj
    if (date.toDate) {
      // Firestore Timestamp
      dateObj = date.toDate()
    } else if (date instanceof Date) {
      dateObj = date
    } else {
      dateObj = new Date(date)
    }
    
    return dateObj.toLocaleDateString('pt-BR')
  }

  const getTypeLabel = (type) => {
    const typeLabels = {
      'constituicao': 'Constituição',
      'lei': 'Lei',
      'decreto': 'Decreto',
      'portaria': 'Portaria',
      'resolucao': 'Resolução',
      'instrucao_normativa': 'Instrução Normativa',
      'medida_provisoria': 'Medida Provisória',
      'emenda_constitucional': 'Emenda Constitucional',
      'codigo': 'Código',
      'sumula': 'Súmula'
    }
    return typeLabels[type] || type
  }

  const getTypeColor = (type) => {
    const typeColors = {
      'constituicao': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      'lei': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'decreto': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'portaria': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      'resolucao': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      'instrucao_normativa': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
      'medida_provisoria': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      'emenda_constitucional': 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300',
      'codigo': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
      'sumula': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300'
    }
    return typeColors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
  }

  const getTypeIcon = (type) => {
    const typeIcons = {
      'constituicao': '📜',
      'lei': '⚖️',
      'decreto': '📋',
      'portaria': '📄',
      'resolucao': '🔧',
      'instrucao_normativa': '📝',
      'medida_provisoria': '⚡',
      'emenda_constitucional': '📜',
      'codigo': '📚',
      'sumula': '💡'
    }
    return typeIcons[type] || '📄'
  }

  if (loading) {
    return (
      <div className={`space-y-4 ${viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : ''}`}>
        {[...Array(viewMode === 'grid' ? 4 : 3)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="h-8 w-8 bg-muted rounded"></div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-5/6"></div>
                <div className="flex gap-2 mt-3">
                  <div className="h-5 bg-muted rounded w-16"></div>
                  <div className="h-5 bg-muted rounded w-16"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!documents || documents.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Nenhum documento encontrado
          </h3>
          <p className="text-muted-foreground text-sm">
            Tente ajustar os filtros ou termos de busca para encontrar o que procura.
          </p>
        </CardContent>
      </Card>
    )
  }

  const DocumentCard = ({ document }) => {
    const isSelected = selectedDocument?.id === document.id
    const isFavorite = favorites.has(document.id)

    return (
      <Card 
        className={`group hover:shadow-md transition-all duration-200 cursor-pointer border-2 ${
          isSelected 
            ? 'ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800' 
            : 'border-border hover:border-orange-200 dark:hover:border-orange-800'
        }`}
        onClick={() => onDocumentSelect(document)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-2">
                <span className="text-lg flex-shrink-0">{getTypeIcon(document.tipo)}</span>
                <CardTitle className="text-base leading-tight line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {document.titulo}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2 text-sm flex-wrap">
                <Badge className={`${getTypeColor(document.tipo)} text-xs font-medium`}>
                  {getTypeLabel(document.tipo)}
                </Badge>
                {document.referencia && (
                  <>
                    <Separator orientation="vertical" className="h-3" />
                    <span className="font-medium text-muted-foreground text-xs">
                      {document.referencia}
                    </span>
                  </>
                )}
              </div>
            </div>
            
            {/* Botão de favorito */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleFavorite(document.id)
                    }}
                  >
                    <Heart 
                      className={`h-4 w-4 ${
                        isFavorite 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-muted-foreground hover:text-red-500'
                      }`} 
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {document.conteudo && (
            <p className="text-muted-foreground text-sm line-clamp-3 mb-3 leading-relaxed">
              {document.conteudo}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              {document.dataCriacao && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(document.dataCriacao)}</span>
                </div>
              )}
              
              {document.palavrasChave && document.palavrasChave.length > 0 && (
                <div className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  <span>{document.palavrasChave.length} palavra(s)-chave</span>
                </div>
              )}
            </div>

            {/* Indicadores de status */}
            <div className="flex items-center gap-1">
              {isFavorite && (
                <Heart className="h-3 w-3 fill-red-500 text-red-500" />
              )}
              {isSelected && (
                <Eye className="h-3 w-3 text-orange-500" />
              )}
            </div>
          </div>
          
          {/* Tags de palavras-chave */}
          {document.palavrasChave && document.palavrasChave.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {document.palavrasChave.slice(0, 4).map((keyword, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs px-2 py-0.5 bg-muted/50 hover:bg-muted transition-colors"
                >
                  {keyword}
                </Badge>
              ))}
              {document.palavrasChave.length > 4 && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-muted/50">
                  +{document.palavrasChave.length - 4}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {documents.map((document) => (
          <DocumentCard key={document.id} document={document} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {documents.map((document) => (
        <DocumentCard key={document.id} document={document} />
      ))}
    </div>
  )
}

export default VadeMecumList

