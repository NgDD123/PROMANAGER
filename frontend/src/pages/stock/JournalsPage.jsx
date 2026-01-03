import React, { useState } from "react";
import { useJournal } from "../../context/JournalContext";
import { useStock } from "../../context/stockContext";
import JournalForm from "../../components/stock/JournalForm";
import JournalTable from "../../components/stock/JournalTable";

export default function JournalsPage() {
  const { journalEntries, addJournalEntry, removeJournalEntry, loading } = useJournal();
  const { accountSettings } = useStock();
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);

  const handleAddClick = () => {
    setEditData(null);
    setShowForm(true);
  };

  const handleEditClick = (entry) => {
    setEditData(entry);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this journal entry?")) {
      await removeJournalEntry(id);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 p-4">
      {/* Main content / journal table */}
      <div className="flex-1 mx-4">
        <JournalTable 
          data={journalEntries} 
          onDelete={handleDelete}
          onAdd={handleAddClick}
        />
      </div>

      {/* Journal form - right side */}
      {showForm && (
        <div className="w-2/6 relative">
          <JournalForm 
            initialData={editData} 
            onCancel={() => setShowForm(false)} 
          />
        </div>
      )}
    </div>
  );
}
