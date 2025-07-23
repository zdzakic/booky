export default function LanguageSwitcher({ lang, setLang }) {
  return (
    <div className="flex">
      <button
        className={`px-2 py-0.5 text-xs rounded-l ${lang === 'de' ? 'bg-primary text-white'  : 'bg-neutral-light text-neutral-dark'} transition`}
        onClick={() => setLang('de')}
        type="button"
      >
        DE
      </button>
      <button
        className={`px-2 py-0.5 text-xs rounded-r ${lang === 'en' ? 'bg-primary text-white' : 'bg-neutral-light text-neutral-dark'} transition`}
        onClick={() => setLang('en')}
        type="button"
      >
        EN
      </button>
    </div>
  );
}
