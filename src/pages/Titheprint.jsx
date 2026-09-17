import React, { useState } from 'react';
import '../fonts.css';

// Sample data structure
const sampleData = {
  parishes: [
    {
      name: 'THARAKANATTUKUNNU',
      families: [
        {
          houseName: 'PULLOLICKEL',
          headName: 'ELSAMMA',
          kootayma: '10A ST. MICHAEL',
          address: 'CHERUVALLY, 686 543',
          phone: '9497321477',
          members: [
            {
              id: 1,
              baptismName: 'ALEY',
              commonName: 'ELSAMMA',
              relation: 'FAMILY HEAD',
              gender: 'F',
              dob: '07-06-1944',
              occupation: 'RTD TEACHER',
              education: 'B.A, B.ED',
              tithe2022: 3345,
              tithe2023: ''
            },
            {
              id: 2,
              baptismName: 'STANSLAVUS',
              commonName: 'FR. STANLY',
              relation: 'SON',
              gender: 'M',
              dob: '30-11-1983',
              occupation: 'PRIEST',
              education: 'B.A',
              tithe2022: 585,
              tithe2023: ''
            },
            {
              id: 3,
              baptismName: 'ABRAHAM',
              commonName: 'ABY',
              relation: 'SON',
              gender: 'M',
              dob: '06-03-1986',
              occupation: '',
              education: '',
              tithe2022: 1770,
              tithe2023: ''
            },
            {
              id: 4,
              baptismName: 'MARY',
              commonName: 'REMYA',
              relation: 'DAUGHTER IN LAW',
              gender: 'F',
              dob: '07-03-1989',
              occupation: '',
              education: '',
              tithe2022: 400,
              tithe2023: ''
            },
            {
              id: 5,
              baptismName: 'EAPEN',
              commonName: 'EAPEN',
              relation: 'GRAND SON',
              gender: 'M',
              dob: '29-06-2019',
              occupation: '',
              education: '',
              tithe2022: 200,
              tithe2023: ''
            }
          ]
        }
      ]
    }
  ]
};

const FamilyDetailsComponent = () => {
  const [selectedParish, setSelectedParish] = useState('');
  const [selectedFamily, setSelectedFamily] = useState(null);

  const handlePrint = () => {
    window.print();
  };

  // Generate empty rows for the table
  const generateEmptyRows = (currentRows) => {
    const totalNeededRows = 10;
    const emptyRowsNeeded = totalNeededRows - currentRows;
    return Array(emptyRowsNeeded).fill(null).map((_, index) => (
      <tr key={`empty-${index}`}>
        <td style={{ border: '1px solid #000', padding: '6px' }}></td>
        <td style={{ border: '1px solid #000', padding: '6px' }}></td>
        <td style={{ border: '1px solid #000', padding: '6px' }}></td>
        <td style={{ border: '1px solid #000', padding: '6px' }}></td>
        <td style={{ border: '1px solid #000', padding: '6px' }}></td>
        <td style={{ border: '1px solid #000', padding: '6px' }}></td>
        <td style={{ border: '1px solid #000', padding: '6px' }}></td>
        <td style={{ border: '1px solid #000', padding: '6px' }}></td>
        <td style={{ border: '1px solid #000', padding: '6px' }}></td>
        <td style={{ border: '1px solid #000', padding: '6px' }}></td>
      </tr>
    ));
  };

  // Calculate total tithe
  const calculateTotal = (members, year) => {
    return members?.reduce((acc, curr) => acc + (curr[year] || 0), 0);
  };

  const renderContent = () => {
    const family = selectedFamily || sampleData.parishes[0].families[0]; // For demo, show first family if none selected

    return (
      <div style={{ width: '210mm', margin: '0 auto', padding: '10mm', boxSizing: 'border-box' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <img 
            src="/Cross.jpg"
            alt="Logo"
            style={{ width: '150px', height: 'auto', marginRight: '0px' }}
          />
          <div style={{ textAlign: 'center', flexGrow: 1 }}>
            <h2 className="malayalam-text4" style={{ fontSize: '70px', margin: 0 }}>Poh³ 2024</h2>
            <h4 className="malayalam-text1" style={{ fontSize: '35px', margin: '5px 0' }}>Imªnc¸Ån cqX</h4>
            <p className="malayalam-text2" style={{ fontSize: '25px', margin: '5px 0' }}>¦phbv¡eneqsS Pohsâ kar²nbntebv¡v</p>
            <p className="malayalam-text3" style={{ fontSize: '18px', margin: '5px 0' }}>\³asN¿p¶Xnepw \n§Ä¡pÅh ¦phbv¡p¶Xnepw DtIvj hcp¯cpXv. A¯cw _enIÄ ssZh¯n\p oXnIcamWv.sl_mbÀ 13:16</p>
          </div>
        </div>

        <hr style={{ margin: '0px' }}/>
        <hr style={{ marginTop: '0px' }}/>

        {/* Details Container */}
        <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div style={{ border: '1px solid #000', padding: '10px', margin: '5px', width: 'calc(50% - 20px)', borderRadius: '8px', fontSize: '12px' }}>
            <strong className="malayalam-text3" style={{ fontSize: '18px', fontWeight: '100' }}>CShI:</strong>
            <strong> {family.parish || 'THARAKANATTUKUNNU'}</strong>
          </div>
          <div style={{ border: '1px solid #000', padding: '10px', margin: '5px', width: 'calc(50% - 20px)', borderRadius: '8px', fontSize: '12px' }}>
            <strong className="malayalam-text3" style={{ fontSize: '18px', fontWeight: '100' }}>ho«ptcv:</strong>
            <strong> {family.houseName}</strong>
          </div>
          <div style={{ border: '1px solid #000', padding: '10px', margin: '5px', width: 'calc(50% - 20px)', borderRadius: '8px', fontSize: '12px' }}>
            <strong className="malayalam-text3" style={{ fontSize: '18px', fontWeight: '100' }}>IpSpw_ \mY³/\mYbpsS \maw:</strong>
            <strong> {family.headName}</strong>
          </div>
          <div style={{ border: '1px solid #000', padding: '10px', margin: '5px', width: 'calc(50% - 20px)', borderRadius: '8px', fontSize: '12px' }}>
            <strong className="malayalam-text3" style={{ fontSize: '18px', fontWeight: '100' }}>Iq«mbva:</strong>
            <strong> {family.kootayma}</strong>
          </div>
          <div style={{ border: '1px solid #000', padding: '10px', margin: '5px', width: 'calc(50% - 20px)', borderRadius: '8px', fontSize: '12px' }}>
            <strong className="malayalam-text3" style={{ fontSize: '18px', fontWeight: '100' }}>hnemkw:</strong>
            <strong> {family.address}</strong>
          </div>
          <div style={{ border: '1px solid #000', padding: '10px', margin: '5px', width: 'calc(50% - 20px)', borderRadius: '8px', fontSize: '12px' }}>
            <strong className="malayalam-text3" style={{ fontSize: '18px', fontWeight: '100' }}>t^m¬ \¼À:</strong>
            <strong> {family.phone}</strong>
          </div>
        </div>

        {/* Table */}
        <div style={{ paddingBottom: '15px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
            <thead>
              <tr>
                <th className="malayalam-text3" style={{ border: '1px solid #000', padding: '6px', textAlign: 'left', background: '#f2f2f2', fontSize: '15px', fontWeight: '100' }}>{'{Ia \¼À'}</th>
                <th className="malayalam-text3" style={{ border: '1px solid #000', padding: '6px', textAlign: 'left', background: '#f2f2f2', fontSize: '15px', fontWeight: '100' }}>amt½mZok tcv</th>
                <th className="malayalam-text3" style={{ border: '1px solid #000', padding: '6px', textAlign: 'left', background: '#f2f2f2', fontSize: '15px', fontWeight: '100' }}>hnfn¡p¶ tcv</th>
                <th className="malayalam-text3" style={{ border: '1px solid #000', padding: '6px', textAlign: 'left', background: '#f2f2f2', fontSize: '15px', fontWeight: '100' }}>IpSpw_ \mY\pambpÅ _Ôw</th>
                <th className="malayalam-text3" style={{ border: '1px solid #000', padding: '6px', textAlign: 'left', background: '#f2f2f2', fontSize: '15px', fontWeight: '100' }}>p/kvXo</th>
                <th className="malayalam-text3" style={{ border: '1px solid #000', padding: '6px', textAlign: 'left', background: '#f2f2f2', fontSize: '15px', fontWeight: '100' }}>P\\ XobXn</th>
                <th className="malayalam-text3" style={{ border: '1px solid #000', padding: '6px', textAlign: 'left', background: '#f2f2f2', fontSize: '15px', fontWeight: '100' }}>sXmgnÂ</th>
                <th className="malayalam-text3" style={{ border: '1px solid #000', padding: '6px', textAlign: 'left', background: '#f2f2f2', fontSize: '15px', fontWeight: '100' }}>hnZym`ymkw</th>
                <th className="malayalam-text3" style={{ border: '1px solid #000', padding: '6px', textAlign: 'left', background: '#f2f2f2', fontSize: '15px', fontWeight: '100' }}>Zimwiw  2024 hsc </th>
                <th className="malayalam-text3" style={{ border: '1px solid #000', padding: '6px', textAlign: 'left', background: '#f2f2f2', fontSize: '15px', fontWeight: '100' }}>Zimwiw 2025</th>
              </tr>
            </thead>
            <tbody>
              {family.members.map((member) => (
                <tr key={member.id}>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{member.id}</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{member.baptismName}</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{member.commonName}</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{member.relation}</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{member.gender}</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{member.dob}</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{member.occupation}</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{member.education}</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{member.tithe2022}</td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>{member.tithe2023}</td>
                </tr>
              ))}
              {generateEmptyRows(family.members.length)}
              <tr>
                <td colSpan="8" style={{ border: '1px solid #000', padding: '6px', textAlign: 'right' }}><strong>TOTAL</strong></td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{calculateTotal(family.members, 'tithe2022')}</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{calculateTotal(family.members, 'tithe2023')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ border: '1px solid #000', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', fontSize: '14px', padding: '20px' }}>
            <div style={{ flex: 1 }}>
              <span>
                <strong className="malayalam-text3" style={{ fontSize: '18px', fontWeight: '100' }}>
                  IpSpw_\mYsâ tcv:
                </strong>
                <span> {family.headName}</span>
              </span>
            </div>
            <div style={{ flex: 1, textAlign: 'right' }}>
              <span>
                <strong className="malayalam-text3" style={{ fontSize: '18px', fontWeight: '100' }}>
                  hnImcnbpsS tcv:
                </strong>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '14px', padding: '20px' }}>
            <span className="malayalam-text3" style={{ flex: 1, textAlign: 'left', fontSize: '18px', fontWeight: '100' }}>
              XnbXn:
            </span>
            <span className="malayalam-text3" style={{ flex: 1, textAlign: 'center', fontSize: '18px', fontWeight: '100' }}>
              ÅnbpsS koÂ
            </span>
            <span style={{ flex: 1 }}></span>
          </div>
        </div>

        <hr style={{ margin: '0px' }}/>
        <hr style={{ marginTop: '0px' }}/>
      </div>
    );
  };

  return (
    <div>
      {/* Print Controls - Hidden in print */}
      <div className="no-print" style={{ marginBottom: '20px', padding: '20px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select 
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            onChange={(e) => setSelectedParish(e.target.value)}
            value={selectedParish}
          >
            <option value="">Select Parish</option>
            {sampleData.parishes.map((parish, idx) => (
              <option key={idx} value={parish.name}>{parish.name}</option>
            ))}
          </select>

          <select 
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            onChange={(e) => {
              const family = sampleData.parishes
                .find(p => p.name === selectedParish)?.families
                .find(f => f.houseName === e.target.value);
              setSelectedFamily(family);
            }}
            disabled={!selectedParish}
          >
            <option value="">Select Family</option>
            {selectedParish && 
              sampleData.parishes
                .find(p => p.name === selectedParish)?.families
                .map((family, idx) => (
                  <option key={idx} value={family.houseName}>
                    {family.houseName} - {family.headName}
                  </option>
                ))
            }
          </select>

          <button 
            onClick={handlePrint}
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Main Content */}
      {renderContent()}
    </div>
  );
};

export default FamilyDetailsComponent;