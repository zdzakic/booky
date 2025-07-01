export default function LanguageSwitcher({ lang, setLang }) {
  return (
    <div className="flex">
      <button
        className={`px-2 py-0.5 text-xs rounded-l ${lang === 'de' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-900'} transition`}
        onClick={() => setLang('de')}
        type="button"
      >
        DE
      </button>
      <button
        className={`px-2 py-0.5 text-xs rounded-r ${lang === 'en' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-900'} transition`}
        onClick={() => setLang('en')}
        type="button"
      >
        EN
      </button>
    </div>
  );
}
