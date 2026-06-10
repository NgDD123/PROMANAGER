import React from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

export function DiamondSectionJourney({
  steps = [],
  mode = 'display',
  onRemove,
  onMoveUp,
  onMoveDown,
  renderStep,
  emptyMessage,
}) {
  if (!steps.length) {
    return emptyMessage ? (
      <p className="text-xs text-gray-500">{emptyMessage}</p>
    ) : null;
  }

  return (
    <div className="space-y-0">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const stepContent = renderStep?.(step, index);

        return (
          <div key={step.id} className="relative flex gap-4">
            <div className="flex flex-col items-center w-9 shrink-0">
              <div className="z-10 flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white shadow-sm ring-4 ring-white">
                {index + 1}
              </div>
              {!isLast ? (
                <div className="w-0.5 flex-1 min-h-6 bg-gradient-to-b from-violet-300 via-violet-200 to-violet-100" />
              ) : null}
            </div>

            <div className={`flex-1 min-w-0 ${isLast ? 'pb-1' : 'pb-6'}`}>
              <div
                className={`rounded-xl border border-violet-100 bg-white shadow-sm overflow-hidden ${
                  stepContent ? '' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3 px-4 py-3 bg-violet-50/70 border-b border-violet-100">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-600">
                      Section {index + 1}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{step.title}</p>
                  </div>

                  {mode === 'builder' ? (
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onMoveUp?.(step.id)}
                        disabled={index === 0}
                        className="rounded-lg p-1.5 text-violet-700 hover:bg-violet-100 disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label={`Move ${step.title} up`}
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onMoveDown?.(step.id)}
                        disabled={isLast}
                        className="rounded-lg p-1.5 text-violet-700 hover:bg-violet-100 disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label={`Move ${step.title} down`}
                      >
                        <ChevronDown size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemove?.(step.id)}
                        className="rounded-lg p-1.5 text-violet-700 hover:bg-red-50 hover:text-red-600"
                        aria-label={`Remove ${step.title}`}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : null}
                </div>

                {stepContent ? <div className="p-4">{stepContent}</div> : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default DiamondSectionJourney;
