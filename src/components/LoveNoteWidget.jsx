import { useState, useEffect } from 'react';
import notes from '../loveNotes.json';

function getDayIndex() {
    return Math.floor(Date.now() / 86400000);
}

export default function LoveNoteWidget() {
    const [note, setNote] = useState('');

    useEffect(() => {
        try {
            const dayIndex = getDayIndex();
            const selectedNote = notes[dayIndex % notes.length];
            setNote(selectedNote.note);
        } catch (err) {
            console.error('Error loading love note:', err);
            setNote('You are the love of my life, Benji Darling!');
        }
    }, []);

    return (
        <div className="love-note-content">
            <p className="love-note-text">{note}</p>
        </div>
    );
}