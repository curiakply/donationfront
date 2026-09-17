import { useState, useEffect } from "react";
import axiosInstance from "../axiosConfig";
import Select from 'react-select';
import { LoadingOutlined } from '@ant-design/icons';
import { Input, Table, Button, Space, Card, Alert, Spin, Typography } from 'antd';

const { Title } = Typography;

const customStyles = {
  control: (base) => ({
    ...base,
    minHeight: 38,
    backgroundColor: 'white',
    borderColor: '#d9d9d9',
    '&:hover': {
      borderColor: '#4096ff'
    }
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999
  })
};

const MoveFamily = () => {
  const [data, setData] = useState({
    foranes: [],
    parishes: [],
    koottaymas: [],
    persons: [],
    families: []
  });
  
  const [selected, setSelected] = useState({
    forane: null,
    parish: null,
    koottayma: null,
    family: null
  });
  
  const [loading, setLoading] = useState({
    fetch: false,
    move: false
  });
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchID, setSearchID] = useState("");
  const [displayResults, setDisplayResults] = useState(false);

  useEffect(() => {
    fetchForanes();
  }, []);

  useEffect(() => {
    if (selected.forane?.value) fetchParishes(selected.forane.value);
  }, [selected.forane]);

  useEffect(() => {
    if (selected.parish?.value) fetchKoottaymas(selected.parish.value);
  }, [selected.parish]);

  useEffect(() => {
    if (selected.koottayma?.value) fetchFamilies(selected.koottayma.value);
  }, [selected.koottayma]);

  useEffect(() => {
    if (selected.family?.value) {
      fetchPersons(selected.family.value);
      setDisplayResults(true);
    }
  }, [selected.family]);

  const fetchData = async (endpoint, setter, errorMessage) => {
    setLoading(prev => ({ ...prev, fetch: true }));
    setError(null);
    try {
      const response = await axiosInstance.get(endpoint);
      console.log('API Response:', response.data);
      setter(response.data.map(item => ({
        value: item._id || item.id,
        label: item.name
      })));
    } catch (error) {
      setError(`${errorMessage}: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  const fetchForanes = () => fetchData("/forane", 
    (data) => setData(prev => ({ ...prev, foranes: data })), 
    "Error fetching foranes"
  );

  const fetchParishes = (foraneId) => fetchData(`/parish/forane/${foraneId}`,
    (data) => setData(prev => ({ ...prev, parishes: data })),
    "Error fetching parishes"
  );

  const fetchKoottaymas = async (parishId) => {
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      const response = await axiosInstance.get(`/koottayma/parish/${parishId}`);
      console.log('API Response:', response.data);
      
      const formattedData = Array.isArray(response.data) ? response.data.map(item => ({
        value: item.koottaymaId || item.koottaymaId,
        label: item.name || item.label,
        parish: parishId
      })) : [];
      
      setData(prev => ({ ...prev, koottaymas: formattedData }));
    } catch (error) {
      console.error('Error:', error);
      setError(`Error fetching koottaymas: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };
  const fetchFamilies = async (koottaymaId) => {
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      const response = await axiosInstance.get(`/family/kottayma/${koottaymaId}`);
      const familiesWithHeads = await Promise.all(
        response.data.map(async (family) => {
          const personsResponse = await axiosInstance.get(`/person/family/${family.id}`);
          const head = personsResponse.data.find(person => person.relation === "head");
          return {
            value: family.id,
            label: `${family.name} - ${head?.name || 'No head assigned'}`
          };
        })
      );
      setData(prev => ({ ...prev, families: familiesWithHeads }));
    } catch (error) {
      console.error('Error:', error);
      setError(`Error fetching families: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
   };

  const fetchPersons = async (familyId) => {
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      const [personsResponse, familyResponse] = await Promise.all([
        axiosInstance.get(`/person/family/${familyId}`),
        axiosInstance.get(`/family/${familyId}`)
      ]);
      
      const personDetails = await Promise.all(
        personsResponse.data.map(p => axiosInstance.get(`/person/${p._id}`))
      );
      
      setData(prev => ({ ...prev, persons: personDetails.map(r => r.data) }));
    } catch (error) {
      setError(`Error fetching family details: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  const handleMove = async () => {
    if (!selected.forane?.value || !selected.parish?.value || !selected.koottayma?.value) {
      setError("Please select all required fields");
      return;
    }

    setLoading(prev => ({ ...prev, move: true }));
    try {
      await axiosInstance.put(`/family/${selected.family.value}`, {
        forane: selected.forane.value,
        parish: selected.parish.value,
        koottayma: selected.koottayma.value
      });
      
      setSuccess("Family moved successfully!");
      setSearchID("");
      setDisplayResults(false);
      setSelected({
        forane: null,
        parish: null,
        koottayma: null,
        family: null
      });
      
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      setError(`Error moving family: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, move: false }));
    }
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchID(value);
    if (value.length === 6 && !displayResults) {
      setSelected(prev => ({ 
        ...prev, 
        family: { value, label: value }
      }));
      setDisplayResults(true);
    } else {
      setDisplayResults(false);
    }
  };

  const handleSelectChange = (field) => (option) => {
    console.log(`Selected ${field}:`, option);
    setSelected(prev => ({ ...prev, [field]: option }));
    
    if (field === 'forane') {
      setSelected(prev => ({ ...prev, parish: null, koottayma: null, family: null }));
    } else if (field === 'parish') {
      setSelected(prev => ({ ...prev, koottayma: null, family: null }));
    } else if (field === 'koottayma') {
      console.log('Koottayma ID:', option?.value);
      console.log('Full Koottayma data:', option);
      setSelected(prev => ({ ...prev, family: null }));
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Baptism Name', dataIndex: 'baptismName', key: 'baptismName' },
    { title: 'Relation', dataIndex: 'relation', key: 'relation' },
    { title: 'Gender', dataIndex: 'gender', key: 'gender' },
    { title: 'DOB', dataIndex: 'dob', key: 'dob' },
    { title: 'Occupation', dataIndex: 'occupation', key: 'occupation' },
    { title: 'Education', dataIndex: 'education', key: 'education' }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>
        Move Family
      </Title>
      
      {(error || success) && (
        <Alert
          message={error ? "Error" : "Success"}
          description={error || success}
          type={error ? "error" : "success"}
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      <Card>
        <Space style={{ width: '100%' }} direction="vertical" size="large">
          <Space style={{ width: '100%', flexWrap: 'wrap' }} size="large">
            <Select
              styles={customStyles}
              placeholder="Select Forane"
              value={selected.forane}
              onChange={handleSelectChange('forane')}
              options={data.foranes}
              isLoading={loading.fetch}
              isClearable
              className="min-w-[200px]"
            />

            {selected.forane && (
              <Select
                styles={customStyles}
                placeholder="Select Parish"
                value={selected.parish}
                onChange={handleSelectChange('parish')}
                options={data.parishes}
                isLoading={loading.fetch}
                isClearable
                className="min-w-[200px]"
              />
            )}

            {selected.parish && (
              <Select
                styles={customStyles}
                placeholder="Select Koottayma"
                value={selected.koottaymas}
                onChange={handleSelectChange('koottayma')}
                options={data.koottaymas}
                isLoading={loading.fetch}
                isClearable
                className="min-w-[200px]"
              />
            )}

            {selected.koottayma && (
              <Select
                styles={customStyles}
                placeholder="Select Family"
                value={selected.family}
                onChange={handleSelectChange('family')}
                options={data.families}
                isLoading={loading.fetch}
                isClearable
                className="min-w-[200px]"
              />
            )}
          </Space>

          <Input
            placeholder="Enter Family ID and press SPACE"
            value={searchID}
            onChange={handleSearchInputChange}
            style={{ maxWidth: 300 }}
            disabled={loading.fetch}
          />

          {loading.fetch ? (
            <div style={{ textAlign: 'center', padding: '24px' }}>
              <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
            </div>
          ) : displayResults && data.persons.length > 0 && (
            <>
              <Title level={4}>Family Members</Title>
              <Table
                columns={columns}
                dataSource={data.persons.map(p => ({ ...p, key: p._id }))}
                pagination={false}
                scroll={{ x: true }}
              />

              <Button
                type="primary"
                onClick={handleMove}
                loading={loading.move}
                disabled={!selected.koottayma}
                style={{ marginTop: '24px' }}
              >
                Move Family
              </Button>
            </>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default MoveFamily;