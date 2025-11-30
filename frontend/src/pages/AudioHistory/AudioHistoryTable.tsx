import React, { useState } from 'react';

type AudioItem = {
  id: number;
  name: string;
  dateAdded: string;
  transcript: string;
  summary: string;
};

interface AudioHistoryTableProps {
  items?: AudioItem[];
  onDownload?: (item: AudioItem) => void;
  onDelete?: (item: AudioItem) => void;
}

type ExpandedField = 'transcript' | 'summary' | null;

const AudioHistoryTable: React.FC<AudioHistoryTableProps> = ({
  items = [],
  onDownload,
  onDelete,
}) => {
  const [expanded, setExpanded] = useState<{
    id: number | null;
    field: ExpandedField;
  }>({ id: null, field: null });

  const handleDownload = (item: AudioItem) => {
    if (onDownload) {
      onDownload(item);
    } else {
      console.log("Error downloading");
    }
  };

  const handleDelete = (item: AudioItem) => {
    if (onDelete) {
      onDelete(item);
    } else {
      console.log("Error deleting");
    }
  };

  const toggleExpand = (id: number, field: ExpandedField) => {
    setExpanded((prev) =>
      prev.id === id && prev.field === field
        ? { id: null, field: null }
        : { id, field }
    );
  };

  const isExpanded = (id: number, field: ExpandedField) =>
    expanded.id === id && expanded.field === field;

  return (
    <div style={{ width: '100%', maxWidth: 1100, margin: '1.5rem auto' }}>
      <h2 style={{ marginBottom: '0.75rem', fontSize: '1.1rem' }}>Audio History</h2>

      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 14,
          }}
        >
          <thead style={{ backgroundColor: '#f9fafb' }}>
            <tr>
              <th style={thStyle}>Audio</th>
              <th style={thStyle}>Date Added</th>
              <th style={thStyle}>Transcript</th>
              <th style={thStyle}>Summary</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr
                key={item.id}
                style={{
                  backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb',
                }}
              >
                <td style={tdStyle}>
                  <div style={{ fontWeight: 500 }}>{item.name}</div>
                </td>

                <td style={{ ...tdStyle, whiteSpace: 'nowrap', color: '#6b7280' }}>
                  {item.dateAdded}
                </td>

                <td style={tdStyle}>
                  <div style={clampStyle}>{item.transcript}</div>
                  <button
                    type="button"
                    style={linkButtonStyle}
                    onClick={() => toggleExpand(item.id, 'transcript')}
                  >
                    {isExpanded(item.id, 'transcript')
                      ? 'Hide transcript'
                      : 'View full transcript'}
                  </button>
                  {isExpanded(item.id, 'transcript') && (
                    <div style={expandedBoxStyle}>{item.transcript}</div>
                  )}
                </td>

                <td style={tdStyle}>
                  <div style={{ ...clampStyle, fontStyle: 'italic', color: '#4b5563' }}>
                    {item.summary}
                  </div>
                  <button
                    type="button"
                    style={linkButtonStyle}
                    onClick={() => toggleExpand(item.id, 'summary')}
                  >
                    {isExpanded(item.id, 'summary')
                      ? 'Hide summary'
                      : 'View full summary'}
                  </button>
                  {isExpanded(item.id, 'summary') && (
                    <div style={expandedBoxStyle}>{item.summary}</div>
                  )}
                </td>

                <td
                  style={{
                    ...tdStyle,
                    textAlign: 'right',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <button
                    type="button"
                    style={downloadButtonStyle}
                    onClick={() => handleDownload(item)}
                  >
                    Download
                  </button>
                  <button
                    type="button"
                    style={deleteButtonStyle}
                    onClick={() => handleDelete(item)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: '1.5rem',
                    textAlign: 'center',
                    color: '#6b7280',
                  }}
                >
                  No recordings yet. Your audio history will show up here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Simple inline style objects

const thStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  textAlign: 'left',
  fontWeight: 600,
  color: '#4b5563',
  borderBottom: '1px solid #e5e7eb',
};

const tdStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  verticalAlign: 'top',
  borderBottom: '1px solid #e5e7eb',
};

const clampStyle: React.CSSProperties = {
  maxHeight: '3rem',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
};

const linkButtonStyle: React.CSSProperties = {
  marginTop: 4,
  padding: 0,
  border: 'none',
  background: 'none',
  color: '#2563eb',
  fontSize: 12,
  cursor: 'pointer',
  textDecoration: 'underline',
};

const expandedBoxStyle: React.CSSProperties = {
  marginTop: 8,
  padding: 8,
  borderRadius: 4,
  backgroundColor: '#f3f4f6',
  fontSize: 13,
  lineHeight: 1.5,
};

const downloadButtonStyle: React.CSSProperties = {
  padding: '6px 12px',
  borderRadius: 9999,
  border: '1px solid #2563eb',
  backgroundColor: '#2563eb',
  color: '#ffffff',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  marginLeft: 4,
};

const deleteButtonStyle: React.CSSProperties = {
  padding: '6px 12px',
  borderRadius: 9999,
  border: '1px solid #ef4444',
  backgroundColor: '#ffffff',
  color: '#ef4444',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  marginLeft: 8,
};

export default AudioHistoryTable;
