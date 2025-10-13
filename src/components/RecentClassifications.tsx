import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Classification {
  id: string;
  classification_type: string;
  confidence_score: number;
  created_at: string;
  details: any;
}

export const RecentClassifications = () => {
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClassifications();
  }, []);

  const fetchClassifications = async () => {
    try {
      const { data, error } = await supabase
        .from('classifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setClassifications(data || []);
    } catch (error) {
      console.error('Error fetching classifications:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-8 bg-secondary/20">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center text-muted-foreground">
            Loading recent analyses...
          </div>
        </div>
      </section>
    );
  }

  if (classifications.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-secondary/20">
      <div className="container px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Recent Analyses</h2>
            <p className="text-lg text-muted-foreground">
              Latest skin lesion classifications performed
            </p>
          </div>

          <div className="space-y-4">
            {classifications.map((classification) => (
              <Card key={classification.id} className="border-border/50 hover:shadow-[var(--shadow-card)] transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{classification.classification_type}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {classification.confidence_score}% confidence
                        </Badge>
                      </div>
                      {classification.details?.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {classification.details.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-sm text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(classification.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
