import Dropdown from "../Element/Dropdown";

const FILTER_SELECT_CLASS =
  "w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-500";

const FilterSelect = ({
  label,
  value,
  onChange,
  placeholder,
  options = [],
  disabled = false,
}) => (
  <div>
    <label className="block text-sm text-gray-500 mb-2">{label}</label>
    <Dropdown
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={FILTER_SELECT_CLASS}
      disabled={disabled}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.id ?? option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Dropdown>
  </div>
);

export default FilterSelect;
