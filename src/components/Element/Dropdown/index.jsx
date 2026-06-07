import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

const Dropdown = React.forwardRef(
  (
    {
      className = "",
      wrapperClassName = "",
      iconClassName = "",
      useCustom = true,
      searchable,
      searchPlaceholder = "Cari opsi",
      children,
      value,
      onChange,
      disabled,
      required,
      name,
      ...props
    },
    ref,
  ) => {
    const containerRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [menuStyles, setMenuStyles] = useState(null);
    const searchInputRef = useRef(null);
    const buttonRef = useRef(null);
    const menuRef = useRef(null);

    const optionItems = useMemo(() => {
      return React.Children.toArray(children)
        .map((child) => {
          if (!React.isValidElement(child)) {
            return null;
          }

          if (child.type !== "option") {
            return null;
          }

          return {
            value: String(child.props.value ?? ""),
            label: String(child.props.children ?? ""),
            disabled: Boolean(child.props.disabled),
          };
        })
        .filter(Boolean);
    }, [children]);

    const selectedOption = optionItems.find(
      (option) => option.value === String(value ?? ""),
    );
    const displayLabel =
      selectedOption?.label ||
      optionItems.find((option) => option.value === "")?.label ||
      "Pilih";
    const isSearchEnabled =
      typeof searchable === "boolean" ? searchable : optionItems.length > 10;
    const filteredOptions = isSearchEnabled
      ? optionItems.filter((option) =>
          option.label.toLowerCase().includes(searchQuery.toLowerCase().trim()),
        )
      : optionItems;

    useEffect(() => {
      if (!isOpen) {
        setSearchQuery("");
        return undefined;
      }

      const updateMenuPosition = () => {
        if (!buttonRef.current) {
          return;
        }

        const rect = buttonRef.current.getBoundingClientRect();
        setMenuStyles({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      };

      updateMenuPosition();

      const handleClickOutside = (event) => {
        if (
          !containerRef.current?.contains(event.target) &&
          !menuRef.current?.contains(event.target)
        ) {
          setIsOpen(false);
        }
      };

      const handleEscape = (event) => {
        if (event.key === "Escape") {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      window.addEventListener("resize", updateMenuPosition);
      window.addEventListener("scroll", updateMenuPosition, true);

      if (isSearchEnabled) {
        const timer = setTimeout(() => {
          searchInputRef.current?.focus();
        }, 0);
        return () => {
          clearTimeout(timer);
          document.removeEventListener("mousedown", handleClickOutside);
          document.removeEventListener("keydown", handleEscape);
          window.removeEventListener("resize", updateMenuPosition);
          window.removeEventListener("scroll", updateMenuPosition, true);
        };
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
        window.removeEventListener("resize", updateMenuPosition);
        window.removeEventListener("scroll", updateMenuPosition, true);
      };
    }, [isOpen]);

    const handleSelect = (optionValue) => {
      if (disabled) {
        return;
      }

      onChange?.({ target: { value: optionValue, name } });
      setIsOpen(false);
    };

    if (!useCustom) {
      return (
        <div className={`relative ${wrapperClassName}`.trim()}>
          <select
            ref={ref}
            className={`w-full appearance-none px-4 py-2 pr-10 bg-white border border-gray-300 rounded-full text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4279df] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 ${className}`.trim()}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            name={name}
            {...props}
          >
            {children}
          </select>
          <span
            className={`pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-500 ${iconClassName}`.trim()}
            aria-hidden="true"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </div>
      );
    }

    return (
      <div ref={containerRef} className={`relative ${wrapperClassName}`.trim()}>
        <select
          ref={ref}
          className="absolute inset-0 h-0 w-0 opacity-0 pointer-events-none"
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          name={name}
          tabIndex={-1}
          aria-hidden="true"
          {...props}
        >
          {children}
        </select>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          disabled={disabled}
          className={`w-full text-left px-4 py-2 pr-10 bg-white border border-gray-300 rounded-full text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4279df] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 ${className}`.trim()}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          {displayLabel}
        </button>
        <span
          className={`pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-500 ${iconClassName}`.trim()}
          aria-hidden="true"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        {isOpen && menuStyles
          ? createPortal(
              <div
                ref={menuRef}
                className="absolute z-1000 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white py-1 shadow-lg"
                style={menuStyles}
              >
                {isSearchEnabled ? (
                  <div className="px-3 py-2 border-b border-gray-200">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder={searchPlaceholder}
                      className="w-full rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4279df]"
                    />
                  </div>
                ) : null}
                <ul className="max-h-60 overflow-y-auto" role="listbox">
                  {filteredOptions.length === 0 ? (
                    <li className="px-4 py-2 text-sm text-gray-400">
                      Tidak ada opsi
                    </li>
                  ) : (
                    filteredOptions.map((option) => (
                      <li
                        key={option.value}
                        role="option"
                        aria-selected={value === option.value}
                      >
                        <button
                          type="button"
                          onClick={() => handleSelect(option.value)}
                          disabled={option.disabled}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                            option.disabled
                              ? "text-gray-300 cursor-not-allowed"
                              : value === option.value
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {option.label}
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>,
              document.body,
            )
          : null}
      </div>
    );
  },
);

Dropdown.displayName = "Dropdown";

export default Dropdown;
