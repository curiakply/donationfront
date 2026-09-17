
import React, { useState, useEffect } from "react";
import { Modal, Form, InputNumber, Space, Button, message } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import axiosInstance from "../axiosConfig.jsx";
import { useFinancialYear } from '../pages/FinancialYearContext';
const SlabsModal = ({ open, onClose, onSave }) => {
  const [form] = Form.useForm();
  const [slabs, setSlabs] = useState([{ minValue: 0, maxValue: "" }]);
  const { selectedYear1, formattedYear, startDate, endDate, updateYear } = useFinancialYear();
      const currentYear = selectedYear1;

  // Fetch existing slabs when modal opens
  useEffect(() => {
    if (open) {
      fetchSlabs(); 
    }
  }, [open]);

  const fetchSlabs = async () => {
    try {
      const response = await axiosInstance.get(`/slabs/${currentYear}`);
      if (response.data && response.data.length > 0) {
        setSlabs(response.data);
      }
    } catch (error) {
      console.error('Error fetching slabs:', error);
      message.error('Failed to fetch slabs');
    }
  };

  const handleSlabChange = (index, field, value) => {
    const newSlabs = [...slabs];
    newSlabs[index][field] = value;

    if (field === "maxValue" && value !== "") {
      if (index < newSlabs.length - 1) {
        newSlabs[index + 1].minValue = value + 1;
      }
    } else if (field === "minValue" && value !== "") {
      if (index > 0 && value <= newSlabs[index - 1].maxValue) {
        newSlabs[index].minValue = newSlabs[index - 1].maxValue + 1;
      }
    }

    setSlabs(newSlabs);
  };

  const addSlab = () => {
    const lastSlab = slabs[slabs.length - 1];
    const newMinValue = lastSlab.maxValue !== "" ? lastSlab.maxValue + 1 : 0;
    setSlabs([...slabs, { minValue: newMinValue, maxValue: "" }]);
  };

  const deleteSlab = (index) => {
    const newSlabs = slabs.filter((_, i) => i !== index);
    for (let i = 1; i < newSlabs.length; i++) {
      newSlabs[i].minValue = newSlabs[i - 1].maxValue + 1;
    }
    setSlabs(newSlabs);
  };

  const handleOk = async () => {
    try {
      // Validate slabs
      const hasEmptyValues = slabs.some(slab => 
        slab.minValue === "" || slab.maxValue === ""
      );
      if (hasEmptyValues) {
        message.error('Please fill all slab values');
        return;
      }

      // Save to database
      await axiosInstance.post('/slabs', {
        slabs,
        year: currentYear
      });

      message.success('Slabs saved successfully');
      onSave(slabs);
      onClose();
    } catch (error) {
      console.error('Error saving slabs:', error);
      message.error('Failed to save slabs');
    }
  };

  return (
    <Modal
      title="Set Slabs"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="add"
          type="default"
          icon={<PlusOutlined />}
          onClick={addSlab}
        >
          Add Slab
        </Button>,
        <Button key="save" type="primary" onClick={handleOk}>
          Save
        </Button>,
      ]}
      width={600}
    >
      <Form form={form} layout="vertical">
        {slabs.map((slab, index) => (
          <Space key={index} style={{ display: "flex", marginBottom: 16 }}>
            <Form.Item label="Min Value" style={{ marginBottom: 0 }}>
              <InputNumber
                value={slab.minValue}
                onChange={(value) => handleSlabChange(index, "minValue", value)}
                disabled={index === 0}
                style={{ width: 200 }}
                min={0}
              />
            </Form.Item>
            <Form.Item label="Max Value" style={{ marginBottom: 0 }}>
              <InputNumber
                value={slab.maxValue}
                onChange={(value) => handleSlabChange(index, "maxValue", value)}
                style={{ width: 200 }}
                min={slab.minValue}
              />
            </Form.Item>
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => deleteSlab(index)}
              disabled={slabs.length === 1}
              style={{ marginTop: 32 }}
            />
          </Space>
        ))}
      </Form>
    </Modal>
  );
};

export default SlabsModal;
