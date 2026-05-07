import { createContext, useContext, useState } from "react";
import { en } from "../locales/en";
import { es } from "../locales/es";

const translations = { en, es };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(
        () => localStorage.getItem("pomify_lang") || "en"
    );

    const t = (key) => {
        const keys = key.split(".");
        let result = translations[language];
        for (const k of keys) {
            result = result?.[k];
            if (result === undefined) return key;
        }
        return result;
    };

    const changeLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem("pomify_lang", lang);
    };

    return (
        <LanguageContext.Provider value={{ language, t, changeLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export default function useLanguage() {
    return useContext(LanguageContext);
}
