/**
 * I18n Manager
 * Manages language settings, translations, and RTL/LTR switching.
 */
(function() {
    'use strict';

    const I18n = {
        _currentLang: localStorage.getItem('language') || 'ar',
        _translations: {},
        _listeners: [],

        init() {
            this.applyLanguage(this._currentLang);
            // Expose globally
            window.I18n = this;
            // Dispatch event for other modules
            this._dispatchLanguageChanged();
            
            console.log('✅ I18n Manager initialized:', this._currentLang);
        },

        get currentLang() {
            return this._currentLang;
        },

        get isRTL() {
            return this._currentLang === 'ar';
        },

        setLanguage(lang) {
            if (lang !== 'ar' && lang !== 'en') return;
            this._currentLang = lang;
            localStorage.setItem('language', lang);
            this.applyLanguage(lang);
            this._dispatchLanguageChanged();
        },

        applyLanguage(lang) {
            const isRTL = lang === 'ar';
            document.documentElement.setAttribute('lang', lang);
            document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
            document.body.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
            
            // Update CSS classes for direction
            if (isRTL) {
                document.documentElement.classList.add('rtl');
                document.documentElement.classList.remove('ltr');
            } else {
                document.documentElement.classList.add('ltr');
                document.documentElement.classList.remove('rtl');
            }
        },

        /**
         * Get translation for a key
         * @param {string} key - Translation key (e.g., 'btn.save')
         * @param {string} defaultText - Fallback text
         */
        t(key, defaultText) {
            // Check registered translations
            return this._translations[this._currentLang]?.[key] || defaultText || key;
        },
        
        /**
         * Register translations for a module
         * @param {string} lang - 'ar' or 'en'
         * @param {object} translations - Key-value pairs
         */
        register(lang, translations) {
            if (!this._translations[lang]) {
                this._translations[lang] = {};
            }
            Object.assign(this._translations[lang], translations);
        },

        _dispatchLanguageChanged() {
            const event = new CustomEvent('languageChanged', {
                detail: { 
                    language: this._currentLang,
                    isRTL: this.isRTL 
                }
            });
            window.dispatchEvent(event);
        }
    };

    // Initialize immediately
    I18n.init();

})();
