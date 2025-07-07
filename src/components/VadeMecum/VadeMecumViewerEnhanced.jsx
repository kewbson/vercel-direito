import { useState } from 'react';
import { 
  X, Calendar, Tag, FileText, Copy, Check, Heart, Share2, 
  Download, ZoomIn, ZoomOut, RotateCcw, BookOpen, ExternalLink 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

const VadeMecumViewer = ({ 
  document, 
  onClose, 
  isEmbedded = false, 
  isFavorite = false, 
  onToggleFavorite 
}) => {
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState(16); // Tamanho da fonte em px

  // Função auxiliar para formatar datas, sejam Timestamps do Firebase ou strings
  const formatDate = (date) => {
    if (!date) return 'Data indisponível';
    let dateObj;
    if (date.toDate) { // Se for um Timestamp do Firebase
      dateObj = date.toDate();
    } else { // Se for uma string
      dateObj = new Date(date);
    }
    return dateObj.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Função auxiliar para obter o rótulo do tipo de documento
  const getTypeLabel = (type) => {
    const typeLabels = {
      'constituicao': 'Constituição',
      'lei': 'Lei',
      'codigo': 'Código',
      'decreto': 'Decreto',
      'portaria': 'Portaria',
      'resolucao': 'Resolução',
      'instrucao_normativa': 'Instrução Normativa',
      'medida_provisoria': 'Medida Provisória',
      'emenda_constitucional': 'Emenda Constitucional',
      'sumula': 'Súmula'
    };
    return typeLabels[type] || type;
  };

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

  // Função para copiar o conteúdo, agora adaptada para a nova estrutura
  const handleCopyContent = () => {
    if (!document) return;

    let textToCopy = '';
    // Verifica se existe o array 'artigos'
    if (document.artigos && document.artigos.length > 0) {
      textToCopy = document.artigos
        .map(art => `Art. ${art.numero} - ${art.texto}`)
        .join('\n\n');
    } else if (document.conteudo) {
      // Mantém a compatibilidade com a estrutura antiga
      textToCopy = document.conteudo;
    } else {
      toast.error("Não há conteúdo para copiar.");
      return;
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success("Conteúdo copiado para a área de transferência!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Função para compartilhar documento
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.titulo,
          text: `Confira este documento: ${document.titulo}`,
          url: window.location.href
        });
      } catch (error) {
        // Fallback para cópia do link
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copiado para a área de transferência!");
  };

  // Função para download (simulado)
  const handleDownload = () => {
    let content = '';
    if (document.artigos && document.artigos.length > 0) {
      content = document.artigos
        .map(art => `Art. ${art.numero} - ${art.texto}`)
        .join('\n\n');
    } else if (document.conteudo) {
      content = document.conteudo;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${document.titulo}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Download iniciado!");
  };

  // Controles de zoom
  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 2, 24));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 2, 12));
  };

  const resetFontSize = () => {
    setFontSize(16);
  };

  // Função principal para renderizar o conteúdo, seja da estrutura nova ou antiga
  const renderContent = () => {
    // 1. Tenta renderizar a NOVA estrutura com o array 'artigos'
    if (document.artigos && document.artigos.length > 0) {
      return document.artigos.map((artigo, index) => (
        <div key={index} className="mb-6 p-4 rounded-lg bg-muted/20 border-l-4 border-orange-500">
          <h4 className="font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
            <span className="bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-2 py-1 rounded text-sm">
              Art. {artigo.numero}
            </span>
          </h4>
          <p 
            className="whitespace-pre-wrap text-foreground leading-relaxed"
            style={{ fontSize: `${fontSize}px` }}
          >
            {artigo.texto}
          </p>
        </div>
      ));
    }
    
    // 2. Se não encontrar 'artigos', tenta renderizar a ESTRUTURA ANTIGA com 'conteudo'
    if (document.conteudo) {
      return (
        <div 
          className="prose prose-sm dark:prose-invert max-w-none"
          style={{ fontSize: `${fontSize}px` }}
        >
          {document.conteudo.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-4 text-foreground leading-relaxed">
              {paragraph.trim()}
            </p>
          ))}
        </div>
      );
    }

    // 3. Se não encontrar nenhum dos dois, exibe uma mensagem
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">Este documento não possui conteúdo para exibição.</p>
      </div>
    );
  };
    
  if (!document) {
    if (isEmbedded) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center max-w-md p-8">
            <BookOpen className="h-20 w-20 mx-auto mb-6 opacity-50" />
            <p className="text-xl font-medium mb-3">Selecione um documento</p>
            <p className="text-sm text-muted-foreground">
              Escolha um item da lista para ver os detalhes e conteúdo completo.
            </p>
          </div>
        </div>
      );
    }
    return null;
  }
  
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header melhorado */}
      <div className="flex-shrink-0 border-b bg-card">
        <div className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 pr-4">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl flex-shrink-0">{getTypeIcon(document.tipo)}</span>
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold leading-tight text-foreground mb-2">
                    {document.titulo}
                  </h2>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="secondary" className="font-medium">
                      {getTypeLabel(document.tipo)}
                    </Badge>
                    {document.referencia && (
                      <span className="text-sm font-medium text-muted-foreground">
                        {document.referencia}
                      </span>
                    )}
                    {document.dataCriacao && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(document.dataCriacao)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {onClose && !isEmbedded && (
              <Button variant="ghost" size="sm" onClick={onClose} className="flex-shrink-0">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Barra de ferramentas */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              {/* Controles de zoom */}
              <TooltipProvider>
                <div className="flex items-center gap-1 border rounded-md">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={decreaseFontSize}
                        disabled={fontSize <= 12}
                        className="h-8 w-8 p-0"
                      >
                        <ZoomOut className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Diminuir fonte</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={resetFontSize}
                        className="h-8 px-2 text-xs font-medium"
                      >
                        {fontSize}px
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Resetar fonte</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={increaseFontSize}
                        disabled={fontSize >= 24}
                        className="h-8 w-8 p-0"
                      >
                        <ZoomIn className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Aumentar fonte</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>

            <div className="flex items-center gap-2">
              {/* Favorito */}
              {onToggleFavorite && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={onToggleFavorite}
                        className="flex items-center gap-2"
                      >
                        <Heart 
                          className={`h-4 w-4 ${
                            isFavorite 
                              ? 'fill-red-500 text-red-500' 
                              : 'text-muted-foreground'
                          }`} 
                        />
                        {isFavorite ? 'Favoritado' : 'Favoritar'}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Copiar */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={handleCopyContent}>
                      {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                      {copied ? 'Copiado!' : 'Copiar'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copiar conteúdo do documento</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Compartilhar */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartilhar
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Compartilhar documento</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Download */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Baixar documento como texto</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Palavras-chave */}
          {document.palavrasChave && document.palavrasChave.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-foreground">Palavras-chave:</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {document.palavrasChave.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conteúdo do documento */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Conteúdo do Documento</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {renderContent()}
              </div>
            </CardContent>
          </Card>

          {/* Informações adicionais */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Informações do Documento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-foreground">Tipo:</span>
                  <p className="text-muted-foreground">{getTypeLabel(document.tipo)}</p>
                </div>
                {document.referencia && (
                  <div>
                    <span className="font-medium text-foreground">Referência:</span>
                    <p className="text-muted-foreground">{document.referencia}</p>
                  </div>
                )}
                {document.dataCriacao && (
                  <div>
                    <span className="font-medium text-foreground">Data de Criação:</span>
                    <p className="text-muted-foreground">{formatDate(document.dataCriacao)}</p>
                  </div>
                )}
                <div>
                  <span className="font-medium text-foreground">Palavras-chave:</span>
                  <p className="text-muted-foreground">
                    {document.palavrasChave ? document.palavrasChave.length : 0} palavra(s)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  )
}

export default VadeMecumViewer;

