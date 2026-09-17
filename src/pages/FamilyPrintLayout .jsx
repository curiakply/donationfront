import React, { useState, useEffect } from 'react';
import { 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { Print as PrintIcon, Close as CloseIcon } from '@mui/icons-material';
import { format, isValid } from 'date-fns'; 



// Header component that will be reused across pages
const PageHeader = ({ currentYear, parishInfo }) => (
  <div className="header-section" style={{
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
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

// Family Details Component
const FamilyDetails = ({ familyData, parishInfo, koottaymaInfo }) => (
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

// Table component that will be used on each page
const MemberTable = ({ currentYear,members, transactions, showTotals = false, startIndex = 0 }) => (

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
            {transactions?.find(t => t.personId === member._id)?.totalAmount || 0}
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
            {transactions?.reduce((sum, t) => sum + (t.totalAmount || 0), 0)}
          </td>
          <td className="text-right font-bold" style={{ fontSize: '10px'}}>
            {/* {transactions?.reduce((sum, t) => sum + (t.currentYearAmount || 0), 0)} */}
          </td>
        </tr>
      )}
    </tbody>
  </table>
);

// Footer component with signatures and notes
const PageFooter = ({ showSignatures = true }) => (
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

// PaginatedFamilyPrintLayout Component
const PaginatedFamilyPrintLayout = ({
  familyData,
  parishInfo,
  koottaymaInfo,
  transactions,
  persons,
  currentYear
}) => {
  // Calculate number of pages needed
  const membersPerPage = 15;
  const totalMembers = persons?.length || 0;
  const totalPages = Math.ceil(totalMembers / membersPerPage);

  return (
    <div className="print-container" style={{
      width: '100%',
      maxWidth: '100%',
      margin: '0 auto',
      backgroundColor: 'white'
    }}>
      {Array.from({ length: totalPages }, (_, pageIndex) => {
        const startIndex = pageIndex * membersPerPage;
        const pageMembers = persons.slice(startIndex, startIndex + membersPerPage);
        const isLastPage = pageIndex === totalPages - 1;
        console.log(pageMembers);
        return (
          <div key={pageIndex} className="print-page" style={{
            width: '285mm',
            minHeight: '297mm',
            margin: '0 auto',
            padding: '10mm',
            boxSizing: 'border-box',
            position: 'relative',
            backgroundColor: 'white',
            pageBreakAfter: isLastPage ? 'auto' : 'always',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <PageHeader currentYear={currentYear} parishInfo={parishInfo} />
            
            <hr style={{ 
              margin: '0',
              border: 'none',
              borderTop: '2px solid black'
            }} />
            <hr style={{
              margin: '1px 0 10px 0',
              border: 'none',
              borderTop: '2px solid black'
            }} />
{/* 
            {pageIndex === 0 && ( */}
              <FamilyDetails
                familyData={familyData}
                parishInfo={parishInfo}
                koottaymaInfo={koottaymaInfo}
              />
            {/*  )} */}

            <div style={{ flex: 1 }}>
              
              <MemberTable
                members={pageMembers}
                transactions={transactions}
                showTotals={isLastPage}
                startIndex={startIndex}
              />
            </div>

            { <PageFooter showSignatures={true} />}
            
            <div style={{
              position: 'absolute',
              bottom: '5mm',
              right: '10mm',
              fontSize: '12px'
            }}>
              Page {pageIndex + 1} of {totalPages}
            </div>
          </div>
        );
      })}
    </div>
  );
};


// Print Dialog Component
const PrintDialog = ({ 
  open, 
  onClose, 
  familyData,
  parishInfo,
  koottaymaInfo,
  transactions,
  persons,
  currentYear
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
    >
      <DialogTitle>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>Print Family Details</span>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent>
        <PaginatedFamilyPrintLayout
          familyData={familyData}
          parishInfo={parishInfo}
          koottaymaInfo={koottaymaInfo}
          transactions={transactions}
          persons={persons}
          currentYear={currentYear}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button 
          onClick={handlePrint}
          variant="contained" 
          startIcon={<PrintIcon />}
        >
          Print
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Controller Component
const FamilyPrintSystem = () => {
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  return {
    PrintDialog,
    openPrintDialog: () => setPrintDialogOpen(true),
    closePrintDialog: () => setPrintDialogOpen(false),
    printDialogOpen,
  };
};
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

// Add styles to document
const style = document.createElement('style');
style.textContent = printStyles;
document.head.appendChild(style);

export default FamilyPrintSystem;



