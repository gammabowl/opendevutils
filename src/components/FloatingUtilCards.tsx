
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContentSuggestion } from "@/utils/contentDetector";
import { ToolDefinition } from "@/utils/commandProcessor";
import { Sparkles, ArrowRight, Zap } from "lucide-react";

interface FloatingUtilCardsProps {
  suggestions: ContentSuggestion[];
  utils: ToolDefinition[];
  content: string;
  onUtilSelect: (utilId: string, action?: string, content?: string) => void;
}

export function FloatingUtilCards({ suggestions, utils, content, onUtilSelect }: FloatingUtilCardsProps) {
  const [hoveredUtil, setHoveredUtil] = useState<string | null>(null);

  if (suggestions.length === 0) return null;

  const getUtilById = (id: string) => utils.find(util => util.id === id);

  const handleOpenFullUtil = (utilId: string, action?: string) => {
    onUtilSelect(utilId, action, content);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-dev-primary">
          <Zap className="h-5 w-5" />
          <span className="font-medium">Smart Suggestions</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Based on your content, here's what I can do:
        </p>
      </div>

      {/* Tool Cards and Instant Results */}
      <div className="space-y-4">
        {suggestions.slice(0, 6).map((suggestion, index) => {
          const util = getUtilById(suggestion.toolId);
          if (!util) return null;

          const isHovered = hoveredUtil === suggestion.toolId;
          const confidence = Math.round(suggestion.confidence * 100);

          return (
            <div key={`${suggestion.toolId}-${index}`} className="space-y-3">
              {/* Util Card */}
              <Card
                className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-border/50 hover:border-dev-primary/50 bg-gradient-to-br from-card to-card/50"
                onMouseEnter={() => setHoveredUtil(suggestion.toolId)}
                onMouseLeave={() => setHoveredUtil(null)}
              >
                  <CardContent className="p-6 relative overflow-hidden">
                    {/* Confidence Indicator */}
                    <div className="absolute top-3 right-3">
                      <div className="flex items-center gap-1 text-xs">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Sparkles
                              key={star}
                              className={`h-3 w-3 ${
                                star <= confidence / 20
                                  ? "text-dev-primary fill-dev-primary"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-muted-foreground">{confidence}%</span>
                      </div>
                    </div>

                    {/* Util Info */}
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-foreground capitalize">
                          {util.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {util.description}
                        </p>
                      </div>

                      {/* Preview */}
                      <div className="bg-muted/30 rounded-lg p-3">
                        <p className="text-sm font-medium text-dev-primary">
                          {suggestion.preview}
                        </p>
                        {suggestion.action && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Action: {suggestion.action}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleOpenFullUtil(suggestion.toolId, suggestion.action)}
                          size="sm"
                          className="w-full group-hover:bg-dev-primary group-hover:text-dev-primary-foreground transition-colors"
                          variant={isHovered ? "default" : "outline"}
                        >
                          <span>Use Util</span>
                          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>

                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-dev-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </CardContent>
                </Card>
            </div>
          );
        })}
      </div>

      {/* Show All Utils Link */}
      {suggestions.length > 6 && (
        <div className="text-center">
          <Button variant="ghost" size="sm" className="text-dev-primary hover:text-dev-primary">
            Show {suggestions.length - 6} more suggestions
          </Button>
        </div>
      )}
    </div>
  );
}
