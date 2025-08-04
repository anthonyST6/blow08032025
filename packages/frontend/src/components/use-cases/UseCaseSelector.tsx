import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Search, Filter, ChevronRight, Clock, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { verticals } from '@/config/verticals';
import { UseCase, VerticalModule } from '@/config/verticals';
import { cn } from '@/lib/utils';

interface UseCaseSelectorProps {
  onSelect: (useCase: UseCase, vertical: VerticalModule) => void;
  selectedVertical?: string;
  className?: string;
}

export const UseCaseSelector: React.FC<UseCaseSelectorProps> = ({
  onSelect,
  selectedVertical: initialVertical,
  className
}) => {
  const [selectedVertical, setSelectedVertical] = useState<string>(initialVertical || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [complexityFilter, setComplexityFilter] = useState<string>('all');
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const filteredUseCases = React.useMemo(() => {
    if (!selectedVertical) return [];
    
    const vertical = verticals[selectedVertical];
    if (!vertical) return [];

    return vertical.useCases.filter(useCase => {
      const matchesSearch = useCase.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          useCase.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesComplexity = complexityFilter === 'all' || useCase.complexity === complexityFilter;
      
      return matchesSearch && matchesComplexity;
    });
  }, [selectedVertical, searchQuery, complexityFilter]);

  const handleUseCaseSelect = (useCase: UseCase) => {
    setSelectedUseCase(useCase);
    setShowDetails(true);
  };

  const handleConfirmSelection = () => {
    if (selectedUseCase && selectedVertical) {
      onSelect(selectedUseCase, verticals[selectedVertical]);
      setShowDetails(false);
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSIAScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Vertical Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Industry Vertical</CardTitle>
          <CardDescription>Choose your industry to see relevant use cases</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.values(verticals).map((vertical) => {
              const Icon = vertical.icon;
              return (
                <button
                  key={vertical.id}
                  onClick={() => setSelectedVertical(vertical.id)}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all hover:shadow-md",
                    selectedVertical === vertical.id
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <Icon className={cn("h-8 w-8 mb-2", vertical.color)} />
                  <h3 className="font-medium text-sm">{vertical.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {vertical.useCases.length} use cases
                  </p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Use Case List */}
      {selectedVertical && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Available Use Cases</CardTitle>
                <CardDescription>
                  {verticals[selectedVertical].name} - {filteredUseCases.length} use cases
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search use cases..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
                <Select value={complexityFilter} onValueChange={setComplexityFilter}>
                  <SelectTrigger className="w-32">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {filteredUseCases.map((useCase) => (
                  <Card
                    key={useCase.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleUseCaseSelect(useCase)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{useCase.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {useCase.description}
                          </p>
                          <div className="flex items-center gap-4 mt-3">
                            <Badge className={getComplexityColor(useCase.complexity)}>
                              {useCase.complexity}
                            </Badge>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-4 w-4 mr-1" />
                              {useCase.estimatedTime}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Use Case Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedUseCase?.name}</DialogTitle>
            <DialogDescription>{selectedUseCase?.description}</DialogDescription>
          </DialogHeader>
          
          {selectedUseCase && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Complexity</h4>
                  <Badge className={getComplexityColor(selectedUseCase.complexity)}>
                    {selectedUseCase.complexity}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Estimated Time</h4>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {selectedUseCase.estimatedTime}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">SIA Scores</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="text-sm">Security</span>
                    </div>
                    <span className={cn("font-semibold", getSIAScoreColor(selectedUseCase.siaScores.security))}>
                      {selectedUseCase.siaScores.security}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      <span className="text-sm">Integrity</span>
                    </div>
                    <span className={cn("font-semibold", getSIAScoreColor(selectedUseCase.siaScores.integrity))}>
                      {selectedUseCase.siaScores.integrity}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2 text-orange-600" />
                      <span className="text-sm">Accuracy</span>
                    </div>
                    <span className={cn("font-semibold", getSIAScoreColor(selectedUseCase.siaScores.accuracy))}>
                      {selectedUseCase.siaScores.accuracy}%
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Key Features</h4>
                <div className="flex flex-wrap gap-2">
                  {verticals[selectedVertical].features.slice(0, 3).map((feature, idx) => (
                    <Badge key={idx} variant="secondary">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Compliance</h4>
                <div className="flex flex-wrap gap-2">
                  {verticals[selectedVertical].regulations.slice(0, 3).map((reg, idx) => (
                    <Badge key={idx} variant="outline">
                      {reg}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSelection}>
              Select Use Case
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};