import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Trash2, Check, GripVertical, ArrowUp, ArrowDown, ChevronDown } from 'lucide-react';

const AdhkarList = ({ onSelect, adhkarData, setAdhkarData, initialCategory }) => {
    return <AdhkarListFixed
        onSelect={onSelect}
        adhkarData={adhkarData}
        setAdhkarData={setAdhkarData}
        initialCategory={initialCategory}
    />;
};

const AdhkarListFixed = ({ onSelect, adhkarData, setAdhkarData, initialCategory }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newDhikr, setNewDhikr] = useState({ text: '', count: 33, translation: '', category: 'general' });
    const [customCategoryInput, setCustomCategoryInput] = useState('');
    const [activeTab, setActiveTab] = useState(initialCategory || 'general');
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const [categoryMenu, setCategoryMenu] = useState({ open: false, x: 0, y: 0, category: null });
    const [renameCategoryInput, setRenameCategoryInput] = useState('');
    const [isRenamingCategory, setIsRenamingCategory] = useState(false);
    const [categoryToRename, setCategoryToRename] = useState(null);

    // Category dropdown
    const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);

    useEffect(() => {
        if (initialCategory && adhkarData[initialCategory]) {
            setActiveTab(initialCategory);
        }
    }, [initialCategory, adhkarData]);

    useEffect(() => {
        const closeMenu = () => setCategoryMenu({ open: false, x: 0, y: 0, category: null });
        window.addEventListener('click', closeMenu);
        return () => window.removeEventListener('click', closeMenu);
    }, []);

    const formatCategory = (cat) => {
        if (!cat) return '';
        return cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const handleSaveDhikr = () => {
        if (!newDhikr.text.trim()) return;
        let finalCategory = newDhikr.category;
        if (finalCategory === 'custom' && customCategoryInput.trim()) {
            finalCategory = customCategoryInput.trim().toLowerCase();
        } else if (finalCategory === 'custom') {
            finalCategory = 'general';
        }

        if (editingId) {
            setAdhkarData(prev => {
                const newData = { ...prev };
                Object.keys(newData).forEach(cat => {
                    const idx = newData[cat].findIndex(item => item.id === editingId);
                    if (idx !== -1) newData[cat].splice(idx, 1);
                });
                const updatedItem = { id: editingId, ...newDhikr, category: finalCategory, count: parseInt(newDhikr.count) || 33 };
                if (!newData[finalCategory]) newData[finalCategory] = [];
                newData[finalCategory] = [updatedItem, ...newData[finalCategory]];
                return newData;
            });
        } else {
            const newItem = { id: Date.now(), ...newDhikr, category: finalCategory, count: parseInt(newDhikr.count) || 33 };
            setAdhkarData(prev => ({ ...prev, [finalCategory]: [newItem, ...(prev[finalCategory] || [])] }));
        }
        setIsAdding(false);
        setEditingId(null);
        setActiveTab(finalCategory);
        setNewDhikr({ text: '', count: 33, translation: '', category: 'general' });
        setCustomCategoryInput('');
    };

    const handleCategoryContextMenu = (e, category) => {
        e.preventDefault();
        e.stopPropagation();
        setCategoryMenu({ open: true, x: e.clientX, y: e.clientY, category: category });
    };

    const handleRenameCategory = (e) => {
        e.stopPropagation();
        setCategoryToRename(categoryMenu.category);
        setRenameCategoryInput(categoryMenu.category);
        setIsRenamingCategory(true);
        setCategoryMenu(prev => ({ ...prev, open: false }));
    };

    const saveCategoryRename = () => {
        if (!renameCategoryInput.trim() || renameCategoryInput === categoryToRename) {
            setIsRenamingCategory(false);
            return;
        }

        const oldKey = categoryToRename;
        const newKey = renameCategoryInput.trim().toLowerCase();

        setAdhkarData(prev => {
            const newData = { ...prev };
            if (newData[oldKey]) {
                newData[newKey] = newData[oldKey].map(item => ({ ...item, category: newKey }));
                delete newData[oldKey];
            }
            return newData;
        });

        setActiveTab(newKey);
        setIsRenamingCategory(false);
        setCategoryToRename(null);
    };

    const handleDeleteCategory = (e) => {
        e.stopPropagation();
        if (window.confirm(`Delete "${categoryMenu.category}" and all its Adhkar?`)) {
            setAdhkarData(prev => {
                const newData = { ...prev };
                delete newData[categoryMenu.category];
                return newData;
            });
            setActiveTab('general');
        }
        setCategoryMenu({ open: false, x: 0, y: 0, category: null });
    };

    const handleEdit = (item, e) => {
        e.stopPropagation();
        setEditingId(item.id);
        setNewDhikr({ text: item.text, translation: item.translation || '', count: item.count, category: activeTab });
        setIsAdding(true);
    };

    const handleDeleteClick = (id, e) => {
        e.stopPropagation();
        setConfirmDeleteId(id);
    };

    const confirmDelete = (id, e) => {
        e.stopPropagation();
        setAdhkarData(prev => {
            const newData = { ...prev };
            newData[activeTab] = newData[activeTab].filter(item => item.id !== id);
            return newData;
        });
        setConfirmDeleteId(null);
    };

    const cancelDelete = (e) => {
        e.stopPropagation();
        setConfirmDeleteId(null);
    };

    const moveItem = (index, direction, e) => {
        e.stopPropagation();
        setAdhkarData(prev => {
            const list = [...(prev[activeTab] || [])];
            if (direction === 'up' && index > 0) {
                [list[index], list[index - 1]] = [list[index - 1], list[index]];
            } else if (direction === 'down' && index < list.length - 1) {
                [list[index], list[index + 1]] = [list[index + 1], list[index]];
            }
            return { ...prev, [activeTab]: list };
        });
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
        setNewDhikr({ text: '', count: 33, translation: '', category: 'general' });
        setCustomCategoryInput('');
    };

    const adhkar = adhkarData[activeTab] || [];
    const allCats = Object.keys(adhkarData);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-m)' }}>
            {/* Title + Add */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, letterSpacing: '-0.02em' }}>Select Dhikr</h2>
                {!isAdding && (
                    <button onClick={() => { setIsAdding(true); setEditingId(null); setNewDhikr({ text: '', count: 33, translation: '', category: activeTab }); }}
                        className="btn-glass"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 14px', fontSize: '13px' }}
                    >
                        <Plus size={15} /> Add
                    </button>
                )}
            </div>

            {/* Category Dropdown */}
            {!isAdding && (
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                        className="glass"
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 14px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            borderRadius: 'var(--radius-m)',
                            border: isCatDropdownOpen ? '1px solid var(--accent-primary)' : '1px solid var(--bg-glass-border)',
                            transition: 'all 0.2s ease',
                            background: isCatDropdownOpen ? 'var(--bg-glass-strong)' : 'var(--bg-glass)',
                        }}
                    >
                        <span style={{
                            flex: 1,
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                        }}>
                            {formatCategory(activeTab)}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {adhkar.length} items
                        </span>
                        <ChevronDown size={18} color="var(--text-secondary)" style={{
                            transform: isCatDropdownOpen ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)',
                        }} />
                    </button>

                    {isCatDropdownOpen && (
                        <div className="glass-strong" style={{
                            position: 'absolute',
                            top: 'calc(100% + 4px)',
                            left: 0,
                            right: 0,
                            borderRadius: 'var(--radius-m)',
                            boxShadow: 'var(--elevation-16)',
                            maxHeight: '40vh',
                            overflowY: 'auto',
                            zIndex: 1000,
                            animation: 'fadeIn 0.15s cubic-bezier(0.32, 0.72, 0, 1)',
                            padding: '4px',
                        }}>
                            {allCats.map(cat => {
                                const isActive = cat === activeTab;
                                const count = (adhkarData[cat] || []).length;
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => { setActiveTab(cat); setIsCatDropdownOpen(false); }}
                                        onContextMenu={(e) => handleCategoryContextMenu(e, cat)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '12px',
                                            borderRadius: 'var(--radius-s)',
                                            backgroundColor: isActive ? 'var(--accent-light)' : 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.15s',
                                        }}
                                        onMouseEnter={e => !isActive && (e.currentTarget.style.backgroundColor = 'var(--bg-glass)')}
                                        onMouseLeave={e => !isActive && (e.currentTarget.style.backgroundColor = 'transparent')}
                                    >
                                        <span style={{
                                            flex: 1,
                                            fontSize: '14px',
                                            fontWeight: isActive ? '600' : '500',
                                            color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)',
                                        }}>
                                            {formatCategory(cat)}
                                        </span>
                                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{count}</span>
                                        {isActive && <Check size={16} color="var(--accent-primary)" />}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Rename Category Modal */}
            {isRenamingCategory && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(12px)',
                    zIndex: 2000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <div className="glass-strong" style={{
                        padding: '24px', borderRadius: 'var(--radius-l)',
                        width: '80%', maxWidth: '300px',
                        boxShadow: 'var(--elevation-16)',
                        animation: 'scaleIn 0.2s',
                    }}>
                        <h3 style={{ marginTop: 0, fontSize: '16px', fontWeight: '700' }}>Rename Category</h3>
                        <input
                            autoFocus
                            value={renameCategoryInput}
                            onChange={e => setRenameCategoryInput(e.target.value)}
                            style={{
                                width: '100%', padding: '10px', margin: '10px 0',
                                borderRadius: 'var(--radius-s)',
                                border: '1px solid var(--bg-glass-border)',
                                background: 'var(--bg-glass)',
                                color: 'var(--text-primary)',
                                fontSize: '14px',
                                fontFamily: 'inherit',
                            }}
                        />
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setIsRenamingCategory(false)} className="btn-glass" style={{ padding: '8px 16px', fontSize: '13px' }}>Cancel</button>
                            <button onClick={saveCategoryRename} className="btn-accent" style={{ padding: '8px 16px', fontSize: '13px' }}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Category Context Menu */}
            {categoryMenu.open && (
                <div className="glass-strong" style={{
                    position: 'fixed',
                    top: categoryMenu.y, left: categoryMenu.x,
                    borderRadius: 'var(--radius-s)',
                    boxShadow: 'var(--elevation-16)',
                    zIndex: 3000,
                    minWidth: '150px',
                    padding: '4px',
                    animation: 'fadeIn 0.1s',
                }} onClick={e => e.stopPropagation()}>
                    <button onClick={handleRenameCategory} style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '10px 12px', background: 'transparent', border: 'none',
                        cursor: 'pointer', fontSize: '14px', color: 'var(--text-primary)',
                        borderRadius: '4px',
                    }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-glass)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >Rename</button>
                    <button onClick={handleDeleteCategory} style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '10px 12px', background: 'transparent', border: 'none',
                        cursor: 'pointer', fontSize: '14px', color: 'var(--system-error)',
                        borderRadius: '4px',
                    }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-glass)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >Delete</button>
                </div>
            )}

            {/* Add/Edit Form */}
            {isAdding && (
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeIn 0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: '700' }}>{editingId ? 'Edit Dhikr' : 'New Dhikr'}</span>
                        <button onClick={handleCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                            <X size={18} color="var(--text-secondary)" />
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Category</label>
                        <select value={newDhikr.category} onChange={(e) => { setNewDhikr({ ...newDhikr, category: e.target.value }); if (e.target.value !== 'custom') setCustomCategoryInput(''); }}
                            style={{
                                padding: '10px', borderRadius: 'var(--radius-s)',
                                border: '1px solid var(--bg-glass-border)',
                                fontFamily: 'inherit', fontSize: '14px',
                                backgroundColor: 'var(--bg-glass)', color: 'var(--text-primary)',
                            }}
                        >
                            {Object.keys(adhkarData).map(key => (
                                <option key={key} value={key}>{formatCategory(key)}</option>
                            ))}
                            <option value="custom">Create New Category...</option>
                        </select>
                        {newDhikr.category === 'custom' && (
                            <input type="text" placeholder="Enter category name" value={customCategoryInput}
                                onChange={(e) => setCustomCategoryInput(e.target.value)}
                                style={{
                                    marginTop: '4px', padding: '10px', borderRadius: 'var(--radius-s)',
                                    border: '1px solid var(--bg-glass-border)', background: 'var(--bg-glass)',
                                    color: 'var(--text-primary)', fontFamily: 'inherit',
                                }}
                            />
                        )}
                    </div>
                    <input type="text" placeholder="Dhikr Text (Arabic preferred)" value={newDhikr.text}
                        onChange={(e) => setNewDhikr({ ...newDhikr, text: e.target.value })}
                        style={{
                            padding: '10px', borderRadius: 'var(--radius-s)',
                            border: '1px solid var(--bg-glass-border)', background: 'var(--bg-glass)',
                            color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '14px',
                        }}
                    />
                    <input type="text" placeholder="Translation (optional)" value={newDhikr.translation}
                        onChange={(e) => setNewDhikr({ ...newDhikr, translation: e.target.value })}
                        style={{
                            padding: '10px', borderRadius: 'var(--radius-s)',
                            border: '1px solid var(--bg-glass-border)', background: 'var(--bg-glass)',
                            color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '14px',
                        }}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input type="number" placeholder="Count" value={newDhikr.count}
                            onChange={(e) => setNewDhikr({ ...newDhikr, count: e.target.value })}
                            style={{
                                padding: '10px', borderRadius: 'var(--radius-s)',
                                border: '1px solid var(--bg-glass-border)',
                                width: '80px', background: 'var(--bg-glass)',
                                color: 'var(--text-primary)', fontFamily: 'inherit',
                            }}
                        />
                        <button className="btn-accent" onClick={handleSaveDhikr} style={{ flex: 1, fontSize: '14px' }}>
                            {editingId ? 'Update' : 'Save'}
                        </button>
                    </div>
                </div>
            )}

            {/* Adhkar List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '60vh', overflowY: 'auto' }}>
                {adhkar.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                        No Dhikr in this category
                    </div>
                ) : adhkar.map((item, index) => (
                    <div key={item.id}
                        className="glass-card"
                        onClick={() => onSelect && onSelect(item)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            paddingRight: '12px',
                            paddingLeft: '8px',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--accent-primary)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--bg-glass-border)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        {/* Reorder Controls */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '10px', color: 'var(--text-secondary)' }}>
                            {index > 0 && (
                                <div onClick={(e) => moveItem(index, 'up', e)} style={{ padding: '2px', cursor: 'pointer', opacity: 0.5, transition: 'opacity 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                    onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
                                >
                                    <ArrowUp size={12} />
                                </div>
                            )}
                            <GripVertical size={14} style={{ opacity: 0.3, margin: '1px 0' }} />
                            {index < adhkar.length - 1 && (
                                <div onClick={(e) => moveItem(index, 'down', e)} style={{ padding: '2px', cursor: 'pointer', opacity: 0.5, transition: 'opacity 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                    onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
                                >
                                    <ArrowDown size={12} />
                                </div>
                            )}
                        </div>

                        {/* Text */}
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontWeight: '600',
                                fontSize: '17px',
                                fontFamily: 'var(--font-family-arabic)',
                                lineHeight: '1.5',
                                color: 'var(--text-primary)',
                            }}>
                                {item.text}
                            </div>
                            {item.translation && (
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.3' }}>
                                    {item.translation}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', marginLeft: '12px' }}>
                            <div style={{
                                backgroundColor: 'var(--accent-light)',
                                padding: '4px 10px',
                                borderRadius: 'var(--radius-pill)',
                                fontSize: '13px',
                                fontWeight: '700',
                                color: 'var(--accent-primary)',
                                textAlign: 'center',
                            }}>
                                {item.count}×
                            </div>
                            {confirmDeleteId === item.id ? (
                                <div className="glass" style={{ display: 'flex', gap: '4px', borderRadius: 'var(--radius-s)', padding: '2px', zIndex: 10 }}
                                    onClick={e => e.stopPropagation()}
                                >
                                    <button onClick={(e) => confirmDelete(item.id, e)} style={{
                                        background: 'var(--system-error)', border: 'none', cursor: 'pointer',
                                        padding: '4px 8px', borderRadius: '6px', color: 'white',
                                    }}><Check size={14} /></button>
                                    <button onClick={cancelDelete} style={{
                                        background: 'transparent', border: 'none', cursor: 'pointer',
                                        padding: '4px 8px', borderRadius: '6px', color: 'var(--text-primary)',
                                    }}><X size={14} /></button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <button onClick={(e) => handleEdit(item, e)} style={{
                                        background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                                        color: 'var(--text-secondary)', transition: 'color 0.2s',
                                    }} title="Edit"
                                        onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'}
                                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                                    ><Edit2 size={15} /></button>
                                    <button onClick={(e) => handleDeleteClick(item.id, e)} style={{
                                        background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                                        color: 'var(--text-secondary)', transition: 'color 0.2s',
                                    }} title="Delete"
                                        onMouseEnter={e => e.currentTarget.style.color = 'var(--system-error)'}
                                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                                    ><Trash2 size={15} /></button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdhkarList;
