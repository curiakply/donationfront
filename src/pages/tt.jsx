import React, { useState, useEffect } from 'react';
import { 
  Print as PrintIcon, 
  Close as CloseIcon,
  LocalPrintshop as LocalPrintshopIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon
  
} from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import axiosInstance from "../axiosConfig";
import { useFinancialYear } from './FinancialYearContext';
// Reuse the existing components from the original code
const PageHeader = ({ currentYear, parishInfo }) => (
  <div className="header-section" style={{
    display: 'flex',
    gap: '20px',
    marginBottom: '-15px',
  }}>
    <div className="seal" style={{
      width: '210px',
      height: '180px',
    }}>
      <img
        src="/cropped-eparchy_klpyEBM.png"
        alt="Parish Seal"
        className="seal-image"
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
        }}
      />
    </div>
    <div className="title-section" style={{
      flexGrow: 1,
      textAlign: 'center',
    }}>
      <h1 className="main-title malayalam-text" style={{
        fontSize: '60px',
        fontWeight: 'bold',
        marginBottom: '-35px',
      }}>
        Poh³  {currentYear}
      </h1>
      <h2 className="sub-title malayalam-text1" style={{
        fontSize: '30px',
        fontWeight: 'bold',
        marginBottom: '-10px',
        lineHeight: '1',
      }}>
        Imªnc¸Ån cq]X 
      </h2>
      <p className="subtitle-text malayalam-text2" style={{
        fontSize: '20px',
        marginBottom: '-8px',
      }}>
        ]¦phbv¡eneqsS Pohsâ kar²nbntebv¡v 
      </p>
      <p className="verse-text malayalam-text3" style={{
        fontSize: '18px',
        marginBottom: '-14px',
        lineHeight: '1',
      }}>
        {`\\³asN¿p¶Xnepw \\n§Ä¡pÅh ]¦phbv¡p¶Xnepw Dt]Ivj hcp¯cpXv. A¯cw _enIÄ ssZh¯n\\p {]oXnIcamWv.(sl{_mbÀ 13:16)`}
      </p>
    </div>
  </div>
);
const FamilyDetails = ({ familyData, parishInfo, koottaymaInfo }) =>(
  <div className="family-details-container" style={{
    display: 'flex',
    gap: '20px',
    width: '265mm',
    borderRadius: '5px',
    padding: '20px',
  }}>
    <div className="left-details" style={{ 
      flex: '1',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    }}>
      <div className="detail-row" style={{
        display: 'flex', 
        justifyContent: 'flex-start', 
        border: '1px solid rgb(0, 0, 0)',
         borderRadius: '5px', 
         padding: '5px 10px', 
        alignItems: 'center'
      }}>
        <span className="detail-label malayalam-text5" style={{
          fontWeight: 'bold',
          fontSize: '18px',
        }}>
          CShI : 
        </span>
        <span className="detail-value">
          {parishInfo.name}
        </span>
      </div>
      <div className="detail-row" style={{
       display: 'flex', 
       justifyContent: 'flex-start', 
       border: '1px solid rgb(0, 0, 0)',
        borderRadius: '5px', 
        padding: '5px 10px', 
       alignItems: 'center' 
      }}>
        <span className="detail-label1 malayalam-text5" style={{
          fontWeight: 'bold',
          fontSize: '17px',
        }}>
          IpSpw_ \mY³/\mYbpsS \maw : 
        </span>
        <span className="detail-value1">
          {familyData.headname}
        </span>
      </div>
      <div className="detail-row" style={{
        display: 'flex', 
        justifyContent: 'flex-start', 
        border: '1px solid rgb(0, 0, 0)',
         borderRadius: '5px', 
         padding: '5px 10px', 
        alignItems: 'center'
      }}>
        <span className="detail-label malayalam-text5" style={{
          fontWeight: 'bold',
          fontSize: '18px',
        }}>
          ho«pt]cv : 
        </span>
        <span className="detail-value">
          {familyData.name}
        </span>
      </div>
    </div>
    <div className="right-details" style={{
      flex: '1',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    }}>
      <div className="detail-row" style={{
        display: 'flex', 
        justifyContent: 'flex-start', 
        border: '1px solid rgb(0, 0, 0)',
         borderRadius: '5px', 
         padding: '5px 10px', 
        alignItems: 'center'
      }}>
        <span className="detail-label malayalam-text5" style={{
          fontWeight: 'bold',
          fontSize: '18px',
        }}>
          Iq«mbva : 
        </span>
        <span className="detail-value">
          {koottaymaInfo.name}
        </span>
      </div>
      <div className="detail-row" style={{
       display: 'flex', 
       justifyContent: 'flex-start', 
       border: '1px solid rgb(0, 0, 0)',
        borderRadius: '5px', 
        padding: '5px 10px', 
       alignItems: 'center'
      }}>
        <span className="detail-label malayalam-text5" style={{
          fontWeight: 'bold',
          fontSize: '18px',
        }}>
          hnemkw : 
        </span>
        <span className="detail-value">
          {familyData.building}
        </span>
      </div>
      <div className="detail-row" style={{
       display: 'flex', 
       justifyContent: 'flex-start', 
       border: '1px solid rgb(0, 0, 0)',
        borderRadius: '5px', 
        padding: '5px 10px', 
       alignItems: 'center'
      }}>
        <span className="detail-label malayalam-text5" style={{
          fontWeight: 'bold',
          fontSize: '18px',
        }}>
          t^m¬ \¼À : 
        </span>
        <span className="detail-value">
          {familyData.phone}
        </span>
      </div>
    </div>
  </div>
);

const MemberTable = ({ currentYear, members, transactions, showTotals = false, startIndex = 0 }) => (

  <table className="print-table" style={{ width: '285mm', maxWidth: '100%' }}>
    <thead>
      <tr>
        <th className="serial-column malayalam-text5" style={{ fontSize: '12px'}}>{`{Ia \\¼À`}</th>
        <th className="name-column malayalam-text5" style={{fontSize: '12px'}}>amt½mZok t]cv</th>
        <th className="name-column malayalam-text5" style={{ fontSize: '12px'}}>hnfn¡p¶ t]cv</th>
        <th className="relation-column malayalam-text5" style={{fontSize: '12px'}}>IpSpw_ \mY\pambpÅ _Ôw</th>
        <th className="gender-column malayalam-text5" style={{fontSize: '12px'}}>{`]p/kv{Xo`}</th>
        <th className="date-column malayalam-text5" style={{ fontSize: '12px'}}>P\\ XobXn</th>
        <th className="occupation-column malayalam-text5" style={{fontSize: '12px'}}>sXmgnÂ</th>
        <th className="education-column malayalam-text5" style={{fontSize: '12px'}}>hnZym`ymkw</th>
        <th className="amount-column malayalam-text5" style={{ fontSize: '12px'}}>Zimwiw 2003 -2023</th>
        <th className="amount-column malayalam-text5" style={{ fontSize: '12px'}}>Zimwiw 2024</th>
      </tr>
    </thead>
    <tbody>
      {members.map((member, index) => (
        <tr key={index}>
          <td className="text-center" style={{ fontSize: '10px'}}>{startIndex + index + 1}</td>
          <td className="text-center" style={{ fontSize: '10px'}}>{member.baptismName}</td>
          <td className="text-center" style={{ fontSize: '10px'}}>{member.name}</td>
          <td className="text-center" style={{ fontSize: '10px'}}>{member.relation}</td>
          <td className="text-center" style={{ fontSize: '10px'}}>{member.gender === 'male' ? 'M' : 'F'}</td>
          <td className="text-center" style={{ fontSize: '10px'}}>{member.dob}</td>
          <td className="text-center" style={{ fontSize: '10px'}}>{member.occupation}</td>
          <td className="text-center" style={{ fontSize: '10px'}}>{member.education}</td>
          <td className="text-right" style={{ fontSize: '10px'}}>
          {member.totalAmount}
          </td>
          <td className="text-right" style={{ fontSize: '10px'}}>
            {/* {transactions?.find(t => t.personId === member._id)?.currentYearAmount || 0} */}
          </td>
        </tr>
      ))}
      {[...Array(Math.max(0, 15 - members.length))].map((_, index) => (
        <tr key={`empty-${index}`}>
          {[...Array(10)].map((_, colIndex) => (
            <td key={`empty-${index}-${colIndex}`}>&nbsp;</td>
          ))}
        </tr>
      ))}
      {showTotals && (
        <tr className="total-row">
          <td colSpan="8" className="text-right font-bold">TOTAL</td>
          <td className="text-right font-bold" style={{ fontSize: '10px'}}>
            {transactions?.reduce((sum, t) => sum + (t.amountPaid || 0), 0)}
          </td>
          <td className="text-right font-bold" style={{ fontSize: '10px'}}>
            {/* {transactions?.reduce((sum, t) => sum + (t.currentYearAmount || 0), 0)} */}
          </td>
        </tr>
      )}
    </tbody>
  </table>
);


const PageFooter = ({ showSignatures = true }) =>(
  <>
    {showSignatures && (
      <div className="signature-section" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '5px',
        padding: '20px',
        border: '1px solid #000',
        borderRadius: '10px',
        width: '265mm'
      }}>
        <div className="signature-blocks" style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
        }}>
          <div className="signature-block">
            <p className="malayalam-text5" style={{ fontSize: '16px' }}>
              IpSpw_\mYsâ t]cpw H¸pw
            </p>
            <div className="signature-line" style={{
              width: '200px',
              marginTop: '40px',
            }}></div>
            <p className="date-text malayalam-text5" style={{
              marginTop: '10px',
              fontSize: '16px',
            }}>XobXn</p>
          </div>
          <div className="signature-block right">
            <p className="malayalam-text5" style={{ fontSize: '16px' }}>
              hnImcnbpsS t]cpw H¸pw
            </p>
            <div className="signature-line" style={{
              width: '200px',
              marginTop: '40px',
              marginLeft: 'auto',
            }}></div>
          </div>
        </div>
        <p className="seal-text malayalam-text5" style={{
          marginTop: '-35px',
          fontSize: '16px',
        }}>(]ÅnbpsS koÂ)</p>
      </div>
    )}
    <div className="notes-section" style={{
      width: '226mm',
      paddingTop: '0',
      marginTop: '5px'
    }}>
      <p className="malayalam-text5">   
        ➔ {`Cu t^md¯nÂ Fs´¦nepw Xncp¯epIÄ Dsï¦nÂ Ah \n§fpsS t]cn\p XmsgbpÅ tImf¯nÂ hyàambn FgpXn \ÂtIïXmWv.`}
      </p>
      <p className="malayalam-text5">   
        ➔ {`t]cphnhc§Ä I¼yq«dnÂ B¡p¶Xn\p kuIcy{]Zamb coXnbnÂ Cw¥ojnÂ FgpXphm\pw, FÃm tImf§fpw ]qcn¸n¡m\pw {i²n¡pI.`}
      </p>
      <p className="malayalam-text5">   
        ➔ {`IpSpw_\mYsâbpw IpSpw_mwK§fpsS ho«pt]cpÅ]£w {i²m³ DÄs¸sS Ah hyàns¸Sp¯ïXmWv.`}
      </p>
      <p className="malayalam-text5">   
        ➔ {`Cu enkvänÂ acWs¸«hcpsï¦nÂ AhcpsS t]cn\p Xmsg "acWs¸«p" F¶pw acWXobXnbpsS Xmsg acWXobXnbpw FgpXWw.`}
      </p>
    </div>
  </>
);

// New BulkPrintLayout component
const BulkPrintLayout = ({ families, currentYear }) => {
  return (
    <div className="w-full max-w-full m-0 bg-white">
      {families.map((family, familyIndex) => (
        <div key={familyIndex}>
          {Array.from({ length: Math.ceil(family.persons.length / 15) }, (_, pageIndex) => {
            const startIndex = pageIndex * 15;
            const pageMembers = family.persons.slice(startIndex, startIndex + 15);
            const isLastPage = pageIndex === Math.ceil(family.persons.length / 15) - 1;
            
            return (
              <div key={`${familyIndex}-${pageIndex}`} 
                   className="w-[285mm] min-h-[297mm] mx-auto p-10 box-border relative bg-white">
                <PageHeader 
                  currentYear={currentYear} 
                  parishInfo={family.parishInfo} 
                />
                
                <div className="border-t-2 border-black m-0"></div>
                <div className="border-t-2 border-black mt-px mb-10"></div>

                <FamilyDetails
                  familyData={family.familyData}
                  parishInfo={family.parishInfo}
                  koottaymaInfo={family.koottaymaInfo}
                />

                <div className="flex-1">
                  <MemberTable
                    currentYear={currentYear}
                    members={pageMembers}
                    transactions={family.transactions}
                    showTotals={isLastPage}
                    startIndex={startIndex}
                  />
                </div>

                <PageFooter showSignatures={isLastPage} />
                
{/*                 
                <div className="absolute bottom-5 right-10 text-sm">
                  Page {pageIndex + 1} of {Math.ceil(family.persons.length / 15)}
                </div> */}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// Main Component
const BulkFamilyPrintSystem = () => {
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [familiesData, setFamiliesData] = useState([]);
  const { selectedYear1: currentYear } = useFinancialYear();
  useEffect(() => {
    // Add print-specific styles when component mounts
    const style = document.createElement('style');
    const printStyles = `
    @page {
     size: A4;
     margin: 1mm;
   }
   @media print {
     html, body {
       height: auto !important;
       overflow: visible !important;
       -webkit-print-color-adjust: exact !important;
       print-color-adjust: exact !important;
       background-color: white !important;
     }
     
     * {
       overflow: visible !important;
     }
     
     .MuiPaper-root {
       box-shadow: none !important;
       overflow: visible !important;
     }
     
     .print-content {
       position: static !important;
       transform: none !important;
       overflow: visible !important;
       height: auto !important;
     }
     
     .MuiTableContainer-root {
       overflow: visible !important;
       break-inside: auto !important;
     }
     
     .MuiTable-root {
       width: 100% !important;
       break-inside: auto !important;
       page-break-inside: auto !important;
     }
     
     .MuiTableHead-root {
       display: table-header-group !important;
     }
     
     .MuiTableBody-root {
       display: table-row-group !important;
     }
     
     .MuiTableRow-root {
       break-inside: avoid !important;
       page-break-inside: avoid !important;
     }
     
     .MuiTableCell-root {
       border: 1px solid black !important;
       color: black !important;
     }
     
     .MuiTypography-root {
       color: black !important;
     }
     
     .MuiDivider-root {
       margin: 24px 0 !important;
       border-color: black !important;
     }
     
     .no-print {
       display: none !important;
     }
 
     .print-container,
     .print-container * {
       visibility: visible;
     }
  * {
       overflow: visible !important;
     }
     .print-page {
       break-after: page;
       page-break-after: always;
       margin: 0 !important;
       border: initial !important;
       border-radius: initial !important;
       width: initial !important;
       min-height: initial !important;
       box-shadow: initial !important;
       background: initial !important;
       page-break-after: always !important;
     }
 
     .print-page:last-child {
       page-break-after: auto;
     }
 
     .print-table {
      
       table-layout: fixed;
     }
 
     .dialog-buttons,
     .no-print {
       display: none !important;
     }
 
     .MuiDialogContent-root {
       overflow: visible !important;
     }
 
     /* Ensure table headers print with background */
     .print-table th {
       -webkit-print-color-adjust: exact !important;
       print-color-adjust: exact !important;
       background-color: #f3f4f6 !important;
     }
 
     /* Force page breaks */
     .print-page {
       break-inside: avoid;
     }
   }
 
   /* High DPI print settings */
   @media print and (-webkit-min-device-pixel-ratio: 2), 
          print and (min-resolution: 192dpi) {
     .print-table,
     .print-table th,
     .print-table td {
       border-width: 0.5pt !important;
     }
        .signature-line {
       border-width: 0.5pt;
     }
   }
 
   /* Print preview styles */
   .print-container {
     background: white;
   }
 
   .print-page {
     background: white;
     box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
     margin-bottom: 20px;
   }
 
   .print-table {
     width: 100%;
    
   }
     .print-table {
       -webkit-print-color-adjust: exact;
       color-adjust: exact;
     }
 
     .print-table th {
       background-color: #f3f4f6 !important;
       -webkit-print-color-adjust: exact;
       color-adjust: exact;
     }
        /* Font faces */
   @font-face {
     font-family: 'FML-TTAyilyamBold';
     src: url('../fonts/FMLAL0NTT.ttf') format('truetype');
     font-weight: normal;
     font-style: normal;
   }
   @font-face {
     font-family: 'FML-TTGopika';
     src: url('../fonts/FMLGP0BTT.ttf') format('truetype');
     font-weight: normal;
     font-style: normal;
   }
   @font-face {
     font-family: 'FML-TTGopika1';
     src: url('../fonts/FMLGP0NTT.ttf') format('truetype');
     font-weight: normal;
     font-style: normal;
   }
   @font-face {
     font-family: 'FML-TTJaya';
     src: url('../fonts/FMLJA0ITT.ttf') format('truetype');
     font-weight: normal;
     font-style: normal;
   }
   @font-face {
     font-family: 'FML-TTJyothy';
     src: url('../fonts/FMLJY0NTT.ttf') format('truetype');
     font-weight: normal;
     font-style: normal;
   }
 
   /* Malayalam text classes */
   .malayalam-text { font-family: 'FML-TTAyilyamBold', sans-serif; }
   .malayalam-text1 { font-family: 'FML-TTGopika', sans-serif; }
   .malayalam-text2 { font-family: 'FML-TTJaya', sans-serif; }
   .malayalam-text3 { font-family: 'FML-TTGopika1', sans-serif; }
   .malayalam-text4 { font-family: 'FML-TTJyothy', sans-serif; }
   .malayalam-text5 { font-family: 'ML-TTRevathi', sans-serif; }
 
   /* Table styles */
   .print-table {
     width: 100%;
     border-collapse: collapse;
     border: 2px solid #000;
     margin-bottom: 20px;
   }
 
   .print-table th,
   .print-table td {
     border: 1px solid #000;
     padding: 8px;
     font-size: 14px;
   }
 
   .print-table th {
     background-color: #f3f4f6;
     font-weight: bold;
     text-align: center;
   }
 
   .print-table .text-center { text-align: center; }
   .print-table .text-right { text-align: right; }
   .print-table .font-bold { font-weight: bold; }
 
   .total-row td {
     border-top: 2px solid #000;
     border-bottom: 2px solid #000;
   }
 
   /* Column widths */
   .serial-column { width: 40px; }
   .name-column { width: 120px; }
   .relation-column { width: 100px; }
   .gender-column { width: 60px; }
   .date-column { width: 100px; }
   .occupation-column { width: 100px; }
   .education-column { width: 100px; }
   .amount-column { width: 60px; }
 `;
 // Styles
 const styles = `
   @media print {
     @page {
       size: A4;
       margin: 0;
     }
 
     body * {
       visibility: hidden;
     }
 
     .print-section,
     .print-section * {
       visibility: visible;
     }
 
     .print-section {
       position: absolute;
       left: 0;
       top: 0;
       width: 225mm;
       height: 297mm;
       padding: 1mm;
       margin: 0;
     }
 
     .dialog-buttons,
     .no-print {
       display: none !important;
     }
 
     .print-table {
       -webkit-print-color-adjust: exact;
       color-adjust: exact;
     }
 
     .print-table th {
       background-color: #f3f4f6 !important;
       -webkit-print-color-adjust: exact;
       color-adjust: exact;
     }
 
     /* Page break handling */
     .print-section {
       page-break-after: always;
     }
     
     .print-section:last-child {
       page-break-after: auto;
     }
   }
 
   @media print and (-webkit-min-device-pixel-ratio: 2), 
          print and (min-resolution: 192dpi) {
     .print-table,
     .print-table th,
     .print-table td {
       border-width: 0.5pt;
     }
 
     .signature-line {
       border-width: 0.5pt;
     }
   }
 
   /* Font faces */
   @font-face {
     font-family: 'FML-TTAyilyamBold';
     src: url('../fonts/FMLAL0NTT.ttf') format('truetype');
     font-weight: normal;
     font-style: normal;
   }
   @font-face {
     font-family: 'FML-TTGopika';
     src: url('../fonts/FMLGP0BTT.ttf') format('truetype');
     font-weight: normal;
     font-style: normal;
   }
   @font-face {
     font-family: 'FML-TTGopika1';
     src: url('../fonts/FMLGP0NTT.ttf') format('truetype');
     font-weight: normal;
     font-style: normal;
   }
   @font-face {
     font-family: 'FML-TTJaya';
     src: url('../fonts/FMLJA0ITT.ttf') format('truetype');
     font-weight: normal;
     font-style: normal;
   }
   @font-face {
     font-family: 'FML-TTJyothy';
     src: url('../fonts/FMLJY0NTT.ttf') format('truetype');
     font-weight: normal;
     font-style: normal;
   }
 
   /* Malayalam text classes */
   .malayalam-text { font-family: 'FML-TTAyilyamBold', sans-serif; }
   .malayalam-text1 { font-family: 'FML-TTGopika', sans-serif; }
   .malayalam-text2 { font-family: 'FML-TTJaya', sans-serif; }
   .malayalam-text3 { font-family: 'FML-TTGopika1', sans-serif; }
   .malayalam-text4 { font-family: 'FML-TTJyothy', sans-serif; }
   .malayalam-text5 { font-family: 'ML-TTRevathi', sans-serif; }
 
   /* Table styles */
   .print-table {
     width: 100%;
     border-collapse: collapse;
     border: 2px solid #000;
     margin-bottom: 20px;
   }
 
   .print-table th,
   .print-table td {
     border: 1px solid #000;
     padding: 8px;
     font-size: 14px;
   }
 
   .print-table th {
     background-color: #f3f4f6;
     font-weight: bold;
     text-align: center;
   }
 
   .print-table .text-center { text-align: center; }
   .print-table .text-right { text-align: right; }
   .print-table .font-bold { font-weight: bold; }
 
   .total-row td {
     border-top: 2px solid #000;
     border-bottom: 2px solid #000;
   }
 
   /* Column widths */
   .serial-column { width: 40px; }
   .name-column { width: 120px; }
   .relation-column { width: 100px; }
   .gender-column { width: 60px; }
   .date-column { width: 100px; }
   .occupation-column { width: 100px; }
   .education-column { width: 100px; }
   .amount-column { width: 60px; }
 `;
 style.textContent = printStyles;
// document.head.appendChild(style);
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handlePrint = () => {
    setPrintDialogOpen(false);
    setTimeout(() => {
      window.print();
    }, 100);
  };
  const handleLoadData = async (filters) => {
    setLoading(true);
    try {
     
      if (!filters.forane || !filters.parish || !filters.koottayma) {
        throw new Error('Forane, Parish and Koottayma IDs are required');
      }
      const response = await axiosInstance.get(
        `/family/bulk-family-data/${filters.forane}/${filters.parish}/${filters.koottayma}`
      );

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid data format received');
      }
      console.log(response.data);
      setFamiliesData(response.data);
    } catch (error) {
      console.error('Error loading bulk data:', error);
      // Add error handling here - could show a notification or error message
    } finally {
      setLoading(false);
    }
  };

  // Dialog component
  const BulkPrintDialog = () => {
    const [filters, setFilters] = useState({
      forane: '',
      parish: '',
      koottayma: ''
    });
    const [options, setOptions] = useState({
      foranes: [],
      parishes: [],
      koottaymas: []
    });
    const [isLoading, setIsLoading] = useState({
      foranes: false,
      parishes: false,
      koottaymas: false
    });
      // Fetch forane options when component mounts
      useEffect(() => {
        const fetchForanes = async () => {
          setIsLoading(prev => ({ ...prev, foranes: true }));
          try {
            const response = await axiosInstance.get('/forane');
            setOptions(prev => ({ ...prev, foranes: response.data || [] }));
          } catch (error) {
            console.error('Error fetching foranes:', error);
          } finally {
            setIsLoading(prev => ({ ...prev, foranes: false }));
          }
        };
        fetchForanes();
      }, []);
  
      // Fetch parish options when forane is selected
      useEffect(() => {
        const fetchParishes = async () => {
          if (!filters.forane) {
            setOptions(prev => ({ ...prev, parishes: [] }));
            setFilters(prev => ({ ...prev, parish: '', koottayma: '' }));
            return;
          }
          setIsLoading(prev => ({ ...prev, parishes: true }));
          try {
            const response = await axiosInstance.get(`/parish/forane/${filters.forane}`);
            setOptions(prev => ({ ...prev, parishes: response.data || [] }));
          } catch (error) {
            console.error('Error fetching parishes:', error);
          } finally {
            setIsLoading(prev => ({ ...prev, parishes: false }));
          }
        };
        fetchParishes();
      }, [filters.forane]);
  
      // Fetch koottayma options when parish is selected
      useEffect(() => {
        const fetchKoottaymas = async () => {
          if (!filters.parish) {
            setOptions(prev => ({ ...prev, koottaymas: [] }));
            setFilters(prev => ({ ...prev, koottayma: '' }));
            return;
          }
          setIsLoading(prev => ({ ...prev, koottaymas: true }));
          try {
            const response = await axiosInstance.get(`/koottayma/parish/${filters.parish}`);
            setOptions(prev => ({ ...prev, koottaymas: response.data || [] }));
          } catch (error) {
            console.error('Error fetching koottaymas:', error);
          } finally {
            setIsLoading(prev => ({ ...prev, koottaymas: false }));
          }
        };
        fetchKoottaymas();
      }, [filters.parish]);

    const handleFilterChange = (event) => {
      const { name, value } = event.target;
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    };

  
    if (!printDialogOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Bulk Print Family Details</h2>
            <button 
              onClick={() => setPrintDialogOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full">
              <CloseIcon />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium">Forane</label>
              <div className="relative">
                <select
                  name="forane"
                  value={filters.forane}
                  onChange={handleFilterChange}
                  className="w-full border rounded-md p-2 pr-8 appearance-none"
                >
                  <option value="">Select Forane</option>
                  {options.foranes.map(forane => (
                    <option key={forane._id} value={forane._id}>
                      {forane.name}
                    </option>
                  ))}
                </select>
                <KeyboardArrowDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500" />
              </div>
            </div>
            
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium">Parish</label>
              <div className="relative">
                <select
                  name="parish"
                  value={filters.parish}
                  onChange={handleFilterChange}
                  className="w-full border rounded-md p-2 pr-8 appearance-none"
                >
                  <option value="">Select Parish</option>
                  {options.parishes.map(parish => (
                    <option key={parish._id} value={parish._id}>
                      {parish.name}
                    </option>
                  ))}
                </select>
                <KeyboardArrowDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500" />
              </div>
            </div>
            
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium">Koottayma</label>
              <div className="relative">
                <select
                  name="koottayma"
                  value={filters.koottayma}
                  onChange={handleFilterChange}
                  className="w-full border rounded-md p-2 pr-8 appearance-none"
                >
                  <option value="">Select Koottayma</option>
                  {options.koottaymas.map(koottayma => (
                    <option key={koottayma._id} value={koottayma._id}>
                      {koottayma.name}
                    </option>
                  ))}
                </select>
                <KeyboardArrowDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500" />
              </div>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center items-center h-32">
              <CircularProgress />
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setPrintDialogOpen(false)}
              className="px-4 py-2 border rounded-md hover:bg-gray-50 flex items-center gap-2"
            >
              <CloseIcon />
              Close
            </button>
            <button 
              onClick={() => handleLoadData(filters)}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 flex items-center gap-2"
            >
              <LocalPrintshopIcon />
              Load Data
            </button>
            <button 
              onClick={handlePrint}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300 flex items-center gap-2"
            >
              <PrintIcon />
              Print
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <button 
        onClick={() => setPrintDialogOpen(true)}
        className="no-print px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
      >
        <PrintIcon />
        Open Bulk Print
      </button>

      {printDialogOpen && (
        <BulkPrintDialog 
          onClose={() => setPrintDialogOpen(false)}
          onPrint={handlePrint}
          onLoadData={handleLoadData}
          loading={loading}
        />
      )}

      <div className="print-container">
        {familiesData.length > 0 && (
          <BulkPrintLayout
            families={familiesData}
            currentYear={currentYear}
          />
        )}
      </div>
    </div>
  );
};

// const style = document.createElement('style');
// style.textContent = printStyles;
// document.head.appendChild(style);
export default BulkFamilyPrintSystem;

<style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container {
            visibility: visible !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print-container * {
            visibility: visible !important;
          }
          
          .select-section, .button-section {
            display: none !important;
          }
        }
        .print-table {
          width: 100%;
          border-collapse: collapse;
        }
        .print-table th,
        .print-table td {
          border: 1px solid black;
          padding: 4px;
        }
        .malayalam-text {
          font-family: 'Noto Sans Malayalam', sans-serif;
        }
        .text-center {
          text-align: center;
        }
        .text-right {
          text-align: right;
        }  
         @page {
    size: A4;
    margin: 15mm;
  }
  @media print {
    html, body {
      height: auto !important;
      overflow: visible !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      background-color: white !important;
    }
    
    * {
      overflow: visible !important;
    }
    
    .MuiPaper-root {
      box-shadow: none !important;
      overflow: visible !important;
    }
    
    .print-content {
      position: static !important;
      transform: none !important;
      overflow: visible !important;
      height: auto !important;
    }
    
    .MuiTableContainer-root {
      overflow: visible !important;
      break-inside: auto !important;
    }
    
    .MuiTable-root {
      width: 100% !important;
      break-inside: auto !important;
      page-break-inside: auto !important;
    }
    
    .MuiTableHead-root {
      display: table-header-group !important;
    }
    
    .MuiTableBody-root {
      display: table-row-group !important;
    }
    
    .MuiTableRow-root {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    
    .MuiTableCell-root {
      border: 1px solid black !important;
      color: black !important;
    }
    
    .MuiTypography-root {
      color: black !important;
    }
    
    .MuiDivider-root {
      margin: 24px 0 !important;
      border-color: black !important;
    }
    
    .no-print {
      display: none !important;
    }

    .print-container,
    .print-container * {
      visibility: visible;
    }
 * {
      overflow: visible !important;
    }
    .print-page {
      break-after: page;
      page-break-after: always;
      margin: 0 !important;
      border: initial !important;
      border-radius: initial !important;
      width: initial !important;
      min-height: initial !important;
      box-shadow: initial !important;
      background: initial !important;
      page-break-after: always !important;
    }

    .print-page:last-child {
      page-break-after: auto;
    }

    .print-table {
     
      table-layout: fixed;
    }

    .dialog-buttons,
    .no-print {
      display: none !important;
    }

    .MuiDialogContent-root {
      overflow: visible !important;
    }

    /* Ensure table headers print with background */
    .print-table th {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      background-color: #f3f4f6 !important;
    }

    /* Force page breaks */
    .print-page {
      break-inside: avoid;
    }
  

  /* High DPI print settings */
  @media print and (-webkit-min-device-pixel-ratio: 2), 
         print and (min-resolution: 192dpi) {
    .print-table,
    .print-table th,
    .print-table td {
      border-width: 0.5pt !important;
    }
       .signature-line {
      border-width: 0.5pt;
    }
  }

  /* Print preview styles */
  .print-container {
    background: white;
  }

  .print-page {
    background: white;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
  }

  .print-table {
    width: 100%;
   
  }
    .print-table {
      -webkit-print-color-adjust: exact;
      color-adjust: exact;
    }

    .print-table th {
      background-color: #f3f4f6 !important;
      -webkit-print-color-adjust: exact;
      color-adjust: exact;
    }
       /* Font faces */
  @font-face {
    font-family: 'FML-TTAyilyamBold';
    src: url('../fonts/FMLAL0NTT.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
  @font-face {
    font-family: 'FML-TTGopika';
    src: url('../fonts/FMLGP0BTT.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
  @font-face {
    font-family: 'FML-TTGopika1';
    src: url('../fonts/FMLGP0NTT.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
  @font-face {
    font-family: 'FML-TTJaya';
    src: url('../fonts/FMLJA0ITT.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
  @font-face {
    font-family: 'FML-TTJyothy';
    src: url('../fonts/FMLJY0NTT.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }

  /* Malayalam text classes */
  .malayalam-text { font-family: 'FML-TTAyilyamBold', sans-serif; }
  .malayalam-text1 { font-family: 'FML-TTGopika', sans-serif; }
  .malayalam-text2 { font-family: 'FML-TTJaya', sans-serif; }
  .malayalam-text3 { font-family: 'FML-TTGopika1', sans-serif; }
  .malayalam-text4 { font-family: 'FML-TTJyothy', sans-serif; }
  .malayalam-text5 { font-family: 'ML-TTRevathi', sans-serif; }

  /* Table styles */
  .print-table {
    width: 100%;
    border-collapse: collapse;
    border: 2px solid #000;
    margin-bottom: 20px;
  }

  .print-table th,
  .print-table td {
    border: 1px solid #000;
    padding: 8px;
    font-size: 14px;
  }

  .print-table th {
    background-color: #f3f4f6;
    font-weight: bold;
    text-align: center;
  }

  .print-table .text-center { text-align: center; }
  .print-table .text-right { text-align: right; }
  .print-table .font-bold { font-weight: bold; }

  .total-row td {
    border-top: 2px solid #000;
    border-bottom: 2px solid #000;
  }

  /* Column widths */
  .serial-column { width: 40px; }
  .name-column { width: 120px; }
  .relation-column { width: 100px; }
  .gender-column { width: 60px; }
  .date-column { width: 100px; }
  .occupation-column { width: 100px; }
  .education-column { width: 100px; }
  .amount-column { width: 60px; }

       }
        
        `}</style> 