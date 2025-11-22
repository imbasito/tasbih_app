import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Trash2, Check, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';

const AdhkarList = ({ onSelect, adhkarData, setAdhkarData, initialCategory }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newDhikr, setNewDhikr] = useState({ text: '', count: 33, translation: '', category: 'general' });
    const [customCategoryInput, setCustomCategoryInput] = useState('');
    
    const [activeTab, setActiveTab] = useState(initialCategory || 'general');
    
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    
    // Context Menu State for Category
    const [categoryMenu, setCategoryMenu] = useState({ open: false, x: 0, y: 0, category: null });
    const [renameCategoryInput, setRenameCategoryInput] = useState('');
    const [isRenamingCategory, setIsRenamingCategory] = useState(false);

    useEffect(() => {
        if (initialCategory && adhkarData[initialCategory]) {
            setActiveTab(initialCategory);
        }
    }, [initialCategory, adhkarData]);

    // Close category menu when clicking elsewhere
    useEffect(() => {
        const closeMenu = () => setCategoryMenu({ open: false, x: 0, y: 0, category: null });
        window.addEventListener('click', closeMenu);
        return () => window.removeEventListener('click', closeMenu);
    }, []);

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
                // We need to find which category the item WAS in to remove it correctly if category changed
                // But here we are iterating all categories. 
                // Let's simplify: Remove from all categories, add to finalCategory.
                Object.keys(newData).forEach(cat => {
                    const idx = newData[cat].findIndex(item => item.id === editingId);
                    if (idx !== -1) {
                        newData[cat].splice(idx, 1);
                    }
                });

                const updatedItem = {
                    id: editingId,
                    ...newDhikr,
                    category: finalCategory,
                    count: parseInt(newDhikr.count) || 33
                };
                // Ensure array exists
                if (!newData[finalCategory]) newData[finalCategory] = [];
                newData[finalCategory] = [updatedItem, ...newData[finalCategory]];
                
                return newData;
            });
        } else {
            const newItem = {
                id: Date.now(),
                ...newDhikr,
                category: finalCategory,
                count: parseInt(newDhikr.count) || 33
            };

            setAdhkarData(prev => ({
                ...prev,
                [finalCategory]: [newItem, ...(prev[finalCategory] || [])]
            }));
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
        setCategoryMenu({
            open: true,
            x: e.clientX,
            y: e.clientY,
            category: category
        });
    };
    
    const handleRenameCategory = (e) => {
        e.stopPropagation();
        setRenameCategoryInput(categoryMenu.category);
        setIsRenamingCategory(true);
        setCategoryMenu(prev => ({ ...prev, open: false })); 
    };

    const saveCategoryRename = () => {
        // Fix: Ensure input is valid and different
        if (!renameCategoryInput.trim() || renameCategoryInput === categoryMenu.category) {
            setIsRenamingCategory(false);
            return;
        }
        
        // Use the captured category name from when menu was opened, OR the one in state if menu closed
        // Since we set renameCategoryInput from categoryMenu.category, we can assume `categoryMenu.category` is stale or null if closed?
        // Actually `categoryMenu.category` might be cleared by the click listener. 
        // We should store the target category in a separate state when 'Rename' is clicked, OR rely on `renameCategoryInput` being initialized correctly.
        // Better: Store `targetCategoryForRename` state. 
        // But here, let's use the value we initialized `renameCategoryInput` with? No, that's the input value.
        // We need to know WHAT we are renaming. 
        // The issue reported was "rename does not rename".
        // It's likely because `categoryMenu.category` is null when this function runs (because menu closed).
        
        // Let's use a temp state for the target category
        // Wait, I can just use a new state variable `categoryToRename` set in `handleRenameCategory`
        // But for now, let's assume I fix it by tracking it.
        // Actually, I see `categoryMenu` is cleared on window click.
        // So I should capture the category name in `isRenamingCategory` or separate state.
        
        // I'll use `renameCategoryInput` as the NEW name, but I need the OLD name.
        // I will add `editingCategoryKey` state.
    };

    // Let's rewrite the component to include `editingCategoryKey` to fix the bug.
    // AND revert the list text styling.
    
    return <AdhkarListFixed 
        onSelect={onSelect} 
        adhkarData={adhkarData} 
        setAdhkarData={setAdhkarData} 
        initialCategory={initialCategory} 
    />;
};

// I will perform the full rewrite below in the actual file write.
// This split is just for thinking.
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
    const [categoryToRename, setCategoryToRename] = useState(null); // Fixed: Store which category is being renamed

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
        setCategoryToRename(categoryMenu.category); // Capture the category key
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
        if (window.confirm(`Are you sure you want to delete the category "${categoryMenu.category}" and all its Adhkar?`)) {
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

    const getActiveAdhkar = () => {
        return adhkarData[activeTab] || [];
    };

    const adhkar = getActiveAdhkar();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-m)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'var(--font-weight-semibold)', margin: 0 }}>Select Dhikr</h2>
                {!isAdding && (
                    <button onClick={() => { setIsAdding(true); setEditingId(null); setNewDhikr({ text: '', count: 33, translation: '', category: activeTab }); }} className="fluent-button" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 12px' }}>
                        <Plus size={16} /> <span>Add Custom</span>
                    </button>
                )}
            </div>

            {!isAdding && (
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', WebkitOverflowScrolling: 'touch' }}>
                    {Object.keys(adhkarData).map(key => {
                        const label = key.charAt(0).toUpperCase() + key.slice(1);
                        const isActive = activeTab === key;
                        return (
                            <button key={key} onClick={() => setActiveTab(key)} onContextMenu={(e) => handleCategoryContextMenu(e, key)} style={{ padding: '6px 12px', borderRadius: '16px', border: isActive ? 'none' : '1px solid var(--neutral-layer-2)', backgroundColor: isActive ? 'var(--brand-primary)' : 'var(--neutral-layer-1)', color: isActive ? 'white' : 'var(--text-primary)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap', boxShadow: isActive ? 'var(--elevation-4)' : 'none', userSelect: 'none' }}>
                                {label}
                            </button>
                        )
                    })}
                </div>
            )}

            {isRenamingCategory && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ backgroundColor: 'var(--neutral-layer-card)', padding: '20px', borderRadius: '12px', width: '80%', maxWidth: '300px', boxShadow: 'var(--elevation-16)' }}>
                        <h3 style={{ marginTop: 0, fontSize: '16px' }}>Rename Category</h3>
                        <input autoFocus value={renameCategoryInput} onChange={e => setRenameCategoryInput(e.target.value)} style={{ width: '100%', padding: '8px', margin: '10px 0', borderRadius: '8px', border: '1px solid var(--neutral-layer-2)' }} />
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setIsRenamingCategory(false)} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={saveCategoryRename} className="fluent-button fluent-button-primary">Save</button>
                        </div>
                    </div>
                </div>
            )}

            {categoryMenu.open && (
                <div style={{ position: 'fixed', top: categoryMenu.y, left: categoryMenu.x, backgroundColor: 'var(--neutral-layer-card)', borderRadius: '8px', boxShadow: 'var(--elevation-16)', border: '1px solid var(--neutral-layer-2)', zIndex: 3000, minWidth: '150px', padding: '4px', animation: 'fadeIn 0.1s' }} onClick={e => e.stopPropagation()}>
                    <button onClick={handleRenameCategory} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', color: 'var(--text-primary)', borderRadius: '4px' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--neutral-layer-2)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>Rename</button>
                    <button onClick={handleDeleteCategory} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', color: 'var(--system-error)', borderRadius: '4px' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--neutral-layer-2)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>Delete</button>
                </div>
            )}

            {isAdding && (
                <div className="fluent-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeIn 0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <span style={{ fontSize: '14px', fontWeight: '600' }}>{editingId ? 'Edit Dhikr' : 'New Dhikr'}</span>
                         <button onClick={handleCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}> <X size={18} color="var(--text-secondary)" /> </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Category</label>
                        <select value={newDhikr.category} onChange={(e) => { setNewDhikr({...newDhikr, category: e.target.value}); if (e.target.value !== 'custom') setCustomCategoryInput(''); }} style={{ padding: '8px', borderRadius: 'var(--radius-m)', border: '1px solid var(--neutral-layer-2)', fontFamily: 'inherit', fontSize: '14px', backgroundColor: '#ffffff', color: '#000000' }}>
                            {Object.keys(adhkarData).map(key => ( <option key={key} value={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</option> ))}
                            <option value="custom">Create New Category...</option>
                        </select>
                        {newDhikr.category === 'custom' && ( <input type="text" placeholder="Enter category name" value={customCategoryInput} onChange={(e) => setCustomCategoryInput(e.target.value)} style={{ marginTop: '4px', padding: '8px', borderRadius: 'var(--radius-m)', border: '1px solid var(--neutral-layer-2)' }} /> )}
                    </div>
                    <input type="text" placeholder="Dhikr Text (Arabic preferred)" value={newDhikr.text} onChange={(e) => setNewDhikr({...newDhikr, text: e.target.value})} style={{ padding: '10px', borderRadius: 'var(--radius-m)', border: '1px solid var(--neutral-layer-2)' }} />
                    <input type="text" placeholder="Translation (optional)" value={newDhikr.translation} onChange={(e) => setNewDhikr({...newDhikr, translation: e.target.value})} style={{ padding: '10px', borderRadius: 'var(--radius-m)', border: '1px solid var(--neutral-layer-2)' }} />
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input type="number" placeholder="Count" value={newDhikr.count} onChange={(e) => setNewDhikr({...newDhikr, count: e.target.value})} style={{ padding: '10px', borderRadius: 'var(--radius-m)', border: '1px solid var(--neutral-layer-2)', width: '80px' }} />
                        <button className="fluent-button fluent-button-primary" onClick={handleSaveDhikr} style={{ flex: 1 }}> {editingId ? 'Update Dhikr' : 'Save Dhikr'} </button>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-m)', maxHeight: '65vh', overflowY: 'auto' }}>
                {adhkar.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>No Dhikr in this category</div>
                ) : adhkar.map((item, index) => (
                    <div key={item.id} className="fluent-card" onClick={() => onSelect && onSelect(item)} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', border: '1px solid transparent', transition: 'border-color 0.2s', position: 'relative', paddingRight: '12px', paddingLeft: '8px' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--brand-primary)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '12px', color: 'var(--text-secondary)' }}>
                             {index > 0 && ( <div onClick={(e) => moveItem(index, 'up', e)} style={{ padding: '2px', cursor: 'pointer' }}> <ArrowUp size={12} /> </div> )}
                             <GripVertical size={16} style={{ opacity: 0.5, margin: '2px 0' }} />
                             {index < adhkar.length - 1 && ( <div onClick={(e) => moveItem(index, 'down', e)} style={{ padding: '2px', cursor: 'pointer' }}> <ArrowDown size={12} /> </div> )}
                        </div>
                        <div style={{ flex: 1 }}>
                            {/* REVERTED: Removed whiteSpace: nowrap to allow wrapping as requested ("revert... back to how it was before") */}
                            <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: '18px', fontFamily: '"Segoe UI", "Traditional Arabic", sans-serif', lineHeight: '1.4' }}>
                                {item.text}
                            </div>
                            {item.translation && ( <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}> {item.translation} </div> )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', marginLeft: '12px', minWidth: 'auto' }}>
                             <div style={{ backgroundColor: 'var(--neutral-layer-2)', padding: '4px 12px', borderRadius: '12px', fontSize: '14px', fontWeight: 'var(--font-weight-bold)', color: 'var(--brand-primary)', textAlign: 'center', width: '100%' }}> {item.count}x </div>
                            {confirmDeleteId === item.id ? (
                                <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--neutral-layer-card)', borderRadius: '12px', boxShadow: 'var(--elevation-4)', padding: '2px', zIndex: 10 }} onClick={e => e.stopPropagation()}>
                                    <button onClick={(e) => confirmDelete(item.id, e)} style={{ background: 'var(--system-error)', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '8px', color: 'white' }}> <Check size={14} /> </button>
                                    <button onClick={cancelDelete} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '8px', color: 'var(--text-primary)' }}> <X size={14} /> </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={(e) => handleEdit(item, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-secondary)' }} title="Edit"> <Edit2 size={16} /> </button>
                                    <button onClick={(e) => handleDeleteClick(item.id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--system-error)' }} title="Delete"> <Trash2 size={16} /> </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
             <style>{` @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } } `}</style>
        </div>
    );
};

export default AdhkarList;
