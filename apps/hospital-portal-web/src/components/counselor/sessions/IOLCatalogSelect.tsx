'use client';

import { useState } from 'react';
import { Eye, Filter, X, Loader2, IndianRupee } from 'lucide-react';
import { useIolOptions } from '@/hooks/use-master-data';
import type { IolMasterDto } from '@/lib/api/service-catalog.api';

interface IOLCatalogSelectProps {
  onSelect: (iol: IolMasterDto) => void;
  variantId?: string;
  branchId?: string;
  surgeryRequiresIol?: boolean;
  value?: IolMasterDto | null;
  error?: string;
  disabled?: boolean;
}

type IolType = 'Monofocal' | 'Multifocal' | 'Trifocal' | 'EDOF' | 'Toric' | 'ICL';
type Origin = 'Indian' | 'Imported';

export default function IOLCatalogSelect({
  onSelect,
  variantId,
  branchId: _branchId,
  surgeryRequiresIol = true,
  value,
  error,
  disabled = false,
}: IOLCatalogSelectProps) {
  const [selectedType, setSelectedType] = useState<IolType | undefined>(undefined);
  const [selectedOrigin, setSelectedOrigin] = useState<Origin | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);

  const iolTypes: IolType[] = ['Monofocal', 'Multifocal', 'Trifocal', 'EDOF', 'Toric', 'ICL'];

  // Fetch IOL options for the given variant
  const { data: iolData, isLoading } = useIolOptions(variantId);

  const allIols: IolMasterDto[] = iolData ?? [];

  // Client-side filtering by type and origin
  const iols = allIols.filter(iol => {
    if (selectedType && iol.iolType !== selectedType) return false;
    if (selectedOrigin && iol.origin !== selectedOrigin) return false;
    return true;
  });

  if (!surgeryRequiresIol) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
        <Eye className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600">
          Selected surgery does not require an IOL
        </p>
      </div>
    );
  }

  const handleSelect = (iol: IolMasterDto) => {
    onSelect(iol);
  };

  const handleClear = () => {
    onSelect(null as any);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-4">
      {/* Header with Filters */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-600" />
          Select Intraocular Lens (IOL)
        </h4>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
          disabled={disabled}
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
          {/* IOL Type Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              IOL Type
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedType(undefined)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedType === undefined
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                All
              </button>
              {iolTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    selectedType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Origin Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Origin
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedOrigin(undefined)}
                className={`px-4 py-1 text-sm rounded-full transition-colors ${
                  selectedOrigin === undefined
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrigin('Indian')}
                className={`px-4 py-1 text-sm rounded-full transition-colors ${
                  selectedOrigin === 'Indian'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Indian
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrigin('Imported')}
                className={`px-4 py-1 text-sm rounded-full transition-colors ${
                  selectedOrigin === 'Imported'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Imported
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected IOL Display */}
      {value ? (
        <div className="p-4 border-2 border-blue-600 rounded-lg bg-blue-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{value.modelName}</p>
              <p className="text-sm text-gray-600">{value.brandManufacturer}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span className="px-2 py-1 bg-white rounded">{value.iolType}</span>
                <span className="px-2 py-1 bg-white rounded">{value.origin}</span>
              </div>
              {value.defaultPrice > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-lg font-bold text-green-700">
                    {formatPrice(value.defaultPrice)}
                  </span>
                </div>
              )}
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-blue-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* IOL List */}
          {isLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
              <p className="text-sm text-gray-500">Loading IOL catalog...</p>
            </div>
          ) : iols.length > 0 ? (
            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
                {iols.map((iol) => (
                  <button
                    key={iol.id}
                    type="button"
                    onClick={() => handleSelect(iol)}
                    disabled={disabled}
                    className="p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left disabled:opacity-50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{iol.modelName}</p>
                        <p className="text-sm text-gray-600 truncate">{iol.brandManufacturer}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                            {iol.iolType}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                            {iol.origin}
                          </span>
                        </div>
                      </div>
                      {iol.defaultPrice > 0 && (
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-green-700">
                            {formatPrice(iol.defaultPrice)}
                          </p>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
              <Eye className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-600 font-medium">No IOLs found</p>
              <p className="text-xs text-gray-500 mt-1">
                {selectedType || selectedOrigin
                  ? 'Try changing your filters'
                  : 'No IOLs available in the catalog'}
              </p>
            </div>
          )}
        </>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <X className="w-4 h-4" /> {error}
        </p>
      )}
    </div>
  );
}
