import React, { useState } from 'react';
import FilingForm from './components/FilingForm';
import FilingList from './components/FilingList';
import './App.css';

function App() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [editingFiling, setEditingFiling] = useState(null);

    const handleFilingSaved = () => {
        setRefreshTrigger(refreshTrigger + 1);
        setEditingFiling(null);
    };

    const handleEditClick = (filing) => {
        setEditingFiling(filing);
    };

    const handleCancelEdit = () => {
        setEditingFiling(null);
    };

    return (
        <>
            <header className="app-header">
                <div className="app-header-inner">
                    <p className="eyebrow">Neximprove · Customs Operations</p>
                    <h1>Filing Request Submission Module</h1>
                    <p>Submit and track customs filings for shipments</p>
                </div>
            </header>

            <div className="page">
                <FilingForm
                    onFilingSaved={handleFilingSaved}
                    editingFiling={editingFiling}
                    onCancelEdit={handleCancelEdit}
                />
                <FilingList refreshTrigger={refreshTrigger} onEditClick={handleEditClick} />
            </div>
        </>
    );
}

export default App;