import React, { useState, useRef, useEffect } from 'react';
import './DatePicker.css';

interface DatePickerProps {
  label?: string;
  value: string; // Expected format: DD/MM/YYYY
  onChange: (value: string) => void;
  required?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({ label, value, onChange, required }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [activeDropdown, setActiveDropdown] = useState<'month' | 'year' | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const monthDropdownRef = useRef<HTMLDivElement>(null);
  const yearDropdownRef = useRef<HTMLDivElement>(null);

  // Validate the date string
  const validateDate = (dateStr: string) => {
    if (!dateStr || dateStr.length < 10) {
      setError(null);
      return;
    }

    const [d, m, y] = dateStr.split('/').map(Number);
    const date = new Date(y, m - 1, d);
    const today = new Date();

    // 1. Check if date exists (e.g. Feb 30)
    if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
      setError('Please enter a valid date');
      return;
    }

    // 2. Future date check
    if (date > today) {
      setError('Date cannot be in the future');
      return;
    }

    // 3. Reasonable age range (Talentron specific: 7 - 100 years)
    const age = today.getFullYear() - y;
    if (age < 7) {
      setError('You must be at least 7 years old');
      return;
    }
    if (age > 100) {
      setError('Please enter a valid year');
      return;
    }

    setError(null);
  };

  useEffect(() => {
    validateDate(value);
  }, [value]);

  // Close everything on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If clicking outside the entire component, close the calendar
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveDropdown(null);
        return;
      }

      // If clicking inside the component but outside an active sub-dropdown trigger/menu
      if (activeDropdown === 'month' && monthDropdownRef.current && !monthDropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
      if (activeDropdown === 'year' && yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  // Format input value (Masking: DD/MM/YYYY)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, ''); // Only digits
    if (input.length > 8) input = input.substring(0, 8);

    // Basic range capping while typing
    if (input.length >= 2) {
      let dd = parseInt(input.substring(0, 2));
      if (dd > 31) input = '31' + input.substring(2);
      if (dd === 0 && input.length === 2) input = '01';
    }
    if (input.length >= 4) {
      let mm = parseInt(input.substring(2, 4));
      if (mm > 12) input = input.substring(0, 2) + '12' + input.substring(4);
      if (mm === 0 && input.length === 4) input = input.substring(0, 2) + '01';
    }

    let formatted = '';
    if (input.length > 0) {
      formatted = input.substring(0, 2);
      if (input.length > 2) {
        formatted += '/' + input.substring(2, 4);
        if (input.length > 4) {
          formatted += '/' + input.substring(4, 8);
        }
      }
    }
    onChange(formatted);

    // Try to update calendar view if a valid year is typed
    if (formatted.length === 10) {
      const parts = formatted.split('/').map(Number);
      const date = new Date(parts[2], parts[1] - 1, parts[0]);
      if (!isNaN(date.getTime()) && parts[2] > 1900 && parts[2] < 2100) {
        setViewDate(date);
      }
    }
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = [];
  const currentYearInt = new Date().getFullYear();
  for (let i = currentYearInt; i >= 1950; i--) {
    years.push(i);
  }

  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (day: number) => {
    const d = String(day).padStart(2, '0');
    const m = String(viewDate.getMonth() + 1).padStart(2, '0');
    const y = viewDate.getFullYear();
    onChange(`${d}/${m}/${y}`);
    setIsOpen(false);
  };

  const handleMonthSelect = (mIndex: number) => {
    setViewDate(new Date(viewDate.getFullYear(), mIndex, 1));
    setActiveDropdown(null);
  };

  const handleYearSelect = (year: number) => {
    setViewDate(new Date(year, viewDate.getMonth(), 1));
    setActiveDropdown(null);
  };

  const renderDays = () => {
    const totalDays = daysInMonth(viewDate.getMonth(), viewDate.getFullYear());
    const firstDay = firstDayOfMonth(viewDate.getMonth(), viewDate.getFullYear());
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    const currentSelected = value.split('/').map(Number);
    const isSelected = (day: number) => 
      currentSelected[0] === day && 
      currentSelected[1] === (viewDate.getMonth() + 1) && 
      currentSelected[2] === viewDate.getFullYear();

    const today = new Date();
    const isToday = (day: number) =>
      today.getDate() === day &&
      today.getMonth() === viewDate.getMonth() &&
      today.getFullYear() === viewDate.getFullYear();

    for (let d = 1; d <= totalDays; d++) {
      days.push(
        <div 
          key={d} 
          className={`calendar-day ${isSelected(d) ? 'selected' : ''} ${isToday(d) ? 'today' : ''}`}
          onClick={() => handleDateSelect(d)}
        >
          {d}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="custom-date-picker" ref={containerRef}>
      {label && <label>{label}</label>}
      <div className={`date-input-wrapper ${error ? 'has-error' : ''}`}>
        <input 
          type="text" 
          value={value} 
          onChange={handleInputChange}
          placeholder="DD/MM/YYYY"
          maxLength={10}
          required={required}
          onClick={() => setIsOpen(!isOpen)}
          autoComplete="off"
        />
        <svg 
          className="calendar-icon" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>

        {isOpen && (
          <div className="calendar-dropdown">
            <div className="calendar-header">
              <button type="button" className="nav-btn" onClick={handlePrevMonth}>&lt;</button>
              
              <div className="header-selectors">
                {/* Month Dropdown */}
                <div className="selector-container" ref={monthDropdownRef}>
                  <div 
                    className={`selector-trigger ${activeDropdown === 'month' ? 'active' : ''}`}
                    onClick={() => setActiveDropdown(activeDropdown === 'month' ? null : 'month')}
                  >
                    {months[viewDate.getMonth()]} ▾
                  </div>
                  {activeDropdown === 'month' && (
                    <div className="selector-menu month-menu">
                      {months.map((m, i) => (
                        <div 
                          key={m} 
                          className={`selector-item ${viewDate.getMonth() === i ? 'selected' : ''}`}
                          onClick={() => handleMonthSelect(i)}
                        >
                          {m}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Year Dropdown */}
                <div className="selector-container" ref={yearDropdownRef}>
                  <div 
                    className={`selector-trigger ${activeDropdown === 'year' ? 'active' : ''}`}
                    onClick={() => setActiveDropdown(activeDropdown === 'year' ? null : 'year')}
                  >
                    {viewDate.getFullYear()} ▾
                  </div>
                  {activeDropdown === 'year' && (
                    <div className="selector-menu year-menu">
                      {years.map(y => (
                        <div 
                          key={y} 
                          className={`selector-item ${viewDate.getFullYear() === y ? 'selected' : ''}`}
                          onClick={() => handleYearSelect(y)}
                        >
                          {y}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button type="button" className="nav-btn" onClick={handleNextMonth}>&gt;</button>
            </div>

            <div className="calendar-grid">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="weekday">{day}</div>
              ))}
              {renderDays()}
            </div>
          </div>
        )}
      </div>
      {error && <span className="date-error-message">{error}</span>}
    </div>
  );
};

export default DatePicker;
