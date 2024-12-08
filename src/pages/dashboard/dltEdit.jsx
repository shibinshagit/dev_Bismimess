import React, { useState, useEffect } from "react";
import axios from "axios";
import { BaseUrl } from "@/constants/BaseUrl";
const TODAY = new Date().toISOString().split("T")[0];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Notify = () => {
  const [notes, setNotes] = useState([]);
  const [showExpired, setShowExpired] = useState(false); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // State for Add Note Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNoteData, setNewNoteData] = useState({
    toWhom: "",
    matter: "",
    date: TODAY,
    markAsRead: false
  });

  const fetchNotes = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${BaseUrl}/api/notes`);
      setNotes(res.data);
    } catch (err) {
      console.error("Error fetching notes:", err);
      setError("Failed to fetch notes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleMarkAsRead = async (id, currentNote) => {
    try {
      const updated = { ...currentNote, markAsRead: true };
      await axios.put(`${BaseUrl}/api/notes/${id}`, updated);
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note._id === id ? { ...note, markAsRead: true } : note
        )
      );
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  // Filter notes based on whether we are showing expired or today's
  const filteredNotes = notes.filter(note => {
    if (showExpired) {
      // expired means note.date < TODAY
      return note.date < TODAY;
    } else {
      // show today's notes only
      return note.date === TODAY;
    }
  });

  const openAddNoteModal = () => {
    setNewNoteData({
      toWhom: "",
      matter: "",
      date: TODAY,
      markAsRead: false
    });
    setShowAddModal(true);
  };

  const closeAddNoteModal = () => {
    setShowAddModal(false);
  };

  const handleNewNoteChange = (e) => {
    const { name, value } = e.target;
    setNewNoteData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BaseUrl}/api/notes`, newNoteData);
      await fetchNotes(); // Refresh the list
      closeAddNoteModal();
    } catch (err) {
      console.error("Error adding note:", err);
      alert("Failed to add note. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-800">
          {showExpired ? "Expired Notifications" : "Today's Notifications"}
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={openAddNoteModal}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded shadow-sm text-sm"
          >
            Add Note
          </button>
          <button
            onClick={() => setShowExpired(!showExpired)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded shadow-sm text-sm"
          >
            {showExpired ? "Show Today's" : "Show Expired"}
          </button>
        </div>
      </header>

      {/* Loading and error states */}
      {loading && <p className="text-gray-600">Loading notes...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* No notes message */}
      {!loading && !filteredNotes.length && (
        <div className="text-center mt-10 text-gray-600">
          {showExpired
            ? "No expired notifications found."
            : "No notifications for today."}
        </div>
      )}

      {/* Notes list */}
      <div className="space-y-4">
        {filteredNotes.map((note) => {
          const isUnread = !note.markAsRead;
          return (
            <div
              key={note._id}
              className={classNames(
                "rounded-md p-4 bg-white shadow-sm border",
                isUnread ? "border-blue-300" : "border-gray-300"
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={classNames(
                        "text-sm font-medium",
                        isUnread ? "text-gray-800 font-semibold" : "text-gray-600"
                      )}
                    >
                      To: {note.toWhom}
                    </span>
                    {!note.markAsRead && (
                      <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                        Unread
                      </span>
                    )}
                  </div>
                  <p
                    className={classNames(
                      "mt-1 text-sm",
                      isUnread ? "text-gray-900 font-medium" : "text-gray-700"
                    )}
                  >
                    {note.matter}
                  </p>
                </div>
                {/* Mark as read button if unread */}
                {isUnread && (
                  <button
                    onClick={() => handleMarkAsRead(note._id, note)}
                    className="ml-4 inline-flex items-center text-sm font-medium text-blue-600 hover:underline"
                  >
                    Mark as read
                  </button>
                )}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Date: {note.date}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded shadow-lg w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Add Note</h2>
            <form onSubmit={handleAddNote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">To Whom</label>
                <input
                  type="text"
                  name="toWhom"
                  value={newNoteData.toWhom}
                  onChange={handleNewNoteChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Matter</label>
                <textarea
                  name="matter"
                  value={newNoteData.matter}
                  onChange={handleNewNoteChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  name="date"
                  value={newNoteData.date}
                  onChange={handleNewNoteChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={closeAddNoteModal}
                  className="px-3 py-1.5 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notify;
