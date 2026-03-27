import React from 'react';
import { X, MapPin } from 'lucide-react';

// Simplified icon components for missing icons in lucide-react v0.400
const ChevronDown = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const EditIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const Eye = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOff = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const Ruler = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const Square = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
  </svg>
);

const MessageSquare = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

interface Annotation {
  id: string;
  type: 'measurement' | 'finding' | 'roi';
  data: {
    label?: string;
    length?: number;
    area?: number;
    points?: { x: number; y: number }[];
    text?: string;
  };
  createdAt: string;
  createdBy: string;
  visible?: boolean;
}

interface AnnotationsListProps {
  annotations: Annotation[];
  onEditAnnotation: (id: string) => void;
  onDeleteAnnotation: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onHighlightAnnotation: (id: string) => void;
  className?: string;
}

export const AnnotationsList: React.FC<AnnotationsListProps> = ({
  annotations,
  onEditAnnotation,
  onDeleteAnnotation,
  onToggleVisibility,
  onHighlightAnnotation,
  className = ''
}) => {
  const [selectedType, setSelectedType] = React.useState<'all' | 'measurement' | 'finding' | 'roi'>('all');
  const [isExpanded, setIsExpanded] = React.useState(true);

  const getAnnotationIcon = (type: string) => {
    switch (type) {
      case 'measurement':
        return <Ruler className="w-4 h-4 text-blue-400 dark:text-blue-300" />;
      case 'finding':
        return <MessageSquare className="w-4 h-4 text-yellow-400 dark:text-yellow-300" />;
      case 'roi':
        return <Square className="w-4 h-4 text-green-400 dark:text-green-300" />;
      default:
        return <MapPin className="w-4 h-4 text-gray-400" />;
    }
  };

  const getAnnotationLabel = (annotation: Annotation): string => {
    if (annotation.data.label) return annotation.data.label;
    
    switch (annotation.type) {
      case 'measurement':
        return annotation.data.length 
          ? `Length: ${annotation.data.length.toFixed(2)} mm`
          : annotation.data.area 
            ? `Area: ${annotation.data.area.toFixed(2)} mm²`
            : 'Measurement';
      case 'finding':
        return annotation.data.text || 'Finding';
      case 'roi':
        return `ROI (${annotation.data.points?.length || 0} points)`;
      default:
        return 'Annotation';
    }
  };

  const filteredAnnotations = selectedType === 'all' 
    ? annotations 
    : annotations.filter(a => a.type === selectedType);

  return (
    <div className={`bg-gray-800 dark:bg-gray-900/80 rounded-lg border border-gray-700/30 dark:border-gray-800/40 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700/30 dark:border-gray-800/40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-700/50 dark:hover:bg-gray-800/50 rounded transition-colors"
            aria-label={isExpanded ? 'Collapse annotations' : 'Expand annotations'}
          >
            <ChevronDown 
              className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? '' : '-rotate-90'}`} 
            />
          </button>
          <h3 className="text-sm font-semibold text-white dark:text-gray-100">
            Annotations ({filteredAnnotations.length})
          </h3>
        </div>

        {/* Filter Dropdown */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as typeof selectedType)}
          className="text-xs bg-gray-700/50 dark:bg-gray-800/50 border border-gray-600/30 dark:border-gray-700/30 text-gray-300 dark:text-gray-400 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="all">All Types</option>
          <option value="measurement">Measurements</option>
          <option value="finding">Findings</option>
          <option value="roi">ROIs</option>
        </select>
      </div>

      {/* Annotations List */}
      {isExpanded && (
        <div className="p-2 space-y-2 max-h-[400px] overflow-y-auto">
          {filteredAnnotations.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-600">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No annotations yet</p>
              <p className="text-xs mt-1">Add measurements or findings to the image</p>
            </div>
          ) : (
            filteredAnnotations.map((annotation) => (
              <div
                key={annotation.id}
                onMouseEnter={() => onHighlightAnnotation(annotation.id)}
                className="bg-gray-700/30 dark:bg-gray-800/30 hover:bg-gray-700/50 dark:hover:bg-gray-800/50 rounded-lg p-3 border border-gray-600/20 dark:border-gray-700/20 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2">
                  {/* Icon + Label */}
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    {getAnnotationIcon(annotation.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white dark:text-gray-100 truncate">
                        {getAnnotationLabel(annotation)}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {new Date(annotation.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {annotation.createdBy && (
                        <p className="text-xs text-gray-500 dark:text-gray-600 mt-0.5">
                          by {annotation.createdBy}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleVisibility(annotation.id);
                      }}
                      className="p-1.5 hover:bg-gray-600/50 dark:hover:bg-gray-700/50 rounded transition-colors"
                      title={annotation.visible !== false ? 'Hide annotation' : 'Show annotation'}
                      aria-label={annotation.visible !== false ? 'Hide annotation' : 'Show annotation'}
                    >
                      {annotation.visible !== false ? (
                        <Eye className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-gray-500 dark:text-gray-600" />
                      )}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditAnnotation(annotation.id);
                      }}
                      className="p-1.5 hover:bg-blue-600/20 dark:hover:bg-blue-700/20 rounded transition-colors"
                      title="Edit annotation"
                      aria-label="Edit annotation"
                    >
                      <EditIcon className="w-3.5 h-3.5 text-blue-400 dark:text-blue-300" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this annotation?')) {
                          onDeleteAnnotation(annotation.id);
                        }
                      }}
                      className="p-1.5 hover:bg-red-600/20 dark:hover:bg-red-700/20 rounded transition-colors"
                      title="Delete annotation"
                      aria-label="Delete annotation"
                    >
                      <TrashIcon className="w-3.5 h-3.5 text-red-400 dark:text-red-300" />
                    </button>
                  </div>
                </div>

                {/* Additional Measurement Details */}
                {annotation.type === 'measurement' && (
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {annotation.data.length && (
                      <span className="px-2 py-0.5 bg-blue-900/30 dark:bg-blue-950/40 text-blue-300 dark:text-blue-200 rounded">
                        L: {annotation.data.length.toFixed(2)} mm
                      </span>
                    )}
                    {annotation.data.area && (
                      <span className="px-2 py-0.5 bg-green-900/30 dark:bg-green-950/40 text-green-300 dark:text-green-200 rounded">
                        A: {annotation.data.area.toFixed(2)} mm²
                      </span>
                    )}
                  </div>
                )}

                {/* Finding Text Preview */}
                {annotation.type === 'finding' && annotation.data.text && (
                  <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 line-clamp-2">
                    {annotation.data.text}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Footer Stats */}
      {isExpanded && annotations.length > 0 && (
        <div className="px-3 py-2 border-t border-gray-700/30 dark:border-gray-800/40 flex items-center justify-between text-xs text-gray-500 dark:text-gray-600">
          <span>
            {annotations.filter(a => a.type === 'measurement').length} measurements, {' '}
            {annotations.filter(a => a.type === 'finding').length} findings, {' '}
            {annotations.filter(a => a.type === 'roi').length} ROIs
          </span>
        </div>
      )}
    </div>
  );
};

export default AnnotationsList;
