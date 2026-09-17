import React, { useState } from "react";

// Modal Component for Total Amount Allocation
const TotalAmountModal = ({ isOpen, onClose, totalBalance, onSave }) => {
  const [parishPercentage, setParishPercentage] = useState(0);
  const [otherProjectsPercentage, setOtherProjectsPercentage] = useState(100); // starts as 100% of the balance
  const [parishAmount, setParishAmount] = useState(0);
  const [otherProjectsAmount, setOtherProjectsAmount] = useState(totalBalance);

  // Handle percentage change for parish and recalculate amounts
  const handleParishPercentageChange = (e) => {
    const newPercentage = parseFloat(e.target.value) || 0;
    setParishPercentage(newPercentage);

   const calculatedParishAmount = ((totalBalance * newPercentage) / 100).toFixed(0);
  const calculatedOtherProjectsPercentage = (100 - newPercentage).toFixed(0);
  const calculatedOtherProjectsAmount = (totalBalance - parseFloat(calculatedParishAmount)).toFixed(0);

    setParishAmount(calculatedParishAmount);
    setOtherProjectsPercentage(calculatedOtherProjectsPercentage);
    setOtherProjectsAmount(calculatedOtherProjectsAmount);
  };

  // Handle amount change for parish and recalculate percentages
  const handleParishAmountChange = (e) => {
    const newAmount = parseFloat(e.target.value) || 0;
    setParishAmount(newAmount);

    const calculatedParishPercentage = (newAmount / totalBalance) * 100;
    const calculatedOtherProjectsAmount = totalBalance - newAmount;
    const calculatedOtherProjectsPercentage = 100 - calculatedParishPercentage;

    setParishPercentage(calculatedParishPercentage);
    setOtherProjectsPercentage(calculatedOtherProjectsPercentage);
    setOtherProjectsAmount(calculatedOtherProjectsAmount);
  };

  // Save handler
  const handleSave = () => {
    const data = {
      parishPercentage,
      parishAmount,
      otherProjectsPercentage,
      otherProjectsAmount,
    };
    onSave(data); // Save data to parent component or send to backend
    onClose(); // Close the modal after saving
  };

  if (!isOpen) return null; // Only render modal if isOpen is true

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h2 className="text-2xl font-bold mb-4">
          Edit Total Amount Allocation
        </h2>
        <div className="mb-4">
          <p className="font-semibold">Balance after Community Allocation:</p>
          <p className="text-[2rem]">{totalBalance}</p>
        </div>

        <table className="w-full mb-4">
          <tbody>
            <tr>
              <td className="p-2 font-semibold">Parish Percentage</td>
              <td>
                <input
                  type="number"
                  value={parishPercentage}
                  onChange={handleParishPercentageChange}
                  className="border p-2 w-full"
                />
              </td>
              <td>
                <input
                  type="number"
                  value={parishAmount}
                  onChange={handleParishAmountChange}
                  className="border p-2 w-full"
                />
              </td>
            </tr>
            <tr>
              <td className="p-2 font-semibold">Other Projects Percentage</td>
              <td>
                <input
                  type="number"
                  value={otherProjectsPercentage}
                  readOnly
                  className="border p-2 w-full bg-gray-100"
                />
              </td>
              <td>
                <input
                  type="number"
                  value={otherProjectsAmount}
                  readOnly
                  className="border p-2 w-full bg-gray-100"
                />
              </td>
            </tr>
          </tbody>
        </table>

        <button
          onClick={handleSave}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Save
        </button>
        <button
          onClick={onClose}
          className="bg-gray-300 text-black px-4 py-2 rounded-lg ml-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TotalAmountModal;
