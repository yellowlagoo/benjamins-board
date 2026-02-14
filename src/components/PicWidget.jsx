import { useState, useEffect } from 'react';
import captions from '../captions.json';

const imageModules = import.meta.glob('../assets/processed/*.jpg', { eager: true });

function getDayIndex() {
    return Math.floor(Date.now() / 86400000);
}

export default function useDailyPic() {
    const [photo, setPhoto] = useState(null);
    const [caption, setCaption] = useState('');

    useEffect(() => {
        try {
            const dayIndex = getDayIndex();
            const entry = captions[dayIndex % captions.length];
            setCaption(entry.caption);

            const filename = entry.image.split('/').pop();
            const globKey = `../assets/processed/${filename}`;
            const mod = imageModules[globKey];
            if (mod) {
                setPhoto(mod.default);
            }
        } catch (err) {
            console.error('Error loading daily photo:', err);
        }
    }, []);

    return { photo, caption };
}
