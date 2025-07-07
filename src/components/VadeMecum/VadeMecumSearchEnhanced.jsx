import React, { useState, useEffect } from 'react'
import { Search, Filter, X, Calendar, FileText, Tag } from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { DatePickerWithRange } from '../ui/date-picker-with-range'
import { Separator } from '../ui/separator'

const VadeMecumSearch = ({ onSearch, onFilterByType, loading }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [dateRange, setDateRange] = useState(null)
  const [selectedKeywords, setSelectedKeywords] = useState([])
  const [searchHistory, setSearchHistory] = useState([])

  // Carregar histórico de busca do localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('vademecum-search-history')
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory))
      } catch (error) {
        console.error('Erro ao carregar histórico de busca:', error)
      }
    }
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      // Adicionar ao histórico
      const newHistory = [
        searchTerm,
        ...searchHistory.filter(term => term !== searchTerm)
      ].slice(0, 5) // Manter apenas os 5 mais recentes
      
      setSearchHistory(newHistory)
      localStorage.setItem('vademecum-search-history', JSON.stringify(newHistory))
    }
    onSearch(searchTerm)
  }

  const handleTypeFilter = (type) => {
    setSelectedType(type)
    onFilterByType(type === 'all' ? null : type)
  }

  const clearSearch = () => {
    setSearchTerm('')
    setSelectedType('all')
    setDateRange(null)
    setSelectedKeywords([])
    onSearch('')
    onFilterByType(null)
  }

  const handleHistoryClick = (term) => {
    setSearchTerm(term)
    onSearch(term)
  }

  const documentTypes = [
    { value: 'all', label: 'Todos os tipos', icon: '📄' },
    { value: 'constituicao', label: 'Constituição', icon: '📜' },
    { value: 'lei', label: 'Lei', icon: '⚖️' },
    { value: 'decreto', label: 'Decreto', icon: '📋' },
    { value: 'portaria', label: 'Portaria', icon: '📄' },
    { value: 'resolucao', label: 'Resolução', icon: '🔧' },
    { value: 'instrucao_normativa', label: 'Instrução Normativa', icon: '📝' },
    { value: 'medida_provisoria', label: 'Medida Provisória', icon: '⚡' },
    { value: 'emenda_constitucional', label: 'Emenda Constitucional', icon: '📜' },
    { value: 'codigo', label: 'Código', icon: '📚' },
    { value: 'sumula', label: 'Súmula', icon: '💡' }
  ]

  const commonKeywords = [
    'direito', 'lei', 'artigo', 'código', 'processo', 'civil', 'penal', 
    'trabalhista', 'constitucional', 'administrativo', 'tributário'
  ]

  const hasActiveFilters = selectedType !== 'all' || dateRange || selectedKeywords.length > 0

  return (
    <Card className="mb-6 shadow-sm border-2 border-dashed border-muted-foreground/20 hover:border-orange-200 dark:hover:border-orange-800 transition-colors">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Barra de busca principal */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar por título, conteúdo, referência ou palavra-chave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 h-11 text-base"
              />
              {searchTerm && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="h-11 px-6"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </form>

          {/* Histórico de busca */}
          {searchHistory.length > 0 && !searchTerm && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Buscas recentes:</span>
              {searchHistory.map((term, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors"
                  onClick={() => handleHistoryClick(term)}
                >
                  {term}
                </Badge>
              ))}
            </div>
          )}

          {/* Filtros básicos */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2 flex-1">
              <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Select value={selectedType} onValueChange={handleTypeFilter}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              {/* Botão de filtros avançados */}
              <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Filtros Avançados
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        Ativo
                      </Badge>
                    )}
                  </Button>
                </CollapsibleTrigger>
              </Collapsible>

              {/* Botão limpar filtros */}
              {(searchTerm || hasActiveFilters) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSearch}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                  Limpar
                </Button>
              )}
            </div>
          </div>

          {/* Filtros avançados */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleContent className="space-y-4">
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Filtro por data */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Período de Criação
                  </label>
                  <DatePickerWithRange
                    date={dateRange}
                    onDateChange={setDateRange}
                    placeholder="Selecionar período..."
                  />
                </div>

                {/* Palavras-chave comuns */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Palavras-chave Comuns
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {commonKeywords.map((keyword) => (
                      <Badge
                        key={keyword}
                        variant={selectedKeywords.includes(keyword) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors"
                        onClick={() => {
                          if (selectedKeywords.includes(keyword)) {
                            setSelectedKeywords(prev => prev.filter(k => k !== keyword))
                          } else {
                            setSelectedKeywords(prev => [...prev, keyword])
                          }
                        }}
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resumo dos filtros ativos */}
              {hasActiveFilters && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm font-medium mb-2">Filtros Ativos:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedType !== 'all' && (
                      <Badge variant="secondary">
                        Tipo: {documentTypes.find(t => t.value === selectedType)?.label}
                      </Badge>
                    )}
                    {dateRange && (
                      <Badge variant="secondary">
                        Período: {dateRange.from?.toLocaleDateString()} - {dateRange.to?.toLocaleDateString()}
                      </Badge>
                    )}
                    {selectedKeywords.map((keyword) => (
                      <Badge key={keyword} variant="secondary">
                        Tag: {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  )
}

export default VadeMecumSearch

