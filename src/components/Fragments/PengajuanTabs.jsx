const PengajuanTabs = ({ tabs = [], activeValue, onChange }) => (
  <div className="flex space-x-6 border-b border-gray-100 mb-6">
    {tabs.map((tab) => (
      <button
        key={tab.value}
        type="button"
        onClick={() => onChange(tab.value)}
        className={`pb-3 text-[15px] font-medium transition-colors relative ${
          activeValue === tab.value
            ? "text-[#4773da]"
            : "text-gray-400 hover:text-gray-600"
        }`}
      >
        {tab.label}
        {activeValue === tab.value ? (
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#4773da]" />
        ) : null}
      </button>
    ))}
  </div>
);

export default PengajuanTabs;
