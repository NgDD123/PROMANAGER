import React, { useState } from 'react';
import { formatCurrency } from '../../utils/format';

export default function StockTable({
  title,
  data,
  fields,
  loading,
  onEdit,
  deleteItem,
  highlightedRowId,
  onAdd,
  onRowClick, 
}) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  if (loading) {
    return (
      <div className='flex justify-center items-center py-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
        <span className='ml-2 text-gray-600'>Loading {title}...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className='text-center py-8'>
        <span className='text-gray-500'>No {title} available.</span>
      </div>
    );
  }

  const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (isNaN(date.getTime())) return '-';
    return date.toISOString().slice(0, 10);
  };

  const paginatedData = data.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  const totalPages = Math.ceil(data.length / rowsPerPage);

  return (
    <div className="p-6 flex flex-col h-full">
      {(title || onAdd) && (
        <div className="flex justify-between items-center mb-6">
          {title && (
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          )}
          {onAdd && (
            <button
              onClick={onAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
            >
              + Add
            </button>
          )}
        </div>
      )}

      <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='bg-teal-600'>
                <th className='px-4 py-3 text-left text-white font-semibold'>
                  #
                </th>
                {fields.map((field) => (
                  <th
                    key={field.name}
                    className='px-4 py-3 text-left text-white font-semibold'
                  >
                    {field.label}
                  </th>
                ))}
                {(onEdit || deleteItem) && (
                  <th className='px-4 py-3 text-center text-white font-semibold'>
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => {
                const actualIndex = page * rowsPerPage + index;
                const isHighlighted =
                  highlightedRowId &&
                  (item._id === highlightedRowId ||
                    item.id === highlightedRowId);
                const isEven = index % 2 === 0;

                return (
                  <tr
                        key={item._id || item.id || index}
                        onClick={() => onRowClick && onRowClick(item)}
                        className={`
                          ${
                            isHighlighted
                              ? 'bg-yellow-200'
                              : isEven
                              ? 'bg-gray-50'
                              : 'bg-white'
                          }
                          hover:bg-green-50 border-b border-gray-100
                          ${onRowClick ? 'cursor-pointer' : ''}
                        `}
                      >

                    <td
                      className={`px-4 py-3 text-gray-800 ${
                        isHighlighted ? 'font-semibold' : ''
                      }`}
                    >
                      {actualIndex + 1}
                    </td>

                    {fields.map((field) => {
                      let value = item[field.name];

                      if (
                        field.type === 'currency' ||
                        ['buyingPrice', 'sellingPrice'].includes(field.name)
                      ) {
                        value = formatCurrency(Number(value || 0), 'RWF');
                      }

                      if (
                        field.type === 'date' ||
                        field.name.toLowerCase().includes('date') ||
                        field.name === 'expiryDate'
                      ) {
                        value = formatDate(value);
                      }

                      if (typeof value === 'string' && value.length > 40) {
                        value = value.slice(0, 40) + '...';
                      }

                      if (
                        value === undefined ||
                        value === null ||
                        value === ''
                      ) {
                        value = '-';
                      }

                      return (
                        <td
                          key={field.name}
                          className={`px-4 py-3 text-gray-800 max-w-xs truncate ${
                            isHighlighted ? 'font-semibold' : ''
                          }`}
                          title={
                            typeof item[field.name] === 'string'
                              ? item[field.name]
                              : ''
                          }
                        >
                          {value}
                        </td>
                      );
                    })}

                    {(onEdit || deleteItem) && (
                      <td className='px-4 py-3 text-center'>
                        <div className='flex justify-center gap-2'>
                          {onEdit && (
                            <button
                            onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit(item);
                                }}
                              className='p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors'
                              title='View Details'
                            >
                              <svg
                                className='w-4 h-4'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                                />
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                                />
                              </svg>
                            </button>
                          )}
                          {deleteItem && (
                            <button
                             onClick={(e) => {
                                  e.stopPropagation();
                                  deleteItem(item._id || item.id);
                                }}

                              className='p-1 text-red-600 hover:bg-red-100 rounded transition-colors'
                              title='Delete'
                            >
                              <svg
                                className='w-4 h-4'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data.length > rowsPerPage && (
          <div className='flex items-center justify-between px-4 py-3 border-t border-gray-200'>
            <div className='flex items-center gap-2'>
              <span className='text-sm text-gray-700'>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value));
                  setPage(0);
                }}
                className='border border-gray-300 rounded px-2 py-1 text-sm'
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className='flex items-center gap-2'>
              <span className='text-sm text-gray-700'>
                {page * rowsPerPage + 1}-
                {Math.min((page + 1) * rowsPerPage, data.length)} of{' '}
                {data.length}
              </span>
              <div className='flex gap-1'>
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className='p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <svg
                    className='w-4 h-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15 19l-7-7 7-7'
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className='p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <svg
                    className='w-4 h-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 5l7 7-7 7'
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
