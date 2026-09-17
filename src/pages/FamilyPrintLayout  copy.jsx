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
import Parish from './Parish';

// Utility function for safe date formatting
const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return isValid(date) ? format(date, 'dd-MM-yyyy') : '';
  } catch (error) {
    return '';
  }
};

// Print Layout Component
const FamilyPrintLayout = ({ 
  familyData, 
  parishInfo, 
  koottaymaInfo, 
  transactions,
  persons,
  currentYear 
}) => {
  return (
    <div className="print-section" style={{
        padding: '1mm',
        width: '210mm',
        height: '297mm',
        backgroundColor: 'white',
      }}>
  <div className="header-section" style={{
        display: 'flex',
        gap: '20px',
        marginBottom: '20px',
      }}>
        <div className="seal" style={{
          width: '210px',
          height: '150px',
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
            lineheight: '1',
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
      <hr style={{ 
  borderTop: '2px solid currentColor', 
  width: '225mm',
  fontWeight: 'bold',
  marginBottom: '0'
}} /><hr style={{marginTop: '0px',borderTop: '2px solid currentColor', fontWeight: 'bold', width: '225mm'}}/>
{/* Details Grid */}
<div className="family-details-container" style={{
  display: 'flex',
  gap: '20px',
  width:'230mm',
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
      justifyContent: 'space-between',
      border: '1px solid #000',
      borderRadius: '5px',
      padding: '10px',
      paddingBottom: '5px',
      paddingTop: '5px',
    }}>
      <span className="detail-label malayalam-text5" style={{
        fontWeight: 'bold',
        fontSize: '18px',
      }}>
      CShI :
      </span>
      <span className="detail-value">
      {[parishInfo.name]}
      </span>
    </div>
    <div className="detail-row" style={{
      display: 'flex',
      justifyContent: 'space-between',
      border: '1px solid #000',
      borderRadius: '5px',
      padding: '10px',
      paddingBottom: '5px',
      paddingTop: '5px', 
    }}>
      <span className="detail-label1 malayalam-text5" style={{
        fontWeight: 'bold',
        fontSize: '17px',
      }}>
        IpSpw_ \mY³/\mYbpsS \maw :
      </span>
      <span className="detail-value1">
       {/* {familyData.name} */}
      </span>
    </div>
    <div className="detail-row" style={{
      display: 'flex',
      justifyContent: 'space-between',
      border: '1px solid #000',
      borderRadius: '5px',
      padding: '10px',
      paddingBottom: '5px',
      paddingTop: '5px',
    }}>
      <span className="detail-label  malayalam-text5" style={{
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
      justifyContent: 'space-between',
      border: '1px solid #000',
      borderRadius: '5px',
      padding: '10px',
      paddingBottom: '5px',
      paddingTop: '5px',
    }}>
      <span className="detail-label  malayalam-text5" style={{
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
      justifyContent: 'space-between',
      border: '1px solid #000',
      borderRadius: '5px',
      padding: '10px',
      paddingBottom: '5px',
      paddingTop: '5px',
    }}>
      <span className="detail-label  malayalam-text5" style={{
        fontWeight: 'bold',
        fontSize: '18px',
      }}>
        hnemkw :
      </span>
      <span className="detail-value">
      {/* {familyData.} */}
      </span>
    </div>
    <div className="detail-row" style={{
      display: 'flex',
      justifyContent: 'space-between',
      border: '1px solid #000',
      borderRadius: '5px',
      padding: '10px',
      paddingBottom: '5px',
      paddingTop: '5px',
    }}>
      <span className="detail-label  malayalam-text5" style={{
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

      {/* Main Table */}
      <table className="print-table" style={{  
  width:'225mm', 
}}>
        <thead>
          <tr>
            <th className="serial-column malayalam-text5" style={{ fontSize: '12px'}}>{`{Ia \\¼À`}</th>
            <th className="name-column malayalam-text5"  style={{fontSize: '12px'}}>amt½mZok t]cv</th>
            <th className="name-column malayalam-text5"  style={{ fontSize: '12px'}}>hnfn¡p¶ t]cv</th>
            <th className="relation-column malayalam-text5"  style={{fontSize: '12px'}}>IpSpw_ \mY\pambpÅ _Ôw</th>
            <th className="gender-column malayalam-text5"  style={{fontSize: '12px'}}>{`]p/kv{Xo`}</th>
            <th className="date-column malayalam-text5"  style={{ fontSize: '12px'}}>P\\ XobXn</th>
            <th className="occupation-column malayalam-text5"  style={{  fontSize: '12px'}}>sXmgnÂ</th>
            <th className="education-column malayalam-text5"  style={{fontSize: '12px'}}>hnZym`ymkw</th>
            <th className="amount-column malayalam-text5"  style={{ fontSize: '12px'}}>Zimwiw 2003 -{currentYear-1}</th>
            <th className="amount-column malayalam-text5" style={{ fontSize: '12px'}}>Zimwiw {currentYear}</th> 
          </tr>
        </thead>
        <tbody>
          {persons?.map((member, index) => (
            <tr key={index}>
              <td className="text-center" style={{ fontSize: '10px'}}>{index + 1}</td>
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
                {transactions?.find(t => t.personId === member._id)?.currentYearAmount || 0}
              </td>
            </tr>
          ))}
          {/* (Existing empty row handling code) */}
          {[...Array(15 - (persons?.length || 0))].map((_, index) => (
            <tr key={`empty-${index}`}>
              {[...Array(10)].map((_, colIndex) => (
                <td key={`empty-${index}-${colIndex}`}>&nbsp;</td>
              ))}
            </tr>
          ))}
          <tr className="total-row">
            <td colSpan="8" className="text-right font-bold">TOTAL</td>
            <td className="text-right font-bold" style={{ fontSize: '10px'}}>
              {transactions?.reduce((sum, t) => sum + (t.totalAmount || 0), 0)}
            </td>
            <td className="text-right font-bold" style={{ fontSize: '10px'}}>
              {transactions?.reduce((sum, t) => sum + (t.currentYearAmount || 0), 0)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Signature Section */}
      <div className="signature-section" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '40px',
        padding: '20px',
        border: '1px solid #000',
        borderRadius: '10px',
        width: '226mm'
       }}>
        <div className="signature-blocks" style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
        }}>
          <div className="signature-block">
            <p className="malayalam-text5" style={{
        fontSize: '16px',      
       }}>IpSpw_\mYsâ t]cpw H¸pw </p>
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
            <p className="malayalam-text5" style={{
        fontSize: '16px',      
       }}>hnImcnbpsS t]cpw H¸pw</p>
            <div className="signature-line" style={{
              width: '200px',
             
              marginTop: '40px',
              marginLeft: 'auto',
            }}></div>
          </div>
        </div>
        <p className="seal-text malayalam-text5" style={{
         marginTop: '-65px',
          fontSize: '16px',
        }}>(]ÅnbpsS koÂ)</p>
      </div>
      {/* Notes Section */}
      <div className="notes-section" style={{width: '226mm', paddingTop: '0',
            marginTop: '5px'}}>
        <p className="malayalam-text5">   ➔ {`Cu t^md¯nÂ Fs´¦nepw Xncp¯epIÄ Dsï¦nÂ Ah \n§fpsS t]cn\p XmsgbpÅ tImf¯nÂ hyàambn FgpXn \ÂtIïXmWv.`}</p>
        <p className="malayalam-text5">   ➔ {`t]cphnhc§Ä I¼yq«dnÂ B¡p¶Xn\p kuIcy{]Zamb coXnbnÂ Cw¥ojnÂ FgpXphm\pw, FÃm tImf§fpw ]qcn¸n¡m\pw {i²n¡pI.`}</p>
        <p className="malayalam-text5">   ➔ {`IpSpw_\mYsâbpw IpSpw_mwK§fpsS ho«pt]cpÅ]£w {i²m³ DÄs¸sS Ah hyàns¸Sp¯ïXmWv.`}</p>
        <p className="malayalam-text5">   ➔ {`Cu enkvänÂ acWs¸«hcpsï¦nÂ AhcpsS t]cn\p Xmsg "acWs¸«p" F¶pw acWXobXnbpsS Xmsg acWXobXnbpw FgpXWw.`}</p>
      </div>

      {/* Page Number */}
      {/* <div className="page-number">Page 1</div> */}
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
        <div className="flex justify-between items-center">
          <span>Print Family Details</span>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent>
        <FamilyPrintLayout
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

// Styles
const styles = `
  /* Print Layout Styles */
  .print-section {
    padding: 20mm;
    background: white;
    width: 230mm;
    min-height: 297mm;
    position: relative;
  }

  /* Header Styles */
  .header-section {
    display: flex;
    gap: 20px;
    margin-bottom: 35px;
  }
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
            
            .malayalam-text {
            font-family: 'FML-TTAyilyamBold', sans-serif;
        }
        .malayalam-text1 {
            font-family: 'FML-TTGopika', sans-serif;
        }
        .malayalam-text2 {
            font-family: 'FML-TTJaya', sans-serif;
        }
        .malayalam-text3 {
            font-family: 'FML-TTGopika1', sans-serif;
        }
        .malayalam-text4 {
            font-family: 'FML-TTJyothy', sans-serif;
        }
        .malayalam-text5 {
            font-family: 'ML-TTRevathi', sans-serif;
        }
  .seal {
    width: 150px;
    height: 96px;
  }

  .seal-image {
    width: 100%;
    height: 100%;
    border-radius: 50%;

  }

  .title-section {
    flex-grow: 1;
    text-align: center;
  }

  .main-title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 4px;
  }

  .sub-title {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 4px;
  }

  .subtitle-text {
    font-size: 16px;
    margin-bottom: 4px;
  }

  .verse-text {
    font-size: 14px;
  }

  /* Details Grid */
  .details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-bottom: 20px;
    border-bottom: 1px solid #000;
    padding-bottom: 10px;
  }

  .detail-row {
    display: flex;
    margin-bottom: 10px;
  }

  .detail-label {
    width: 40%;
    font-weight: bold;
  }

  .detail-value {
    width: 60%;
  }
    .detail-label1 {
    width: 60%;
    font-weight: bold;
  }

  .detail-value1 {
    width: 40%;
  }

  /* Table Styles */
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

  .print-table .text-center {
    text-align: center;
  }

  .print-table .text-right {
    text-align: right;
  }

  .print-table .font-bold {
    font-weight: bold;
  }

  .total-row td {
    border-top: 2px solid #000;
    border-bottom: 2px solid #000;
  }

  /* Column Widths */
  .serial-column { width: 40px; }
  .name-column { width: 120px; }
  .relation-column { width: 100px; }
  .gender-column { width: 60px; }
  .date-column { width: 100px; }
  .occupation-column { width: 100px; }
  .education-column { width: 100px; }
  .amount-column { width: 60px; }
  /* Signature Section */
  .signature-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    margin-top: 40px;
  }

  .signature-block {
    position: relative;
  }

  .signature-block.right {
    text-align: right;
  }

  .signature-line {
    width: 200px;
   
    margin-top: 40px;
  }

  .signature-block.right .signature-line {
    margin-left: auto;
  }

  .date-text {
    margin-top: 8px;
    font-size: 14px;
  }

  .seal-text {
    
    font-size: 14px;
  }

  /* Notes Section */
  .notes-section {
    margin-top: 40px;
    font-size: 14px;
  }

  .notes-section p {
    margin-bottom: 6px;
    line-height: 1.4;
  }

  /* Page Number */
  .page-number {
    position: absolute;
    bottom: 20px;
    right: 20px;
    font-size: 14px;
  }

  /* Print-specific styles */
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
      width: 210mm;
      height: 297mm;
      padding: 15mm;
      margin: 0;
    }

    .dialog-buttons,
    .no-print {
      display: none !important;
    }

    /* Ensure table borders print correctly */
    .print-table {
      -webkit-print-color-adjust: exact;
      color-adjust: exact;
    }

    .print-table th {
      background-color: #f3f4f6 !important;
      -webkit-print-color-adjust: exact;
      color-adjust: exact;
    }

    /* Force page breaks */
    .print-section {
      page-break-after: always;
    }
  }

  /* High-DPI Print Optimizations */
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

  /* RTL Support for Malayalam Text */
  // .malayalam-text {
  //   font-family: 'Manjari', 'Noto Sans Malayalam', sans-serif;
  //   line-height: 1.5;
  // }
`;

// Add styles to document
const style = document.createElement('style');
style.textContent = styles;
document.head.appendChild(style);

export default FamilyPrintSystem;