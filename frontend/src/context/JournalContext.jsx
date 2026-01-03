import React, { createContext, useContext, useState, useEffect } from "react";
import { journalService } from "../services/stock.service";

const JournalContext = createContext();

export const JournalProvider = ({ children }) => {
  const [journalEntries, setJournalEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all journal entries on mount
  useEffect(() => {
    const loadJournalEntries = async () => {
      setLoading(true);
      try {
        const entries = await journalService.getAll();
        setJournalEntries(entries);
      } catch (err) {
        console.error("Error loading journal entries:", err);
      } finally {
        setLoading(false);
      }
    };

    loadJournalEntries();
  }, []);

  // ================================
  // CRUD operations
  // ================================
  const addJournalEntry = async (data) => {
    const created = await journalService.create(data);
    setJournalEntries(prev => [created, ...prev]);
    return created;
  };

  const removeJournalEntry = async (id) => {
    await journalService.remove(id);
    setJournalEntries(prev => prev.filter(j => j.id !== id));
  };

  const refreshJournalEntries = async () => {
    setLoading(true);
    try {
      const entries = await journalService.getAll();
      setJournalEntries(entries);
    } catch (err) {
      console.error("Error refreshing journal entries:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <JournalContext.Provider
      value={{
        journalEntries,
        loading,
        addJournalEntry,
        removeJournalEntry,
        refreshJournalEntries
      }}
    >
      {children}
    </JournalContext.Provider>
  );
};

export const useJournal = () => useContext(JournalContext);
