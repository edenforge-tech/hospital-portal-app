'use client';

import { RadioGroup } from '@headlessui/react';
import { Package, Star, DollarSign } from 'lucide-react';

interface PackageSelectorProps {
  surgeryType: 'Cataract' | 'Glaucoma' | 'Vitreoretinal' | 'Corneal';
  selectedPackage: 'Standard' | 'Premium' | 'Custom';
  onPackageChange: (pkg: 'Standard' | 'Premium' | 'Custom', price: number) => void;
}

const PACKAGES = {
  Cataract: {
    Standard: {
      price: 25000,
      iol: 'Monofocal IOL',
      inclusions: [
        'Pre-operative evaluation',
        'Phacoemulsification surgery',
        'Monofocal IOL implantation',
        'Post-operative care (3 follow-ups)',
        'Basic medications (1 week)',
      ],
      exclusions: [
        'Premium IOL (Multifocal/Toric)',
        'Femtosecond laser-assisted surgery',
        'Premium post-op care package',
      ],
    },
    Premium: {
      price: 75000,
      iol: 'Multifocal/Toric IOL',
      inclusions: [
        'Pre-operative evaluation',
        'Femtosecond laser-assisted cataract surgery',
        'Premium Multifocal or Toric IOL',
        'Extended post-operative care (6 follow-ups)',
        'Premium medications package (4 weeks)',
        'Dedicated counselor support',
        'Priority scheduling',
      ],
      exclusions: [],
    },
    Custom: {
      price: 0,
      iol: 'Custom selection',
      inclusions: [
        'Fully customizable package',
        'Choose IOL type and brand',
        'Select surgical technique',
        'Customize follow-up schedule',
      ],
      exclusions: ['Pricing varies based on selections'],
    },
  },
  Glaucoma: {
    Standard: {
      price: 35000,
      iol: 'N/A',
      inclusions: [
        'Pre-operative evaluation',
        'Trabeculectomy with MMC',
        'Post-operative care (6 follow-ups)',
        'Glaucoma medications (4 weeks)',
      ],
      exclusions: ['Premium drainage devices (Ahmed/Baerveldt)'],
    },
    Premium: {
      price: 85000,
      iol: 'N/A',
      inclusions: [
        'Pre-operative evaluation',
        'Glaucoma drainage device implantation',
        'Extended post-operative care (12 follow-ups)',
        'Premium glaucoma medications (12 weeks)',
        'IOP monitoring system',
      ],
      exclusions: [],
    },
    Custom: {
      price: 0,
      iol: 'N/A',
      inclusions: [
        'Fully customizable package',
        'Choose surgical technique',
        'Customize follow-up schedule',
      ],
      exclusions: ['Pricing varies based on selections'],
    },
  },
  Vitreoretinal: {
    Standard: {
      price: 50000,
      iol: 'N/A',
      inclusions: [
        'Pre-operative evaluation',
        'Pars plana vitrectomy (PPV)',
        'Post-operative care (8 follow-ups)',
        'Standard medications (4 weeks)',
      ],
      exclusions: ['Anti-VEGF injections', 'Scleral buckling'],
    },
    Premium: {
      price: 125000,
      iol: 'N/A',
      inclusions: [
        'Pre-operative evaluation',
        'Advanced PPV with gas/oil tamponade',
        'Anti-VEGF therapy (if needed)',
        'Extended post-operative care (16 follow-ups)',
        'Premium medications (12 weeks)',
      ],
      exclusions: [],
    },
    Custom: {
      price: 0,
      iol: 'N/A',
      inclusions: [
        'Fully customizable package',
        'Choose surgical technique',
        'Customize tamponade and medications',
      ],
      exclusions: ['Pricing varies based on selections'],
    },
  },
  Corneal: {
    Standard: {
      price: 40000,
      iol: 'N/A',
      inclusions: [
        'Pre-operative evaluation',
        'Penetrating keratoplasty (PKP)',
        'Standard donor cornea',
        'Post-operative care (12 follow-ups)',
        'Immunosuppressive medications (8 weeks)',
      ],
      exclusions: ['Premium donor tissue', 'Femtosecond laser cutting'],
    },
    Premium: {
      price: 95000,
      iol: 'N/A',
      inclusions: [
        'Pre-operative evaluation',
        'Femtosecond laser-assisted keratoplasty',
        'Premium donor tissue',
        'Extended post-operative care (24 follow-ups)',
        'Premium immunosuppressive medications (16 weeks)',
        'Corneal topography tracking',
      ],
      exclusions: [],
    },
    Custom: {
      price: 0,
      iol: 'N/A',
      inclusions: [
        'Fully customizable package',
        'Choose keratoplasty technique',
        'Customize donor tissue and follow-up',
      ],
      exclusions: ['Pricing varies based on selections'],
    },
  },
};

export default function PackageSelector({
  surgeryType,
  selectedPackage,
  onPackageChange,
}: PackageSelectorProps) {
  const packages = PACKAGES[surgeryType];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Surgery Package</h3>
        <p className="text-sm text-gray-600">
          Choose the package that best fits the patient's needs and budget
        </p>
      </div>

      <RadioGroup
        value={selectedPackage}
        onChange={(pkg) => {
          const price = packages[pkg as keyof typeof packages].price;
          onPackageChange(pkg, price);
        }}
      >
        <div className="space-y-4">
          {Object.entries(packages).map(([pkgName, config]) => {
            const isSelected = selectedPackage === pkgName;
            const isRecommended = pkgName === 'Standard';

            return (
              <RadioGroup.Option
                key={pkgName}
                value={pkgName}
                className={({ checked }) =>
                  `relative cursor-pointer rounded-lg border-2 p-5 transition-all ${
                    checked
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500'
                      : 'border-gray-200 hover:border-gray-300'
                  }`
                }
              >
                {({ checked }) => (
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full ${
                            checked ? 'bg-indigo-500' : 'bg-gray-100'
                          }`}
                        >
                          {pkgName === 'Premium' ? (
                            <Star className={`h-6 w-6 ${checked ? 'text-white' : 'text-gray-400'}`} />
                          ) : (
                            <Package className={`h-6 w-6 ${checked ? 'text-white' : 'text-gray-400'}`} />
                          )}
                        </div>
                        <div>
                          <RadioGroup.Label className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                            <span>{pkgName} Package</span>
                            {isRecommended && (
                              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded">
                                Most Popular
                              </span>
                            )}
                          </RadioGroup.Label>
                          {config.iol !== 'N/A' && (
                            <p className="text-sm text-gray-600 mt-0.5">
                              IOL: {config.iol}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        {config.price > 0 ? (
                          <>
                            <div className="flex items-center space-x-1 text-2xl font-bold text-gray-900">
                              <DollarSign className="h-5 w-5" />
                              <span>{(config.price / 1000).toFixed(0)}k</span>
                            </div>
                            <p className="text-xs text-gray-600">({config.price.toLocaleString('en-IN')} INR)</p>
                          </>
                        ) : (
                          <div className="text-lg font-bold text-indigo-600">Custom Pricing</div>
                        )}
                      </div>
                    </div>

                    {/* Inclusions */}
                    <div className="space-y-2">
                      <h5 className="text-sm font-semibold text-gray-900">Included:</h5>
                      <ul className="space-y-1">
                        {config.inclusions.map((item, index) => (
                          <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                            <span className="text-green-600 mt-0.5">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Exclusions */}
                    {config.exclusions.length > 0 && (
                      <div className="space-y-2 pt-3 border-t border-gray-200">
                        <h5 className="text-sm font-semibold text-gray-900">Not Included:</h5>
                        <ul className="space-y-1">
                          {config.exclusions.map((item, index) => (
                            <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                              <span className="text-gray-400 mt-0.5">✗</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </RadioGroup.Option>
            );
          })}
        </div>
      </RadioGroup>

      {/* Financial Counseling Note */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> Patient will be referred to counselor for detailed package discussion, 
          payment options, and insurance coordination.
        </p>
      </div>
    </div>
  );
}
