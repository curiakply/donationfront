import React, { createContext, useContext, useState } from "react";

const FinancialYearContext = createContext();

const MIN_YEAR = 2003;
const MAX_YEAR = 2030;

export const FinancialYearProvider = ({ children }) => {
  // Initialize with current financial year based on April-March cycle
  const [selectedYear1, setselectedYear1] = useState(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();
    // If current month is January to March, use previous year
    return currentMonth <= 3 ? currentYear - 1 : currentYear;
  });

  const updateYear = (newYear) => {
    const yearNumber = parseInt(newYear, 10);
    if (!isNaN(yearNumber) && yearNumber >= MIN_YEAR && yearNumber <= MAX_YEAR) {
      setselectedYear1(yearNumber);
    }
  };

  // Get formatted financial year (e.g., "2024-25")
  const getFormattedYear = () => {
    return `${selectedYear1}-${(selectedYear1 + 1).toString().slice(-2)}`;
  };

  // Get financial year dates
  const getFinancialYearDates = () => ({
    startDate: new Date(selectedYear1, 3, 1), // April 1st
    endDate: new Date(selectedYear1 + 1, 2, 31) // March 31st
  });

  // Enhanced value object with formatted year and dates
  const value = {
    selectedYear1,
    updateYear,
    formattedYear: getFormattedYear(),
    ...getFinancialYearDates()
  };

  return (
    <FinancialYearContext.Provider value={value}>
      {children}
    </FinancialYearContext.Provider>
  );
};

export const useFinancialYear = () => {
  const context = useContext(FinancialYearContext);
  if (!context) {
    throw new Error('useFinancialYear must be used within a FinancialYearProvider');
  }
  return context;
};