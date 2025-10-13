import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";

interface ClassificationResultProps {
  result: {
    classification: string;
    classification_full: string;
    confidence: number;
    description: string;
    characteristics: string[];
    recommendation: string;
  };
}

export const ClassificationResult = ({ result }: ClassificationResultProps) => {
  const getSeverityColor = (type: string) => {
    const malignant = ['MEL', 'BCC', 'Melanoma', 'Basal Cell Carcinoma'];
    const precancerous = ['AK', 'Actinic Keratosis'];
    
    if (malignant.some(m => type.includes(m))) return 'destructive';
    if (precancerous.some(p => type.includes(p))) return 'default';
    return 'secondary';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 dark:text-green-400';
    if (confidence >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border-primary/20 shadow-[var(--shadow-lg)]">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">Classification Result</CardTitle>
              <CardDescription>AI-powered analysis completed</CardDescription>
            </div>
            <Badge variant={getSeverityColor(result.classification_full)} className="text-sm">
              {result.classification}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Classification Type */}
          <div>
            <h3 className="font-semibold text-lg mb-2">{result.classification_full}</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Confidence:</span>
              <span className={`font-bold text-lg ${getConfidenceColor(result.confidence)}`}>
                {result.confidence}%
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              Analysis
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {result.description}
            </p>
          </div>

          {/* Characteristics */}
          {result.characteristics && result.characteristics.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Key Characteristics Observed
              </h4>
              <ul className="space-y-2">
                {result.characteristics.map((char, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span>{char}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendation */}
          <Alert className="border-amber-500/50 bg-amber-500/5">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
            <AlertDescription className="text-sm">
              <strong className="font-semibold">Recommendation:</strong> {result.recommendation}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Alert className="border-destructive/50 bg-destructive/5">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <AlertDescription className="text-sm">
          <strong className="font-semibold">Medical Disclaimer:</strong> This AI analysis is for 
          educational and research purposes only. It is NOT a medical diagnosis. Always consult 
          a qualified dermatologist for proper evaluation and treatment of any skin concerns.
        </AlertDescription>
      </Alert>
    </div>
  );
};
