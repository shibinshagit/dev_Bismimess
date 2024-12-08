import React, { useState, useEffect } from "react";
import axios from "axios";
import { BaseUrl } from "@/constants/BaseUrl";
import io from 'socket.io-client';

const socket = io(BaseUrl);
const TODAY = new Date().toISOString().split("T")[0];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Notify = () => {
  const [notes, setNotes] = useState([]);
  const [showRead, setShowRead] = useState(false); // Toggle for showing read notifications
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
     // Listen for the 'newNote' event and fetch notes when a new note is added
     socket.on('newNote', () => {
      fetchNotes();
    });

    // Cleanup the socket connection when the component unmounts
    return () => {
      socket.off('newNote');
    };
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

  const handleDeleteNote = async (id) => {
    try {
      await axios.delete(`${BaseUrl}/api/notes/${id}`);
      setNotes((prevNotes) => prevNotes.filter((note) => note._id !== id));
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  // Filter notes based on whether we are showing read/unread
  const filteredNotes = notes.filter((note) => {
    if (showRead) {
      return note.markAsRead; // Show all read notes
    } else {
      return note.date === TODAY && !note.markAsRead; // Unread notes for today
    }
  });

  const expiredReadNotes = notes.filter((note) => note.date < TODAY );

  return (
    <div className="min-h-screen bg-gray-200 p-2">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-800">
          {showRead ? "" : ""}
        </h1>
        <button
          onClick={() => setShowRead(!showRead)}
          className="text-md font-semibold text-gray-800 pr-2"
        >
          {showRead ? "Back" : "show readed"}
        </button>
      </header>

      {/* Notes List */}
      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : filteredNotes.length === 0 && !showRead ? (
        <p className="text-gray-600">No unread notifications for today.</p>
      ) : (
        <div className="space-y-4">
          {filteredNotes.map((note) => (
  <div
    key={note._id}
    className={classNames(
      "rounded-md p-4 bg-white shadow-sm border",
      !showRead ? "border-blue-300" : "border-teal-900",
    )}
  >
    <div className="flex items-start justify-between">
      <div>
        <div className="flex items-center space-x-2">
          <span
            className={classNames(
              "text-sm font-medium",
              !showRead ? "text-gray-800 font-semibold" : "text-gray-600"
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
            !showRead ? "text-gray-900 font-medium" : "text-gray-700"
          )}
        >
          {note.matter}
        </p>
      </div>
      {!showRead && (
        <button
          onClick={() => handleMarkAsRead(note._id, note)}
          className="ml-4 inline-flex items-center text-sm font-medium text-blue-600 hover:underline"
        >
          Mark as Read
        </button>
      )}
    </div>
    <div className="mt-2 text-xs text-gray-500">
      Date: {note.date}
    </div>
  </div>
))}


          {showRead && expiredReadNotes.length > 0 && (
            <div>
              <h2 className="flex text-lg font-semibold items-center justify-center text-gray-800 mb-2">old tasks</h2>
              {expiredReadNotes.map((note) => (
  <div
    key={note._id}
    className="rounded-md p-4 bg-gray-500 shadow-sm border border-gray-300"
  >
    <div className="flex items-start justify-between">
      <div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-800">
            To: {note.toWhom}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-700">{note.matter}</p>
      </div>
      <button
        onClick={() => handleDeleteNote(note._id)}
        className="ml-4 inline-flex items-center text-sm font-medium text-red-600 hover:underline"
      >
        Delete
      </button>
    </div>
    <div className="mt-2 text-xs text-gray-500">Date: {note.date}</div>
  </div>
))}

            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notify;
