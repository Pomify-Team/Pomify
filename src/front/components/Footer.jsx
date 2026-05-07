import "../styles/footer.css";
import useLanguage from "../context/LanguageContext";

export const Footer = () => {
    const { t } = useLanguage();
    return (
        <footer className="pomify-footer">
            <div className="pomify-footer__inner">
                <span className="pomify-footer__brand">{t("footer.team")}</span>
                <span className="pomify-footer__copy">{t("footer.copyright")}</span>
            </div>
        </footer>
    );
};
