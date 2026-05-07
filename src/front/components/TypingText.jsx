import { useEffect, useState } from "react";
import useLanguage from "../context/LanguageContext";

export const TypingText = () => {
    const { t } = useLanguage();
    const phrases = t("welcome.typingPhrases");
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [displayed, setDisplayed] = useState("");
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        setDisplayed("");
        setCharIndex(0);
        setDeleting(false);
    }, [phraseIndex, phrases[0]]);

    useEffect(() => {
        const current = phrases[phraseIndex];
        const speed = deleting ? 50 : 30;

        const timeout = setTimeout(() => {
            if (!deleting && charIndex < current.length) {
                setDisplayed(current.slice(0, charIndex + 1));
                setCharIndex(charIndex + 1);
            } else if (!deleting && charIndex === current.length) {
                setTimeout(() => setDeleting(true), 1500);
            } else if (deleting && charIndex > 0) {
                setDisplayed(current.slice(0, charIndex - 1));
                setCharIndex(charIndex - 1);
            } else if (deleting && charIndex === 0) {
                setDeleting(false);
                setPhraseIndex((phraseIndex + 1) % phrases.length);
            }
        }, speed);

        return () => clearTimeout(timeout);
    }, [charIndex, deleting, phraseIndex, phrases]);

    return (
        <span>
            {displayed}
            <span className="typing-cursor">|</span>
        </span>
    );
};
