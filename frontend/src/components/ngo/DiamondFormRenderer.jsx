import React, { useMemo } from 'react';
import { NGOFormField, NGO_INPUT_CLASS } from './NGOModal.jsx';
import RichTextEditor from './RichTextEditor.jsx';
import {
  DIAMOND_OPTION_FIELD_TYPES,
  groupFieldsBySection,
  optionDisplayLabel,
} from '../../utils/diamondForm.js';
import { DiamondSectionJourney } from './DiamondSectionJourney.jsx';

function resolveFieldOptions(field, options = []) {
  const optionById = Object.fromEntries(options.map((option) => [option.id, option]));
  return (field.optionIds || [])
    .map((id) => optionById[id])
    .filter(Boolean);
}

function FieldInput({ field, value, onChange, disabled, options = [] }) {
  const fieldOptions = resolveFieldOptions(field, options);

  if (field.type === 'text') {
    return (
      <input
        disabled={disabled}
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={NGO_INPUT_CLASS}
      />
    );
  }

  if (field.type === 'richText') {
    return (
      <RichTextEditor
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
      />
    );
  }

  if (field.type === 'calendar') {
    return (
      <input
        disabled={disabled}
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={NGO_INPUT_CLASS}
      />
    );
  }

  if (field.type === 'boolean' || field.type === 'select') {
    return (
      <select
        disabled={disabled}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={NGO_INPUT_CLASS}
      >
        <option value="">Select an option</option>
        {fieldOptions.map((option) => (
          <option key={option.id} value={option.value}>
            {optionDisplayLabel(option)}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === 'checkbox') {
    const selected = Array.isArray(value) ? value : [];
    return (
      <div className="flex flex-wrap gap-2">
        {fieldOptions.map((option) => {
          const checked = selected.includes(option.value);
          return (
            <label
              key={option.id}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
                checked ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-gray-300 bg-white text-gray-700'
              } ${disabled ? 'opacity-60' : 'cursor-pointer'}`}
            >
              <input
                type="checkbox"
                disabled={disabled}
                checked={checked}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...selected, option.value]
                    : selected.filter((entry) => entry !== option.value);
                  onChange(next);
                }}
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              {optionDisplayLabel(option)}
            </label>
          );
        })}
      </div>
    );
  }

  return (
    <input
      disabled={disabled}
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className={NGO_INPUT_CLASS}
    />
  );
}

export function DiamondFormRenderer({
  form,
  sections = [],
  options = [],
  responses = {},
  onChange,
  disabled = false,
  showHeader = true,
}) {
  const groups = useMemo(
    () => groupFieldsBySection(form, sections),
    [form, sections]
  );

  if (!form) {
    return (
      <p className="text-sm text-gray-500 rounded-lg border border-dashed border-gray-300 px-4 py-3">
        Select a form template to begin.
      </p>
    );
  }

  const updateField = (fieldId, value) => {
    onChange?.({ ...responses, [fieldId]: value });
  };

  const renderField = (field) => (
    <NGOFormField
      key={field.id}
      label={field.name}
      required={DIAMOND_OPTION_FIELD_TYPES.includes(field.type)}
      colSpan={2}
    >
      <FieldInput
        field={field}
        value={responses[field.id]}
        onChange={(value) => updateField(field.id, value)}
        disabled={disabled}
        options={options}
      />
    </NGOFormField>
  );

  return (
    <div className="space-y-6">
      {showHeader ? (
        <div className="border-b border-slate-200 pb-3">
          <h3 className="text-lg font-bold text-slate-900">{form.title}</h3>
          {form.description ? (
            <p className="text-sm text-slate-500 mt-1 whitespace-pre-wrap">{form.description}</p>
          ) : null}
        </div>
      ) : null}

      {form.isSectioned && groups.some((group) => group.title) ? (
        <DiamondSectionJourney
          steps={groups.filter((group) => group.title).map((group) => ({
            id: group.id,
            title: group.title,
            fields: group.fields,
          }))}
          renderStep={(step) =>
            step.fields.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {step.fields.map((field) => renderField(field))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">No fields in this section yet.</p>
            )
          }
        />
      ) : (
        groups.map((group) => (
          <div key={group.id || 'flat'} className="space-y-4">
            {group.title ? (
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{group.title}</h4>
            ) : null}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {group.fields.map((field) => renderField(field))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export function DiamondFormResponseView({ form, sections = [], options = [], responses = {} }) {
  const groups = useMemo(
    () => groupFieldsBySection(form, sections),
    [form, sections]
  );

  if (!form) return null;

  const fieldOptions = (field) => resolveFieldOptions(field, options);

  return (
    <dl className="space-y-6">
      {form.description ? (
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Form description</dt>
          <dd className="mt-1 text-sm text-slate-900 whitespace-pre-wrap">{form.description}</dd>
        </div>
      ) : null}

      {form.isSectioned && groups.some((group) => group.title) ? (
        <DiamondSectionJourney
          steps={groups.filter((group) => group.title).map((group) => ({
            id: group.id,
            title: group.title,
            fields: group.fields,
          }))}
          renderStep={(step) => (
            <dl className="space-y-3">
              {step.fields.map((field) => {
                const value = responses?.[field.id];
                const display =
                  field.type === 'checkbox'
                    ? (Array.isArray(value) ? value : [])
                        .map((entry) => {
                          const match = fieldOptions(field).find((option) => option.value === entry);
                          return match ? optionDisplayLabel(match) : entry;
                        })
                        .join(', ') || '—'
                    : field.type === 'richText'
                      ? null
                      : (() => {
                          const match = fieldOptions(field).find((option) => option.value === value);
                          return match ? optionDisplayLabel(match) : value || '—';
                        })();

                return (
                  <div key={field.id}>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{field.name}</dt>
                    {field.type === 'richText' ? (
                      <dd
                        className="mt-1 text-sm text-slate-900 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: value || '<span class="text-slate-400">—</span>',
                        }}
                      />
                    ) : (
                      <dd className="mt-1 text-sm text-slate-900 whitespace-pre-wrap">{display}</dd>
                    )}
                  </div>
                );
              })}
            </dl>
          )}
        />
      ) : (
        groups.map((group) => (
          <div key={group.id || 'flat'} className="space-y-3">
            {group.title ? (
              <h4 className="text-sm font-bold text-slate-800">{group.title}</h4>
            ) : null}
            {group.fields.map((field) => {
              const value = responses?.[field.id];
              const display =
                field.type === 'checkbox'
                  ? (Array.isArray(value) ? value : [])
                      .map((entry) => {
                        const match = fieldOptions(field).find((option) => option.value === entry);
                        return match ? optionDisplayLabel(match) : entry;
                      })
                      .join(', ') || '—'
                  : field.type === 'richText'
                    ? null
                    : (() => {
                        const match = fieldOptions(field).find((option) => option.value === value);
                        return match ? optionDisplayLabel(match) : value || '—';
                      })();

              return (
                <div key={field.id}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{field.name}</dt>
                  {field.type === 'richText' ? (
                    <dd
                      className="mt-1 text-sm text-slate-900 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: value || '<span class="text-slate-400">—</span>',
                      }}
                    />
                  ) : (
                    <dd className="mt-1 text-sm text-slate-900 whitespace-pre-wrap">{display}</dd>
                  )}
                </div>
              );
            })}
          </div>
        ))
      )}
    </dl>
  );
}

export default DiamondFormRenderer;
