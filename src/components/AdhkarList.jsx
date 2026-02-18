import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit3, Check, X, ChevronUp, ChevronDown, MoreVertical } from 'lucide-react';
import { CATEGORY_META } from '../data/adhkar';
import { useAdhkar } from '../context/AdhkarContext';

const AdhkarList = ({ initialCategory } = {}) => {
    const { adhkarData, setAdhkarData, selectDhikr } = useAdhkar();
    const allCats = Object.keys(adhkarData || {});
    const [activeTab, setActiveTab] = useState(initialCategory || allCats[0] || 'general');
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [contextMenu, setContextMenu] = useState(null); // { cat, x, y }
    const [renameModal, setRenameModal] = useState(null); // { cat }
    const [renameValue, setRenameValue] = useState('');
    const [newDhikr, setNewDhikr] = useState({ text: '', count: 33, category: activeTab, translation: '' });
    const contextRef = useRef(null);

    useEffect(() => {
        if (initialCategory && adhkarData[initialCategory]) setActiveTab(initialCategory);
    }, [initialCategory]);

    useEffect(() => {
        const handler = (e) => {
            if (contextRef.current && !contextRef.current.contains(e.target)) setContextMenu(null);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const adhkar = adhkarData[activeTab] || [];

    const handleAdd = () => {
        if (!newDhikr.text.trim()) return;
        const id = Date.now();
        const cat = newDhikr.category || activeTab;
        setAdhkarData(prev => ({
            ...prev,
            [cat]: [...(prev[cat] || []), { ...newDhikr, id, category: cat }],
        }));
        setNewDhikr({ text: '', count: 33, category: activeTab, translation: '' });
        setIsAdding(false);
    };

    const handleDelete = (id) => {
        setAdhkarData(prev => ({
            ...prev,
            [activeTab]: prev[activeTab].filter(d => d.id !== id),
        }));
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setNewDhikr({ text: item.text, count: item.count, category: item.category, translation: item.translation || '' });
    };

    const handleSaveEdit = (id) => {
        setAdhkarData(prev => ({
            ...prev,
            [activeTab]: prev[activeTab].map(d => d.id === id ? { ...d, ...newDhikr } : d),
        }));
        setEditingId(null);
        setNewDhikr({ text: '', count: 33, category: activeTab, translation: '' });
    };

    const handleReorder = (idx, dir) => {
        const items = [...adhkar];
        const target = idx + dir;
        if (target < 0 || target >= items.length) return;
        [items[idx], items[target]] = [items[target], items[idx]];
        setAdhkarData(prev => ({ ...prev, [activeTab]: items }));
    };

    const handleAddCategory = () => {
        const name = prompt('New category name:');
        if (!name?.trim()) return;
        const key = name.trim().toLowerCase().replace(/\s+/g, '-');
        if (!adhkarData[key]) {
            setAdhkarData(prev => ({ ...prev, [key]: [] }));
            setActiveTab(key);
        }
    };

    const handleRenameCategory = () => {
        if (!renameValue.trim() || !renameModal) return;
        const oldKey = renameModal.cat;
        const newKey = renameValue.trim().toLowerCase().replace(/\s+/g, '-');
        if (newKey === oldKey || adhkarData[newKey]) return;
        const updated = {};
        Object.keys(adhkarData).forEach(k => {
            updated[k === oldKey ? newKey : k] = adhkarData[k];
        });
        setAdhkarData(updated);
        if (activeTab === oldKey) setActiveTab(newKey);
        setRenameModal(null);
    };

    const handleDeleteCategory = (cat) => {
        if (!window.confirm(`Delete category "${cat}" and all its dhikr?`)) return;
        const updated = { ...adhkarData };
        delete updated[cat];
        setAdhkarData(updated);
        if (activeTab === cat) setActiveTab(Object.keys(updated)[0] || 'general');
        setContextMenu(null);
    };

    const formatCat = (cat) => {
        const meta = CATEGORY_META[cat];
        if (meta) return meta.label;
        return cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    const getCatIcon = (cat) => CATEGORY_META[cat]?.icon || '📿';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '8px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, letterSpacing: '-0.02em' }}>Adhkar Library</h2>
                <button onClick={() => { setIsAdding(!isAdding); setEditingId(null); }} style={{
                    background: isAdding ? 'var(--bg-glass)' : 'var(--accent-primary)',
                    border: '1px solid var(--bg-glass-border)',
                    borderRadius: '12px', padding: '8px 14px',
                    cursor: 'pointer', color: isAdding ? 'var(--text-secondary)' : '#fff',
                    fontSize: '13px', fontWeight: '600', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                    {isAdding ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Add</>}
                </button>
            </div>

            {/* Category Icon Pills */}
            <div style={{ overflowX: 'auto', paddingBottom: '4px' }}>
                <div style={{ display: 'flex', gap: '8px', width: 'max-content', padding: '2px 0' }}>
                    {allCats.map(cat => {
                        const isActive = cat === activeTab;
                        return (
                            <button
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    setContextMenu({ cat, x: e.clientX, y: e.clientY });
                                }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '8px 14px',
                                    borderRadius: '20px',
                                    border: `1px solid ${isActive ? 'var(--accent-primary)' : 'var(--bg-glass-border)'}`,
                                    background: isActive ? 'var(--accent-primary)' : 'var(--bg-glass)',
                                    backdropFilter: 'blur(12px)',
                                    WebkitBackdropFilter: 'blur(12px)',
                                    color: isActive ? '#fff' : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    fontSize: '13px', fontWeight: isActive ? '700' : '500',
                                    fontFamily: 'inherit',
                                    transition: 'all 0.2s',
                                    boxShadow: isActive ? '0 4px 12px rgba(45,106,79,0.3)' : 'none',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                <span>{getCatIcon(cat)}</span>
                                <span>{formatCat(cat)}</span>
                                <span style={{ opacity: 0.7, fontSize: '11px' }}>({(adhkarData[cat] || []).length})</span>
                            </button>
                        );
                    })}
                    {/* Add category pill */}
                    <button onClick={handleAddCategory} style={{
                        padding: '8px 14px', borderRadius: '20px',
                        border: '1px dashed var(--bg-glass-border)',
                        background: 'transparent', cursor: 'pointer',
                        color: 'var(--text-secondary)', fontSize: '13px',
                        fontFamily: 'inherit', whiteSpace: 'nowrap',
                        display: 'flex', alignItems: 'center', gap: '4px',
                    }}>
                        <Plus size={12} /> New
                    </button>
                </div>
            </div>

            {/* Active category label */}
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '0 2px' }}>
                {getCatIcon(activeTab)} {formatCat(activeTab)} — {adhkar.length} dhikr
            </div>

            {/* Add/Edit Form */}
            {(isAdding || editingId) && (
                <div style={{
                    background: 'var(--bg-glass)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid var(--bg-glass-border)',
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'flex', flexDirection: 'column', gap: '10px',
                    animation: 'scaleIn 0.2s',
                }}>
                    <textarea
                        placeholder="Arabic text..."
                        value={newDhikr.text}
                        onChange={e => setNewDhikr(p => ({ ...p, text: e.target.value }))}
                        rows={3}
                        style={{
                            width: '100%', padding: '10px 12px',
                            background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)',
                            borderRadius: '10px', color: 'var(--text-primary)',
                            fontSize: '18px', fontFamily: 'var(--font-family-arabic)',
                            direction: 'rtl', textAlign: 'right', resize: 'none',
                            outline: 'none', boxSizing: 'border-box',
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Translation (optional)"
                        value={newDhikr.translation}
                        onChange={e => setNewDhikr(p => ({ ...p, translation: e.target.value }))}
                        style={{
                            width: '100%', padding: '10px 12px',
                            background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)',
                            borderRadius: '10px', color: 'var(--text-primary)',
                            fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                        }}
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Count</label>
                            <input
                                type="number"
                                value={newDhikr.count}
                                onChange={e => setNewDhikr(p => ({ ...p, count: parseInt(e.target.value) || 33 }))}
                                style={{
                                    width: '100%', padding: '10px 12px',
                                    background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)',
                                    borderRadius: '10px', color: 'var(--text-primary)',
                                    fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                                }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Category</label>
                            <select
                                value={newDhikr.category}
                                onChange={e => setNewDhikr(p => ({ ...p, category: e.target.value }))}
                                style={{
                                    width: '100%', padding: '10px 12px',
                                    background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)',
                                    borderRadius: '10px', color: 'var(--text-primary)',
                                    fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                                }}
                            >
                                {allCats.map(c => <option key={c} value={c}>{formatCat(c)}</option>)}
                            </select>
                        </div>
                    </div>
                    <button
                        onClick={editingId ? () => handleSaveEdit(editingId) : handleAdd}
                        style={{
                            padding: '12px', background: 'var(--accent-primary)', border: 'none',
                            borderRadius: '12px', color: '#fff', fontSize: '14px', fontWeight: '700',
                            cursor: 'pointer', fontFamily: 'inherit',
                        }}
                    >
                        {editingId ? '✓ Save Changes' : '+ Add Dhikr'}
                    </button>
                </div>
            )}

            {/* Dhikr List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {adhkar.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📿</div>
                        No dhikr in this category yet.<br />Tap "+ Add" to add one.
                    </div>
                )}
                {adhkar.map((item, idx) => (
                    <div key={item.id}
                        role="button"
                        tabIndex={0}
                        aria-label={`Select ${item.text?.slice(0, 30) || 'dhikr'}, count ${item.count}`}
                        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && selectDhikr(item)}
                        style={{
                            background: 'var(--bg-glass)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            border: '1px solid var(--bg-glass-border)',
                            borderRadius: '16px',
                            padding: '14px 16px',
                            display: 'flex', alignItems: 'flex-start', gap: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--bg-glass-border)'}
                    >
                        {/* Reorder */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flexShrink: 0, paddingTop: '2px' }}>
                            <button onClick={(e) => { e.stopPropagation(); handleReorder(idx, -1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--text-secondary)' }}>
                                <ChevronUp size={14} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleReorder(idx, 1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--text-secondary)' }}>
                                <ChevronDown size={14} />
                            </button>
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }} onClick={() => selectDhikr(item)}>
                            <div style={{
                                fontFamily: 'var(--font-family-arabic)',
                                fontSize: '18px', lineHeight: '1.8',
                                textAlign: 'right', direction: 'rtl',
                                color: 'var(--text-primary)',
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                            }}>
                                {item.text}
                            </div>
                            {item.translation && (
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                                    {item.translation}
                                </div>
                            )}
                            <div style={{ marginTop: '6px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <span style={{
                                    fontSize: '11px', fontWeight: '700',
                                    color: 'var(--accent-primary)',
                                    background: 'var(--accent-light)',
                                    padding: '2px 8px', borderRadius: '10px',
                                }}>
                                    ×{item.count}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}>
                            <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-secondary)' }}>
                                <Edit3 size={14} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#ef4444' }}>
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Context Menu (right-click on category pill) */}
            {contextMenu && (
                <div ref={contextRef} style={{
                    position: 'fixed',
                    top: contextMenu.y, left: contextMenu.x,
                    zIndex: 9999,
                    background: 'var(--bg-glass-strong)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid var(--bg-glass-border)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    minWidth: '160px',
                    animation: 'scaleIn 0.15s',
                }}>
                    <button onClick={() => { setRenameModal({ cat: contextMenu.cat }); setRenameValue(formatCat(contextMenu.cat)); setContextMenu(null); }} style={{
                        display: 'block', width: '100%', padding: '12px 16px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        textAlign: 'left', fontSize: '14px', color: 'var(--text-primary)',
                        fontFamily: 'inherit',
                    }}>
                        ✏️ Rename
                    </button>
                    <button onClick={() => handleDeleteCategory(contextMenu.cat)} style={{
                        display: 'block', width: '100%', padding: '12px 16px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        textAlign: 'left', fontSize: '14px', color: '#ef4444',
                        fontFamily: 'inherit',
                    }}>
                        🗑️ Delete Category
                    </button>
                </div>
            )}

            {/* Rename Modal */}
            {renameModal && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '24px',
                }}>
                    <div style={{
                        background: 'var(--bg-glass-strong)',
                        backdropFilter: 'blur(24px)',
                        border: '1px solid var(--bg-glass-border)',
                        borderRadius: '20px',
                        padding: '24px',
                        width: '100%', maxWidth: '320px',
                        animation: 'scaleIn 0.2s',
                    }}>
                        <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>Rename Category</div>
                        <input
                            autoFocus
                            value={renameValue}
                            onChange={e => setRenameValue(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleRenameCategory()}
                            style={{
                                width: '100%', padding: '12px', boxSizing: 'border-box',
                                background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)',
                                borderRadius: '12px', color: 'var(--text-primary)',
                                fontSize: '14px', fontFamily: 'inherit', outline: 'none',
                                marginBottom: '12px',
                            }}
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => setRenameModal(null)} style={{
                                flex: 1, padding: '12px', background: 'var(--bg-glass)',
                                border: '1px solid var(--bg-glass-border)', borderRadius: '12px',
                                cursor: 'pointer', color: 'var(--text-secondary)', fontFamily: 'inherit',
                            }}>Cancel</button>
                            <button onClick={handleRenameCategory} style={{
                                flex: 1, padding: '12px', background: 'var(--accent-primary)',
                                border: 'none', borderRadius: '12px',
                                cursor: 'pointer', color: '#fff', fontWeight: '700', fontFamily: 'inherit',
                            }}>Rename</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdhkarList;
