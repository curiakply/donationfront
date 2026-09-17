/* eslint-disable no-useless-escape */
import React, { useState, useEffect, useRef } from "react";
import { Table, Button, Input, Modal, Form, message, Space, Select as AntSelect } from "antd";
import ApexCharts from 'react-apexcharts';
// Register the necessary chart components
import FamilyChart from "../components/chart/familychart.js";
import "../assets/styles/ff.css";


import Select from 'react-select';
import "../assets/styles/responsive.css";
import "../assets/styles/Forane.css";
import axiosInstance from "../axiosConfig"; // Adjust the import path as needed
import malaylamText from "../assets/malayalamText";
import { IoMdArrowBack } from "react-icons/io";
import { MdLocalPrintshop } from "react-icons/md";
import { FaFilePdf } from "react-icons/fa";
import logo from "../assets/cropped-eparchy_klpyEBM.png";
import html2pdf from "html2pdf.js";

const FamilyManagement = () => {
  const [form] = Form.useForm();
  const [familyHead, setFamilyHead] = useState("");
  const [foranes, setForanes] = useState([]);
  const [parishes, setParishes] = useState([]);
  const [koottaymas, setKoottaymas] = useState([]);
  const [families, setFamilies] = useState([]);
  const [persons, setPersons] = useState([]);
  const [selectedForane, setSelectedForane] = useState("");
  const [selectedParish, setSelectedParish] = useState("");
  const [selectedKoottayma, setSelectedKoottayma] = useState("");
  const [selectedFamily, setSelectedFamily] = useState("");
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchID, setSearchID] = useState("");
  const [displayRes, setDisplayRes] = useState(null);
  const [isTransaction, setIsTransaction] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [currentTransactions, setCurrentTransactions] = useState([
    { amountPaid: 0 },
  ]);
  const [dropdown, setDropdown] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveButton, setSaveButton] = useState(false);
  const [transactionData, setTransactionData] = useState({
    type: "",
    amountPaid: "",
    date: "",
    description: "",
  });
  const [currentTransaction, setCurrentTransaction] = useState([]);
  const [totalTransactions, setTotalTransactions] = useState([]);
  const relationOptions = [
      
    { value: "head", label: "Head" },
    { value: "wife", label: "Wife" },
    { value: "husband", label: "Husband" },
    { value: "son", label: "Son" },
    { value: "daughter", label: "Daughter" },
    { value: "father", label: "Father" },
    { value: "mother", label: "Mother" },
    { value: "brother", label: "Brother" },
    { value: "son in law", label: "Son In Law" },
    { value: "daughter in law", label: "Daughter In Law" },
    { value: "grandson", label: "Grandson" },
    { value: "granddaughter", label: "Granddaughter" }
  ];
  const [report, setReport] = useState(false);
  const [parishName, setParishName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [kootaymaName, setKootaymaName] = useState("");
  const [familyTotal, setFamilyTotal] = useState(0);
  const [print, setPrint] = useState(false);
  useEffect(() => {
    fetchForanes();
  }, []);

  useEffect(() => {
    if (selectedForane) fetchParishes(selectedForane.value);
  }, [selectedForane]);

  useEffect(() => {
    if (selectedParish) fetchKoottaymas(selectedParish.value);
  }, [selectedParish]);

  useEffect(() => {
    if (selectedKoottayma) fetchFamilies(selectedKoottayma.value);
  }, [selectedKoottayma]);

  useEffect(() => {
    if (selectedFamily) {
      //get the previous data
      // const prev = totalPersonTransaction():
      setCurrentTransaction([]);
      setDisplayRes(true);
      fetchPersons(selectedFamily.value);
    }
  }, [selectedFamily]);

  useEffect(() => {
    if (persons.length > 0 || saved) {
      const fetchAllTransactions = async () => {
        const allTransactions = await Promise.all(
          persons.map(async (p) => {
            const totalAmount = await totalPersonTransaction(p._id);
            return totalAmount;
          })
        );
        setTransactions(allTransactions);
      };

      fetchAllTransactions();
      setSaved(false);
    }
  }, [persons, saved]);

  useEffect(() => {
    if (persons.length > 0 || saved) {
      const fetchAllCurrentTransactions = async () => {
        const allCurrentTransactions = await Promise.all(
          persons.map(async (p) => {
            const currentAmount = await currentPersonTransaction(p._id);
            return {
              amountPaid: currentAmount.amountPaid || 0,
              id: currentAmount._id,
              person: p._id,
            };
          })
        );
        
        // Ensure currentTransactions always starts with a default value
        setCurrentTransactions(
          allCurrentTransactions.length > 0 
            ? allCurrentTransactions 
            : [{ amountPaid: 0, id: null, person: null }]
        );
      };
  
      fetchAllCurrentTransactions();
    }
  }, [persons, saved]);

  useEffect(() => {
    if (formData._id) {
      fetchTransactions(formData._id);
    }
  }, [formData]);
  const fetchForanes = async () => {
    try {
      const response = await axiosInstance.get("/forane");
      setForanes(response.data);
    } catch (error) {
      console.error("Error fetching foranes:", error);
    }
  };

  const fetchParishes = async (foraneId) => {
    try {
      const response = await axiosInstance.get(`/parish/forane/${foraneId}`);
      setParishes(response.data || []);
    } catch (error) {
      console.error("Error fetching parishes:", error);
    }
  };

  const fetchKoottaymas = async (parishId) => {
    try {
      const response = await axiosInstance.get(`/koottayma/parish/${parishId}`);
      setKoottaymas(response.data || []);
    } catch (error) {
      console.error("Error fetching koottaymas:", error);
    }
  };
  const fetchFamilies = async (koottaymaId) => {
    try {
      const response = await axiosInstance.get(`/family/kottayma/${koottaymaId}`);
      const familiesWithHeads = await Promise.all(
        response.data.map(async (family) => {
          const personsResponse = await axiosInstance.get(`/person/family/${family.id}`);
          const head = personsResponse.data.find((person) => person.relation === "head");
          return {
            id: family.id,
            name: family.name,
            headName: head ? head.name : "No head assigned",
          };
        })
      );
      setFamilies(familiesWithHeads);
    } catch (error) {
      console.error("Error fetching families:", error);
    }
  };
  

  const fetchPersons = async (familyId) => {
    try {
      const response = await axiosInstance.get(`/person/family/${familyId}`);
      const formattedPersons = response.data.map((person) => ({
        ...person,
        dob: person.dob ? person.dob.split("T")[0] : null, // Format date if present
      }));
      fetchFamilyDetails(formattedPersons);
     
      setPersons(formattedPersons || []);
    } catch (error) {
      console.error("Error fetching persons:", error);
    }
  };
  const fetchTransactions = async (personId) => {
    try {
      const response = await axiosInstance.get(
        `/person/${personId}`
      );
      setTransactions(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const fetchPersonDetails = async (personId) => {
    try {
      const response = await axiosInstance.get(`/person/${personId}`);
      if (response.data.dob) {
        response.data.dob = response.data.dob.includes('T')
          ? response.data.dob.split('T')[0]
          : response.data.dob;
      }
     
      setFormData(response.data);
    } catch (error) {
      console.error("Error fetching persons:", error);
    }
  };

  const fetchFamilyDetails = async (persons) => {
    try {
      // Use Promise.all to wait for all asynchronous calls to complete
      const responses = await Promise.all(
        persons.map(async (p) => {
          const response = await axiosInstance.get(`/person/${p._id}`);
          const formattedPerson = {
            ...response.data,
            dob: response.data.dob ? response.data.dob.split("T")[0] : null, // Format dob to YYYY-MM-DD
          };
          setTotalTransactions((prevTotalTransactions) => {
            // Check if the personId already exists in the array
            const existingTransaction = prevTotalTransactions.find(
              (item) => item.id === p._id
            );

            if (existingTransaction) {
              // Update the existing transaction
              return prevTotalTransactions.map((item) =>
                item.id === p._id
                  ? { ...item, amountPaid: totalPersonTransaction(p._id) }
                  : item
              );
            } else {
              // Add a new transaction
              return [
                ...prevTotalTransactions,
                { id: p._id, amountPaid: totalPersonTransaction(p._id) },
              ];
            }
          });
          return formattedPerson; // or whatever data you want to return
        })
      );
      setPersons(responses); // This will be an array of all responses
      return responses;
    } catch (error) {
      console.error("Error fetching family details:", error);
      throw error; // Re-throw if you want it to be handled by the caller
    }
  };

  const handleSelectChange = (setter) => (e) => {
    setter(e.target.value);
  };

  const handleNewTransaction = async (current) => {
    console.log(current);
    try {
      await axiosInstance.post(`transaction/`, current);
      return true;
    } catch (error) {
      return false;
    }
  };

  const totalPersonTransaction = async (personId) => {
    try {
      const response = await axiosInstance.get(
        `transaction/person/${personId}`
      );
      if (response.data.totalAmount) {
        return response.data.totalAmount;
      } else {
        return 0;
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const currentPersonTransaction = async (personId) => {
    try {
      const response = await axiosInstance.get(`transaction/latest/person/${personId}`);
      // Ensure we always return an object with an amountPaid property
      return response.data && response.data.amountPaid !== undefined 
        ? response.data 
        : { amountPaid: 0, person: personId };
    } catch (error) {
      console.error("Error fetching latest transaction:", error);
      return { amountPaid: 0, person: personId }; // Consistent return value
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const formatDate = (dateString) => {
    const [day, month, year] = dateString.split("/");
    return `${year}-${month}-${day}`;
  };
  function formatDateSubmit(dateString) {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  }
  /*const handleEdit = (personId) => {
    const personDetails = fetchPersonDetails(personId);
    setFormData(personDetails);
    setIsEditing(!isEditing);
  };*/
  useEffect(() => {
    if (isEditing && formData._id) {
      const formattedDob = formData.dob ? new Date(formData.dob).toISOString().split('T')[0] : '';
      form.setFieldsValue({
        name: formData.name || '',
        baptismName: formData.baptismName || '',
        gender: formData.gender || '',
        dob: formattedDob,
        phone: formData.phone || '',
        relation: formData.relation || '',
        email: formData.email || '',
        education: formData.education || '',
        occupation: formData.occupation || ''
      });
    }
  }, [isEditing, formData, form]);
  const handleEdit = (personId) => {
    fetchPersonDetails(personId);
    setFormData(personId);
    setIsEditing(true);
  };

  /*const handleTransaction = async () => {
    try {
      setSaveButton(false);
  
      const promises = currentTransactions.map((p) =>
        handleNewTransaction({
          amountPaid: p.amountPaid,
          person: p.person,
          forane: selectedForane,
          family: selectedFamily,
          parish: selectedParish,
        })
      );
  
      const results = await Promise.all(promises);
      results.forEach((canAdd, index) => {
        if (typeof canAdd !== 'boolean' || !canAdd) {
          updateCurrentTransaction(currentTransactions[index]);
        }
      });
    } catch (error) {
      console.error("Error saving transactions:", error.message, error.stack);
    }
    setSaved(true);
  };*/
  // setTransactionData({
  //   person: personId,
  // });
  // setIsTransaction(!isTransaction);

  const updateCurrentTransaction = async (p) => {
    try {
      await axiosInstance.put(`transaction/${p.id}`, {
        amountPaid: p.amountPaid,
      });
    } catch (error) {
      console.log("Error updating transaction", error);
    }
  };
  const handleDelete = async (personId) => {
    if (window.confirm("Are you sure you want to delete this person?")) {
      try {
        await axiosInstance.delete(`/person/${personId}`);
        fetchPersons(selectedFamily);
      } catch (error) {
        console.error("Error deleting person:", error);
      }
    }
  };
/*
  const handleSubmit = async (e) => {
    e.preventDefault();
    formData.dob = formatDateSubmit(formData.dob);
    try {
      if (isEditing) {
        await axiosInstance.put(`/person/${formData._id}`, formData);
      } else {
        await axiosInstance.post("/person/", {
          ...formData,
          family: selectedFamily,
          forane: selectedForane,
          parish: selectedParish,
        });
      }
      fetchPersons(selectedFamily);
      resetForm();
    } catch (error) {
      console.error("Error saving person:", error);
    }
  };
*/
const handleSubmit = async (values) => {
  try {
    const dataToSubmit = {
      ...values,
      dob: formatDateSubmit(values.dob)
    };

    if (formData._id) {
      // Editing existing person
      await axiosInstance.put(`/person/${formData._id}`, dataToSubmit);
    } else {
      // Adding new person
      await axiosInstance.post("/person/", {
        ...dataToSubmit,
        family: selectedFamily,
        forane: selectedForane,
        parish: selectedParish,
      });
    }
    
    fetchPersons(selectedFamily);
    setIsEditing(false);
    setFormData({});
  } catch (error) {
    console.error("Error saving person:", error);
    message.error("Failed to save person details");
  }
};

  const resetForm = () => {
    setFormData({});
    setIsEditing(false);
  };

  const handleSearchInputChange = (e) => {
    
    setSearchID(e.target.value);
    console.log(searchID);
    if (searchID.length >4) {
      console.log(searchID);
      setSelectedFamily(searchID);
      setDisplayRes(true);
    } else {
      setDisplayRes(false);
    }
  };
/*
  const handleCurrentChange = (e, index, personId) => {
    setSaveButton(true);
    let current = parseFloat(e.target.value) || 0;
    const newValues = [...currentTransactions];
    
    if (newValues[index].amountPaid !== current) {
      newValues[index].amountPaid = current;
      setCurrentTransactions(newValues);
    }
  
    if (!isNaN(current) && current > 0) {
      setCurrentTransaction((prevTransaction) => {
        const existingTransaction = prevTransaction.find(
          (item) => item.id === personId
        );
  
        if (existingTransaction) {
          return prevTransaction.map((item) =>
            item.id === personId ? { ...item, amountPaid: current } : item
          );
        } else {
          return [...prevTransaction, { id: personId, amountPaid: current }];
        }
      });
    }
  };*/
  // Report Functions
  const handleCurrentChange = (e, index, personId) => {
    setSaveButton(true);
    let current = parseFloat(e.target.value) || 0; // Ensure value is a number or default to 0
  
    // Create a copy of the current transactions
    const newValues = [...currentTransactions];
  
    // Update only if there's a change in amountPaid
    if (newValues[index].amountPaid !== current) {
      newValues[index].amountPaid = current;
      setCurrentTransactions(newValues);
    }
  
    // Update currentTransaction state if value is valid
    if (!isNaN(current) && current > 0) {
      setCurrentTransaction((prevTransaction) => {
        const existingTransaction = prevTransaction.find(
          (item) => item.id === personId
        );
  
        if (existingTransaction) {
          // Update existing transaction
          return prevTransaction.map((item) =>
            item.id === personId ? { ...item, amountPaid: current } : item
          );
        } else {
          // Add a new transaction if not already present
          return [...prevTransaction, { id: personId, amountPaid: current }];
        }
      });
    }
  };
  
  const handleTransaction = async () => {
    try {
      setSaveButton(false); // Disable save button while processing
  
      // Map each transaction to a promise for asynchronous handling
      const promises = currentTransactions.map((transaction) => {
        return handleNewTransaction({
          amountPaid: transaction.amountPaid,
          person: transaction.person,
          forane: selectedForane.value, // Extract value from object
          family: selectedFamily.value, // Extract value from object
          parish: selectedParish.value, // Extract value from object
        });
      });
  
      // Resolve all promises
      const results = await Promise.all(promises);
  
      // Handle the results of each promise
      results.forEach((canAdd, index) => {
        if (typeof canAdd !== 'boolean' || !canAdd) {
          updateCurrentTransaction(currentTransactions[index]); // Retry or mark as failed
        }
      });
    } catch (error) {
      console.error("Error saving transactions:", error.message, error.stack);
    } finally {
      setSaved(true); // Mark as saved regardless of outcome
    }
  };
  
  const generateReport = () => {
    console.log(persons);
    setReport(true);
    fetchParishName();
    fetchFamilyName();
    fetchKottaymaName();
    fetchFamilyTotal();
  };

  const fetchParishName = async () => {
    try {
      const parish = await axiosInstance.get(`parish/${selectedParish}`);
      console.log(parish);
      setParishName(parish.data.name);
    } catch (error) {
      console.error("Error fetching parish name:", error);
    }
  };

  const fetchFamilyName = async () => {
    try {
      const family = await axiosInstance.get(`family/${selectedFamily}`);
      console.log(family);
      setFamilyName(family.data);
    } catch (error) {
      console.error("Error fetching family name", error);
    }
  };

  const fetchKottaymaName = async () => {
    try {
      const koottayma = await axiosInstance.get(
        `koottayma/${selectedKoottayma}`
      );
      console.log(koottayma);
      setKootaymaName(koottayma.data.name);
    } catch (error) {
      console.error("Error fetching kootayma name", error);
    }
  };

  const fetchFamilyTotal = async () => {
    var calFamilyTotal = 0;
    transactions.map((p) => {
      calFamilyTotal = calFamilyTotal + p;
    });

    setFamilyTotal(calFamilyTotal);
  };

  const handlePrint = () => {
    window.print(); // This will open the print dialog for the user
  };
  const pageRef = useRef();
  const handleGeneratePDF = () => {
    setPrint(true);
    const element = pageRef.current; // Get the DOM element to print
    html2pdf()
      .from(element)
      .set({
        margin: 1,
        filename: "page-content.pdf",
        html2canvas: { scale: 2 },
        jsPDF: { orientation: "portrait" },
      })
      .save(); // Save the PDF
  };
  const rawData = [
    { date: "2023-04-07T18:30:00.000+00:00", amountPaid: 1500 },
    { date: "2022-08-03T18:30:00.000+00:00", amountPaid: 1000 },
    { date: "2024-09-07T00:00:00.000+00:00", amountPaid: 500 },
    { date: "2024-11-26T18:30:00.000+00:00", amountPaid: 5000 }
  ];
  
  // More robust grouping with error handling
  const groupedData = rawData.reduce((acc, { date, amountPaid }) => {
    try {
      // Ensure date is a valid date object
      const year = new Date(date).getFullYear();
      
      // Additional validation
      if (!isNaN(year) && amountPaid !== undefined) {
        acc[year] = (acc[year] || 0) + amountPaid;
      }
    } catch (error) {
      console.error('Error processing date:', date, error);
    }
    return acc;
  }, {});
  
  // Ensure years and amounts are valid
  const years = Object.keys(groupedData).filter(year => !isNaN(year));
  const amounts = years.map(year => groupedData[year]);

  // Chart Data
  const chart1Data = {
  options: {
    chart: {
      type: "bar",
      height: 220,
      // Add error handling
      events: {
        error: (error) => {
          console.error('Chart rendering error:', error);
        }
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
        // Remove potentially problematic color configuration
      },
    },
    xaxis: {
      categories: years.length > 0 ? years : ['No Data'],
      labels: {
        show: true,
        style: {
          colors: years.map(() => "#000"), // Use black color, ensure matching array length
        },
      },
    },
    yaxis: {
      labels: {
        show: true,
      },
    },
    title: {
      text: "Amount Paid per Year",
      align: "center",
    },
  },
  series: [
    {
      name: "Amount Paid",
      data: amounts.length > 0 ? amounts : [0], // Ensure non-empty data
    },
  ],
};
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    
    {
      title: 'Relation',
      dataIndex: 'relation',
      key: 'relation',
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
    },
    {
      title: 'DOB',
      dataIndex: 'dob',
      key: 'dob',
    },
    {
      title: 'Occupation',
      dataIndex: 'occupation',
      key: 'occupation',
    },
    {
      title: 'Education',
      dataIndex: 'education',
      key: 'education',
    },
    {
      title: 'Total Amount(up to 2024)',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (text, record, index) => transactions[index], // Dynamically fetch transactions
    },
    {
      title: 'Current Amount',
      key: 'currentAmount',
      render: (text, record, index) => (
        <Input
          type="number"
          value={currentTransactions[index]?.amountPaid || ''}
          onChange={(e) => handleCurrentChange(e, index, record._id)}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <div className="action-buttons">
          <Button
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2"
            onClick={() => handleEdit(record._id)}
          >
            ✎
          </Button>

          <Button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
            onClick={() => handleDelete(record._id)}
          >
            X
          </Button>
        </div>
      ),
    },
  ];

  return !report ? (
    <div className="mx-auto flex flex-col items-center p-10 w-full">
      <h1 className="text-3xl font-bold py-5">Family Finances</h1>
      <div className="min w-full flex flex-col items-center justify-around">
      <div className="container1">
  {/* Left Section - Dropdowns */}
  <div className="left-section1">
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">Select Forane</label>
      <Select
        instanceId="forane-select"
        className="w-full"
        value={selectedForane}
        onChange={setSelectedForane}
        options={foranes.map((forane) => ({
          value: forane._id,
          label: forane.name,
        }))}
        placeholder="Select a Forane"
      />
    </div>

    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">Select Parish</label>
      <Select
        instanceId="parish-select"
        className="w-full"
        value={selectedParish}
        onChange={setSelectedParish}
        options={parishes.map((parish) => ({
          value: parish._id,
          label: parish.name,
        }))}
        placeholder="Select a Parish"
      />
    </div>

    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">Select Koottayma</label>
      <Select
        instanceId="koottayma-select"
        className="w-full"
        value={selectedKoottayma}
        onChange={setSelectedKoottayma}
        options={koottaymas.map((koottayma) => ({
          value: koottayma.koottaymaId,
          label: koottayma.name,
        }))}
        placeholder="Select a Koottayma"
      />
    </div>

    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">Select Family</label>
      <Select
        instanceId="family-select"
        className="w-full"
        value={selectedFamily}
        onChange={setSelectedFamily}
        options={families.map((family) => ({
          value: family.id,
          label: `${family.name} - ${family.headName}`,
        }))}
        placeholder="Select a Family"
      />
    </div>
  </div>

  {/* Right Section - Chart */}
  <div className="right-section1">
    <div className="chart-container">
      <FamilyChart 
        selectedFamily={selectedFamily} 
        axiosInstance={axiosInstance}
      />
    </div>
  </div>
</div>


     
      </div>
      {selectedFamily && displayRes && (
        <div className="w-full flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4 py-5">Family Finances</h2>
         
          <div className="flex flex-col items-center">
            {saveButton && (
              <Button type="primary"
                className=" mb-5 bg-green-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2"
                onClick={handleTransaction}
              >
                Save Changes
              </Button>
            )}
          </div>
          <Table
      columns={columns}
      dataSource={persons}
      rowKey="_id"
      pagination={false}
      className="custom-table"
     
    />
        </div>
      )}

{isEditing && (
  <div className="mt-4">
    <Modal
  title={formData._id ? "Edit Person" : "Add Person"}
  open={isEditing}
  onCancel={() => {
    setIsEditing(false);
    setFormData({});
  }}
  footer={null}
  width={800}
>
  <Form
     form={form} // Bind form instance to the form
     layout="vertical"
     onFinish={handleSubmit}
  >
    <div className="grid grid-cols-3 gap-4">
      {/* Relation */}
      <Form.Item
        name="relation"
        label="Relation"
        rules={[{ required: true, message: 'Please select relation!' }]}
      >
        <AntSelect placeholder="Select Relation" value={formData.relation || ""}>
          {relationOptions.map((rel) => (
            <AntSelect.Option key={rel.value} value={rel.value}>
              {rel.label}
            </AntSelect.Option>
          ))}
        </AntSelect>
      </Form.Item>
      {/* Name */}
      <Form.Item
        name="name"
        label="Name"
        rules={[{ required: true, message: 'Please input the name!' }]}
      >
        <Input placeholder="Enter Name" value={formData.name || ""} />
      </Form.Item>

      {/* Baptism Name */}
      <Form.Item
        name="baptismName"
        label="Baptism Name"
        rules={[{ required: true, message: 'Please input baptism name!' }]}
      >
        <Input placeholder="Enter Baptism Name" value={formData.baptismName || ""} />
      </Form.Item>

      {/* Gender */}
      <Form.Item
        name="gender"
        label="Gender"
        rules={[{ required: true, message: 'Please select gender!' }]}
      >
        <AntSelect placeholder="Select Gender" value={formData.gender || ""}>
          <AntSelect.Option value="male">Male</AntSelect.Option>
          <AntSelect.Option value="female">Female</AntSelect.Option>
        </AntSelect>
      </Form.Item>

      {/* Date of Birth */}
      <Form.Item
        name="dob"
        label="Date of Birth"
        rules={[{ required: true, message: 'Please input date of birth!' }]}
      >
        <Input type="date" value={
  formData.dob 
    ? (formData.dob instanceof Date 
      ? formData.dob.toISOString().split('T')[0]
      : new Date(formData.dob).toISOString().split('T')[0])
    : ""
}/>
      </Form.Item>

      {/* Phone */}
      <Form.Item
        name="phone"
        label="Phone"
        rules={[{ required: true, message: 'Please input phone number!' }]}
      >
        <Input placeholder="Enter Phone Number" value={formData.phone || ""} />
      </Form.Item>

      

      {/* Email */}
      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Please input email!' },
          { type: 'email', message: 'Please enter a valid email!' }
        ]}
      >
        <Input placeholder="Enter Email" value={formData.email || ""} />
      </Form.Item>

      {/* Education */}
      <Form.Item
        name="education"
        label="Education"
        rules={[{ required: true, message: 'Please input education!' }]}
      >
        <Input placeholder="Enter Education" value={formData.education || ""} />
      </Form.Item>

      {/* Occupation */}
      <Form.Item
        name="occupation"
        label="Occupation"
        rules={[{ required: true, message: 'Please input occupation!' }]}
      >
        <Input placeholder="Enter Occupation" value={formData.occupation || ""} />
      </Form.Item>
    </div>

    {/* Form Actions */}
    <Form.Item>
      <div className="flex justify-end space-x-2">
        <Button
          onClick={() => {
            setIsEditing(false);
            setFormData({});
          }}
        >
          Cancel
        </Button>
        <Button type="primary" htmlType="submit">
          {formData._id ? 'Update' : 'Add'}
        </Button>
      </div>
    </Form.Item>
  </Form>
</Modal>

  </div>
)}
    </div>
  ) : (
    <div ref={pageRef} className="report-body">
     
    </div>
  );
};

export default FamilyManagement;
