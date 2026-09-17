import React, { useState } from "react";
import { Modal, Form, InputNumber, Card, Statistic, Row, Col, message } from "antd";
import axiosInstance from "../axiosConfig.jsx";
import { useFinancialYear } from '../pages/FinancialYearContext';
const TotalAmountModal = ({ open, onClose, totalBalance, onSave, title }) => {
  const [form] = Form.useForm();
  const [parishPercentage, setParishPercentage] = useState(0);
  const [otherProjectsPercentage, setOtherProjectsPercentage] = useState(100);
  const [parishAmount, setParishAmount] = useState(0);
  const [otherProjectsAmount, setOtherProjectsAmount] = useState(totalBalance);
  const { selectedYear1, formattedYear, startDate, endDate, updateYear } = useFinancialYear();
      const currentYear = selectedYear1;
 
  const handleParishPercentageChange = (value) => {
    const newPercentage = value || 0;
    setParishPercentage(newPercentage);

    const calculatedParishAmount = (totalBalance * newPercentage) / 100;
    const calculatedOtherProjectsPercentage = 100 - newPercentage;
    const calculatedOtherProjectsAmount = totalBalance - calculatedParishAmount;

    setParishAmount(calculatedParishAmount);
    setOtherProjectsPercentage(calculatedOtherProjectsPercentage);
    setOtherProjectsAmount(calculatedOtherProjectsAmount);
  };

  const handleParishAmountChange = (value) => {
    const newAmount = value || 0;
    setParishAmount(newAmount);

    const calculatedParishPercentage = (newAmount / totalBalance) * 100;
    const calculatedOtherProjectsAmount = totalBalance - newAmount;
    const calculatedOtherProjectsPercentage = 100 - calculatedParishPercentage;

    setParishPercentage(calculatedParishPercentage);
    setOtherProjectsPercentage(calculatedOtherProjectsPercentage);
    setOtherProjectsAmount(calculatedOtherProjectsAmount);
  };

  const handleSave = async () => {
    try {
      const data = {
        parishPercentage: Number(parishPercentage.toFixed(2)),
        parishAmount: Number(parishAmount.toFixed(2)),
        otherProjectsPercentage: Number(otherProjectsPercentage.toFixed(2)),
        otherProjectsAmount: Number(otherProjectsAmount.toFixed(2)),
        balancecommunity: Number(totalBalance),
        year: currentYear
      };

      // Save to backend
      await axiosInstance.post("/community-settings/parish-allocation", data);
      
      message.success("Parish allocation saved successfully!");
      onSave(data);
      onClose();
    } catch (error) {
      console.error("Error saving parish allocation:", error);
      message.error("Failed to save parish allocation");
    }
  };

  // Add useEffect to load existing data when modal opens
  React.useEffect(() => {
    const fetchExistingAllocation = async () => {
      try {
        const response = await axiosInstance.get(`/community-settings/parish-allocation/${currentYear}`);
        const data = response.data;

        setParishPercentage(data.parish_percentage || 0);
        setParishAmount(data.parish_amount || 0);
        setOtherProjectsPercentage(data.other_projects_percentage || 100);
        setOtherProjectsAmount(data.other_projects_amount || totalBalance);
      } catch (error) {
        console.error("Error fetching parish allocation:", error);
      }
    };

    if (open) {
      fetchExistingAllocation();
    }
  }, [open, totalBalance, currentYear]);

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      onOk={handleSave}
      width={800}
    >
      <Form form={form} layout="vertical">
        <Card className="mb-4">
          <Statistic
            title="Balance after Community Allocation"
            value={totalBalance}
            precision={2}
          />
        </Card>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label="Parish Percentage">
              <InputNumber
                value={parishPercentage}
                onChange={handleParishPercentageChange}
                min={0}
                max={100}
                precision={2}
                style={{ width: '100%' }}
                addonAfter="%"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Parish Amount">
              <InputNumber
                value={parishAmount}
                onChange={handleParishAmountChange}
                min={0}
                max={totalBalance}
                precision={2}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label="Other Projects Percentage">
              <InputNumber
                value={otherProjectsPercentage}
                disabled
                precision={2}
                style={{ width: '100%' }}
                addonAfter="%"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Other Projects Amount">
              <InputNumber
                value={otherProjectsAmount}
                disabled
                precision={2}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default TotalAmountModal;