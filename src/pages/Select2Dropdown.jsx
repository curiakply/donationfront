import React, { useState, useRef, useEffect } from 'react';

const Select2Dropdown = ({ 
  parishes = [], 
  koottaymas = [], 
  selectedParish,
  selectedKoottayma,
  onParishChange,
  onKoottaymaChange
}) => {
  const [parishOpen, setParishOpen] = useState(false);
  const [koottaymaOpen, setKoottaymaOpen] = useState(false);
  const [parishSearch, setParishSearch] = useState('');
  const [koottaymaSearch, setKoottaymaSearch] = useState('');
  const parishRef = useRef(null);
  const koottaymaRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (parishRef.current && !parishRef.current.contains(event.target)) {
        setParishOpen(false);
      }
      if (koottaymaRef.current && !koottaymaRef.current.contains(event.target)) {
        setKoottaymaOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredParishes = parishes.filter(parish =>
    parish.name.toLowerCase().includes(parishSearch.toLowerCase())
  );

  const filteredKoottaymas = koottaymas.filter(koottayma =>
    koottayma.name.toLowerCase().includes(koottaymaSearch.toLowerCase())
  );

  const getSelectedParishName = () => {
    const parish = parishes.find(p => p._id === selectedParish);
    return parish ? parish.name : '';
  };

  const getSelectedKoottaymaName = () => {
    const koottayma = koottaymas.find(k => k.koottaymaId === selectedKoottayma);
    return koottayma ? koottayma.name : '';
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Parish Dropdown */}
      <div className="relative" ref={parishRef}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Church
        </label>
        <div
          className={`select2-selection select2-selection--single ${
            parishOpen ? 'select2-container--open' : ''
          } ${
            selectedParish ? 'select2-container--below' : ''
          }`}
          onClick={() => setParishOpen(!parishOpen)}
        >
          <span className="select2-selection__rendered">
            {getSelectedParishName() || 'Select Church'}
          </span>
          <span className="select2-selection__arrow">
            <b role="presentation"></b>
          </span>
        </div>

        {parishOpen && (
          <div className="select2-dropdown select2-dropdown--below">
            <div className="select2-search select2-search--dropdown">
              <input
                type="search"
                className="select2-search__field"
                placeholder="Search Church..."
                value={parishSearch}
                onChange={(e) => setParishSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="select2-results">
              <ul className="select2-results__options" role="listbox">
                {filteredParishes.map((parish) => (
                  <li
                    key={parish._id}
                    className={`select2-results__option ${
                      selectedParish === parish._id
                        ? 'select2-results__option--highlighted'
                        : ''
                    }`}
                    role="option"
                    onClick={() => {
                      onParishChange(parish._id);
                      setParishOpen(false);
                      setParishSearch('');
                    }}
                  >
                    {parish.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Koottayma Dropdown */}
      <div className="relative" ref={koottaymaRef}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Kootayma
        </label>
        <div
          className={`select2-selection select2-selection--single ${
            !selectedParish ? 'select2-container--disabled' : ''
          } ${koottaymaOpen ? 'select2-container--open' : ''} ${
            selectedKoottayma ? 'select2-container--below' : ''
          }`}
          onClick={() => selectedParish && setKoottaymaOpen(!koottaymaOpen)}
        >
          <span className="select2-selection__rendered">
            {getSelectedKoottaymaName() || 'Select Kootayma'}
          </span>
          <span className="select2-selection__arrow">
            <b role="presentation"></b>
          </span>
        </div>

        {koottaymaOpen && selectedParish && (
          <div className="select2-dropdown select2-dropdown--below">
            <div className="select2-search select2-search--dropdown">
              <input
                type="search"
                className="select2-search__field"
                placeholder="Search Kootayma..."
                value={koottaymaSearch}
                onChange={(e) => setKoottaymaSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="select2-results">
              <ul className="select2-results__options" role="listbox">
                {filteredKoottaymas.map((koottayma) => (
                  <li
                    key={koottayma.koottaymaId}
                    className={`select2-results__option ${
                      selectedKoottayma === koottayma.koottaymaId
                        ? 'select2-results__option--highlighted'
                        : ''
                    }`}
                    role="option"
                    onClick={() => {
                      onKoottaymaChange(koottayma.koottaymaId);
                      setKoottaymaOpen(false);
                      setKoottaymaSearch('');
                    }}
                  >
                    {koottayma.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .select2-container {
          box-sizing: border-box;
          display: inline-block;
          margin: 0;
          position: relative;
          vertical-align: middle;
          width: 100%;
        }

        .select2-selection {
          background-color: #fff;
          border: 1px solid #aaa;
          border-radius: 4px;
          cursor: pointer;
          height: 38px;
          outline: 0;
          padding: 0.375rem 0.75rem;
          position: relative;
          user-select: none;
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }

        .select2-selection:hover {
          border-color: #80bdff;
        }

        .select2-container--open .select2-selection {
          border-color: #80bdff;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }

        .select2-selection__rendered {
          color: #444;
          line-height: 28px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding-right: 20px;
        }

        .select2-container--disabled .select2-selection {
          background-color: #e9ecef;
          cursor: not-allowed;
          opacity: 0.65;
        }

        .select2-selection__arrow {
          height: 26px;
          position: absolute;
          top: 6px;
          right: 1px;
          width: 20px;
        }

        .select2-selection__arrow b {
          border-color: #888 transparent transparent transparent;
          border-style: solid;
          border-width: 5px 4px 0 4px;
          height: 0;
          left: 50%;
          margin-left: -4px;
          margin-top: -2px;
          position: absolute;
          top: 50%;
          width: 0;
        }

        .select2-container--open .select2-selection__arrow b {
          border-color: transparent transparent #888 transparent;
          border-width: 0 4px 5px 4px;
        }

        .select2-dropdown {
          background-color: white;
          border: 1px solid #80bdff;
          border-radius: 4px;
          box-sizing: border-box;
          display: block;
          position: absolute;
          left: 0;
          top: 100%;
          width: 100%;
          z-index: 1051;
          margin-top: 4px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.15);
        }

        .select2-search--dropdown {
          display: block;
          padding: 8px;
        }

        .select2-search__field {
          width: 100%;
          padding: 6px 8px;
          box-sizing: border-box;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .select2-search__field:focus {
          outline: none;
          border-color: #80bdff;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }

        .select2-results {
          display: block;
        }

        .select2-results__options {
          list-style: none;
          margin: 0;
          padding: 0;
          max-height: 200px;
          overflow-y: auto;
        }

        .select2-results__option {
          padding: 8px 12px;
          user-select: none;
          transition: all 0.15s ease;
        }

        .select2-results__option:hover {
          background-color: #f8f9fa;
        }

        .select2-results__option--highlighted {
          background-color: #007bff;
          color: white;
        }

        .select2-results__option--highlighted:hover {
          background-color: #0056b3;
        }
      `}</style>
    </div>
  );
};

export default Select2Dropdown;