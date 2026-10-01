import { LANGUAGES } from '../../utils/languages';

export default function LanguageSelect({ value, onChange, label, disabled = false }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="input text-sm font-medium"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
