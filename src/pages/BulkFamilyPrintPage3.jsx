import React, { useState, useEffect } from 'react';
import axiosInstance from "../axiosConfig";
import { useFinancialYear } from './FinancialYearContext';

import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Stack,
  CircularProgress,
  Paper,
  Grid
} from '@mui/material';
import {
  Print as PrintIcon,
  LocalPrintshop as LocalPrintshopIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

const PageHeader = ({ currentYear, parishInfo,familyData }) => (
  <div className="header-section" style={{
    display: 'flex',
    gap: '20px',
    marginBottom: '5px',
  }}>
    <div className="seal" style={{
      width: '180px',
      height: '180px',
    }}>
      <img
        src="/Cross.jpg"
        alt="Parish Seal"
        className="seal-image"
        style={{
          width: '100%',
          borderRadius: '50%',
        }}
      />
    </div>
    <div className="title-section" style={{
      flexGrow: 0,
      textAlign: 'center',
    }}>
      <h1 className="main-title malayalam-text6" style={{
        fontSize: '55px',
        fontWeight: 'bold',
        marginBottom: '-30px',
        color: 'black',
      }}>
        Poh³  {currentYear}
      </h1>
      <h2 className="sub-title malayalam-text9" style={{
        fontSize: '35px',
        fontWeight: '600',
        marginBottom: '5px',
        lineHeight: '1',
        color: 'black',
        letterspacing:'1px',
      }}>
        Imªnc¸Ån cq]X 
      </h2>
      <p className="subtitle-text malayalam-text10" style={{
        fontSize: '23px',
         fontWeight: '600',
        marginBottom: '-8px',
        color: 'black',
        letterspacing: '1px',
      }}>
        ]¦phbv¡eneqsS Pohsâ kar²nbntebv¡v 
      </p>
      <p className="verse-text malayalam-text12" style={{
        fontSize: '20px',
        marginBottom: '0px',
        lineHeight: '1.6',
        color: 'black',
      }}>
        {`\\³a sN¿p¶Xnepw \\n§Ä¡pÅh ]¦phbv¡p¶Xnepw Dt]Ivj hcp¯cpXv. `}
      </p>
      <p className="verse-text malayalam-text12" style={{
        fontSize: '20px',
        marginBottom: '0px',
        lineHeight: '1.6',
        color: 'black',
      }}>
        {`A¯cw _enIÄ ssZh¯n\\p {]oXnIcamWv.(sl{_mbÀ 13:16)`}
      </p>
    </div>
    <div class="seal" 
        style={{width: '80px',
        height: '180px',
        flexGrow: '2',
        textAlign: 'right'}}>
      <h1 className="main-title malayalam-text14" 
          style={{fontSize: '15px',
          fontWeight: 'bold',
          marginBottom: '0px',
          color: 'black',
          textAlign: 'right',
          flex: 'unset'}}>{parishInfo.shortCode}{familyData.familyNumber}    </h1>
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
        border: '1px solid rgb(0 0 0 / 60%)',
         borderRadius: '5px', 
         padding: '5px 10px', 
        alignItems: 'baseline',       
       
      }}>
        <span className="detail-label malayalam-text5" style={{
          color: 'black',   
          fontSize: '20px',
        }}>
          CShI :  
        </span>
        <span className="detail-value malayalam-text14"style={{      
         fontWeight: 'bold',
         color: 'black',
         paddingLeft:'10px',
         fontSize:'15px' ,     
      }}>
          {parishInfo.name}  
        </span>
      </div>
      <div className="detail-row" style={{
       display: 'flex', 
       justifyContent: 'flex-start', 
       border: '1px solid rgb(0 0 0 / 60%)',
        borderRadius: '5px', 
        padding: '5px 10px', 
       alignItems: 'baseline' 
      }}>
        <span className="detail-label1 malayalam-text5" style={{
         color: 'black', 
          fontSize: '20px',
          
        }}>
          IpSpw_ \mYsâ /\mYbpsS t]cv : 
        </span>
        <span className="detail-value1 malayalam-text14"style={{
         fontWeight:'bold',
          paddingLeft:'5px',  
          color:'black',
         fontSize:'15px' ,  
        }}>
          {familyData.headname}
        </span>
      </div>
      <div className="detail-row" style={{
        display: 'flex', 
        justifyContent: 'flex-start', 
        border: '1px solid rgb(0 0 0 / 60%)',
         borderRadius: '5px', 
         padding: '5px 10px', 
        alignItems: 'baseline'
      }}>
        <span className="detail-label malayalam-text5" style={{
            color: 'black',   
          fontSize: '20px',
        }}>
          ho«pt]cv : 
        </span>
        <span className="detail-value malayalam-text14"style={{
         fontWeight:'bold',
          paddingLeft:'5px',  
          color:'black',
         fontSize:'15px' ,  
        }}>
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
        border: '1px solid rgb(0 0 0 / 60%)',
         borderRadius: '5px', 
         padding: '5px 10px', 
        alignItems: 'baseline',width: '425px',
      }}>
        <span className="detail-label malayalam-text5" style={{
          color: 'black',   
          fontSize: '20px',
        }}>
          Iq«mbva : 
        </span>
        <span className="detail-value malayalam-text14"style={{
         fontWeight:'400',
          paddingLeft:'5px',  
          color:'black',
         fontSize:'15px' ,  
        }}>
          {koottaymaInfo.name}
        </span>
      </div>
      <div className="detail-row" style={{
       display: 'flex', 
       justifyContent: 'flex-start', 
       border: '1px solid rgb(0 0 0 / 60%)',
        borderRadius: '5px', 
        padding: '5px 10px', 
       alignItems: 'baseline',width: '425px',
      }}>
        <span className="detail-label malayalam-text5" style={{
          color: 'black',   
          fontSize: '20px',
        }}>
          hnemkw : 
        </span>
        <span className="detail-value malayalam-text14"style={{
         fontWeight:'400',
          paddingLeft:'5px',  
          color:'black',
         fontSize:'15px' ,  
        }}>
          {familyData.building}
        </span>
      </div>
      <div className="detail-row" style={{
       display: 'flex', 
       justifyContent: 'flex-start', 
       border: '1px solid rgb(0 0 0 / 60%)',
        borderRadius: '5px', 
        padding: '5px 10px', 
       alignItems: 'baseline',width: '425px',
      }}>
        <span className="detail-label malayalam-text5" style={{
          color: 'black',   
          fontSize: '20px',
        }}>
          t^m¬ \¼À : 
        </span>
        <span className="detail-value"style={{
         fontWeight:'400',
          paddingLeft:'5px',  
          color:'black',
         fontSize:'15px' ,  
        }}>
          {familyData.phone}
        </span>
      </div>
    </div>
  </div>
);

// Table component that will be used on each page
const MemberTable = ({ currentYear,members, transactions, showTotals = false, startIndex = 0 }) => (

  <table className="print-table" style={{ width: '285mm', maxWidth: '100%' }}>
    <thead style={{  
      border: '1px solid rgba(0, 0, 0, 0.5)', 
      outline: '1px solid rgba(0, 0, 0, 0.5)',
      outlineOffset: '-3px',
    }}>
      <tr>
        <th className="serial-column malayalam-text5" style={{ fontSize: '19px',fontWeight:100,color:'black',}}>{`{Ia \\¼À`}</th>
        <th className="name-column malayalam-text5" style={{fontSize: '15px',fontWeight:100,color:'black',}}>amt½mZok t]cv</th>
        <th className="name-column malayalam-text5" style={{fontSize: '15px',fontWeight:100,color:'black',}}>hnfn¡p¶ t]cv</th>
        <th className="relation-column malayalam-text5" style={{fontSize: '15px',fontWeight:100,color:'black',}}>IpSpw_ \mY\pambpÅ _Ôw</th>
        <th className="gender-column malayalam-text5" style={{fontSize: '15px',fontWeight:100,color:'black',}}>{`]p/ kv{Xo`}</th>
        <th className="date-column malayalam-text5" style={{ fontSize: '15px',fontWeight:100,color:'black',}}>P\\ XobXn</th>
        <th className="occupation-column malayalam-text5" style={{fontSize: '15px',fontWeight:100,color:'black',}}>sXmgnÂ</th>
        <th className="education-column malayalam-text5" style={{fontSize: '15px',fontWeight:100,color:'black',}}>hnZym`ymkw</th>
     <th className="amount-column malayalam-text5" style={{ fontSize: '15px',fontWeight:100,color:'black',}}>
  Zimwiw <span style={{ fontFamily: 'Arial, sans-serif',fontSize: '15px' }}>2003<span style={{ fontFamily: 'Arial, sans-serif' }}>-</span>{(currentYear - 1).toString().slice(-2)}</span>
</th>
        <th className="amount-column malayalam-text5" style={{ fontSize: '15px',fontWeight:100,color:'black',}}>Zimwiw <span style={{ fontFamily: 'Arial, sans-serif',fontSize: '15px' }}>{currentYear}</span></th>
      </tr>
    </thead>
   <tbody>
  {members.map((member, index) => (
    <React.Fragment key={index}>
      <tr style={{height:'26px'}}>
        <td className="text-right malayalam-text14" style={{ fontSize: '15px',color:'black',paddingtop: '0px',paddingbottom: '0px',letterspacing: '.1px'}}>{startIndex + index + 1}</td>
        <td className="text-left malayalam-text15" style={{ fontSize: '15px',color:'black',paddingtop: '0px',paddingbottom: '0px',letterspacing: '.1px'}}>{member.baptismName === 'NULL' ? '' : member.baptismName}</td>
        <td className="text-left malayalam-text14" style={{ fontSize: '15px',color:'black',paddingtop: '0px',paddingbottom: '0px',letterspacing: 'normal'}}>{member.name === 'NULL' ? '' : member.name}</td>
        <td className="text-center malayalam-text15" style={{ fontSize: '11px', color: 'black',paddingtop: '0px',paddingbottom: '0px',letterspacing: 'normal' }}>
  {member.relation ? (member.relation.toUpperCase() === 'HEAD' ? 'FAMILY HEAD' : member.relation.toUpperCase()) : ''}
</td>
        <td className="text-center malayalam-text14" style={{ fontSize: '15px',color:'black',paddingtop: '0px',paddingbottom: '0px',letterspacing: '.1px'}}>{member.gender === 'male' ? 'M' : 'F'}</td>
        <td className="text-center malayalam-text15" style={{ fontSize: '12px',color:'black',paddingtop: '0px',paddingbottom: '0px',letterspacing: '.1px'}}></td>
        <td className="text-center malayalam-text15" style={{ fontSize: '11px',color:'black',paddingtop: '0px',paddingbottom: '0px',letterspacing: '.1px'}}>{member.occupation === 'NULL' ? '' : member.occupation}</td>
        <td className="text-center malayalam-text15" style={{ fontSize: '15px', color: 'black',paddingtop: '0px',paddingbottom: '0px',letterspacing: '.1px' }}>  {member.education === 'NULL' ? '' : member.education}
</td>
        <td className="text-right malayalam-text14" style={{ fontSize: '14px',color:'black',paddingtop: '0px',paddingbottom: '0px'}}> 
         {member.totalAmount}  
          {/* {transactions?.find(t => t.personId === member._id)?.totalAmount || 0}  */}
        </td> 
        <td className="text-right malayalam-text14" style={{ fontSize: '15px',color:'black',}}>
           {/* {transactions?.find(t => t.personId === member._id)?.currentYearAmount || 0}   */}
        </td> 
      </tr>
      <tr style={{height:'26px'}}>
        {[...Array(10)].map((_, colIndex) => (
          <td key={`even-${index}-${colIndex}`}>&nbsp;</td>
        ))}
      </tr>
    </React.Fragment>
  ))}
  {[...Array(Math.max(0, (22 - members.length * 2)))].map((_, index) => (
    <tr style={{height:'26px'}} key={`empty-${index}`}>
      {[...Array(10)].map((_, colIndex) => (
        <td key={`empty-${index}-${colIndex}`}>&nbsp;</td>
      ))}
    </tr>
  ))}
  {showTotals && ( 
    <tr className="total-row">
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
      <td  className="text-right malayalam-text15" style={{ color:'black'}} >TOTAL</td> 
      <td className="text-right malayalam-text14" style={{ fontSize: '14px',color:'black',}}> 
        {transactions?.reduce((sum, t) => sum + (t.amountPaid || 0), 0)} 
      </td> 
      <td className="text-right font-bold" style={{ fontSize: '10px',color:'black',}}> 
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
        border: '1px solid rgba(0, 0, 0, 0)',
        borderRadius: '10px',
         border: '1px solid rgba(0, 0, 0, 0.5)', 
      outline: '1px solid rgba(0, 0, 0, 0.5)',
      outlineOffset: '-3px',
      marginbottom: '0px',
      paddingBottom:'0px',
        
      }}>
        <div className="signature-blocks" style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
        }}>
          <div className="signature-block">
            <p className="malayalam-text5" style={{ fontSize: '19px',color:'black', }}>
              IpSpw_\mYsâ t]cpw H¸pw
            </p>
            <div className="signature-line" style={{
              width: '200px',
              marginTop: '40px',
            }}></div>
            <p className="date-text malayalam-text5" style={{
              marginTop: '10px',
              fontSize: '19px',color:'black',
            }}>XobXn</p>
          </div>
          <div className="signature-block right">
            <p className="malayalam-text5" style={{ fontSize: '19px',color:'black', }}>
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
          fontSize: '19px',color:'black',marginbottom: '0px',
        }}>(]ÅnbpsS koÂ)</p>
      </div>
    )}
   <div className="notes-section" style={{
    width: '246mm',
    paddingTop: '0',
    marginTop: '4px',
    position: 'relative'
}}>
    {/* NB Label */}
    <div className="malayalam-text14" style={{
        position: 'absolute',
        left: '0',
        top: '0',
        fontWeight: '400',
        fontSize: '14px',
        color: 'black'
    }}>
        NB
    </div>

    {/* Notes content with left padding for NB label */}
    <div style={{ paddingLeft: '40px' }}>
        <p className="malayalam-text5" style={{ marginBottom: '1px', color: 'black',letterSpacing:'.5px',fontSize: '12px' }}>
            <span className="malayalam-text13">➢</span> {`Cu t^md-¯nÂ Fs´-¦nepw Xncp-¯-ep-IÄ Ds­-ï¦nÂ Ah \\n§-fpsS  t]cn\\p Xmsg-bpÅ tImf-¯nÂ hyà-ambn Fgp-tX-­­­­­ï­-Xm-Wv.`}
        </p>
        <p className="malayalam-text5" style={{ marginBottom: '1px', color: 'black',letterSpacing:'.5px',fontSize: '12px' }}>
            <span className="malayalam-text13">➢</span> {`tcJ-IÄ UnPnässekv sN¿p-¶-Xn\\v kuI-cy-{]-Z-amb hn[-¯nÂ t]cp-IÄ Cw¥o-jnÂ Fgp-Xp-¶-Xn\\pw FÃm tImf-§fpw ]qcn-¸n-¡p-¶-Xn\\pw {i²n-¡p-I`}
        </p>
        <p className="malayalam-text5" style={{ marginBottom: '1px', color: 'black',letterSpacing:'.5px',fontSize: '12px' }}>
            <span className="malayalam-text13">➢</span> {`IpSpw-_mw-K-§-fpsS t]cp-hn-h-c-§Ä hn«p-t]m-bn-«p-s­-ï¦nÂ {Ia-\\-¼À DÄs¸sS Ah Fgp-Xn-t¨Àt¡-­-Xm-Wv.`}
        </p>
        <p className="malayalam-text5" style={{ marginBottom: '1px', color: 'black',letterSpacing:'.5px',fontSize: '12px' }}>
            <span className="malayalam-text13">➢</span> {`Cu enÌnÂ ac-W-a-S-ª-h-cp-s­-ï¦nÂ Ah-cpsS t]cn-\\p- Xmsg “ac-W-a-Sªp” F¶pw P\\-\\-Xo-b-Xn-bpsS tImf-¯nÂ ac-W-Xo-b-Xnbpw Fgp-X-Ww.`}
        </p>
    </div>
</div>
  </>
);

// New BulkPrintLayout component
const BulkPrintLayout = ({ families, currentYear }) => {
  return (
    <div className="print-container" style={{
      width: '100%',
      maxWidth: '100%',
      margin: '0 auto',
      backgroundColor: 'white'
    }}>
      {families.map((family, familyIndex) => (
        <div key={familyIndex} className="family-section">
          {Array.from({ length: Math.ceil(family.persons.length / 11) }, (_, pageIndex) => {
            const startIndex = pageIndex * 15;
            const pageMembers = family.persons.slice(startIndex, startIndex + 15);
            const isLastPage = pageIndex === Math.ceil(family.persons.length / 15) - 1;
            
            return (
              <div key={pageIndex} className="print-page" style={{
                width: '285mm',
                minHeight: '297mm',
                margin: '0 auto',
                padding: '10mm',
                paddingTop: '3mm',
                boxSizing: 'border-box',
                position: 'relative',
                backgroundColor: 'white',
                pageBreakAfter: isLastPage ? 'auto' : 'always',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <PageHeader  currentYear={currentYear} 
                      parishInfo={family.parishInfo}
                      familyData={family.familyData}  />
                 <div className="detail-row" style={{
        display: 'flex', 
        justifyContent: 'flex-start', 
        border: '1px solid rgb(0 0 0 / 40%)',
         borderRadius: '5px', 
         padding: '.4px 1px', 
        alignItems: 'baseline',  
        marginBottom:'2px',     
       
      }}>
        
      </div>
         <div className="detail-row" style={{
        display: 'flex', 
        justifyContent: 'flex-start', 
        border: '1px solid rgb(0 0 0 / 40%)',
        borderRadius: '5px', 
        padding: '.4px 1px', 
        alignItems: 'baseline',       
       
      }}>
        
      </div>
                {/* <hr style={{ 
                  margin: '0',
                  border: 'none',
                  borderTop: '2px solid black'
                }} />
                <hr style={{
                  margin: '1px 0 10px 0',
                  border: 'none',
                  borderTop: '2px solid black'
                }} /> */}
    {/* 
                {pageIndex === 0 && ( */}
                  <FamilyDetails
                   familyData={family.familyData}
                   parishInfo={family.parishInfo}
                   koottaymaInfo={family.koottaymaInfo}
                  />
                {/*  )} */}
    
                <div style={{ flex: 1 }}>
                  
                  <MemberTable
                    currentYear={currentYear}
                    members={pageMembers}
                    transactions={family.transactions}
                    showTotals={isLastPage}
                    startIndex={startIndex}
                  />
                </div>
    
                { <PageFooter showSignatures={true} />}
                     {/* Decorative line with stars and page number */}
    <div style={{
        marginTop: '16px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }}>
        {/* Horizontal line spanning full width */}
        <div style={{
            position: 'absolute',
            top: '50%',
            left: '0',
            right: '0',
            height: '1px',
            backgroundColor: 'black',
            zIndex: 0
        }}></div>

        {/* Left star on the line */}
        <span className="malayalam-text13" style={{
            position: 'absolute',
            left: '0',
            fontSize: '16px',
            color: 'black',
            backgroundColor: 'white',
            zIndex: 1
        }}>ï</span>

        {/* Page number centered above the line */}
        {/* <span style={{
            fontSize: '14px',
            color: 'black',
            backgroundColor: 'white',
            paddingLeft: '8px',
            paddingRight: '8px',
            zIndex: 1,
            position: 'relative'
        }}>Page 1</span> */}

        {/* Right star on the line */}
        <span className="malayalam-text13" style={{
            position: 'absolute',
            right: '0',
            fontSize: '16px',
            color: 'black',
            backgroundColor: 'white',
            zIndex: 1
        }}>ï</span>
    </div>

                <div className="malayalam-text14" style={{
                  position: 'absolute',
                  bottom: '2mm',
                  right: '13mm',
                  fontSize: '12px',color:'black'
                }}>
                  
                  Page {pageIndex + 1} 
               {/* of {Math.ceil(family.persons.length / 15)} */}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
// PaginatedFamilyPrintLayout Component
// const PaginatedFamilyPrintLayout = ({
//   familyData,
//   parishInfo,
//   koottaymaInfo,
//   transactions,
//   persons,
//   currentYear
// }) => {
//   // Calculate number of pages needed
//   const membersPerPage = 15;
//   const totalMembers = persons?.length || 0;
//   const totalPages = Math.ceil(totalMembers / membersPerPage);

//   return (
//     <div className="print-container" style={{
//       width: '100%',
//       maxWidth: '100%',
//       margin: '0 auto',
//       backgroundColor: 'white'
//     }}>
//       {Array.from({ length: totalPages }, (_, pageIndex) => {
//         const startIndex = pageIndex * membersPerPage;
//         const pageMembers = persons.slice(startIndex, startIndex + membersPerPage);
//         const isLastPage = pageIndex === totalPages - 1;
//         console.log(pageMembers);
//         return (
//           <div key={pageIndex} className="print-page" style={{
//             width: '285mm',
//             minHeight: '297mm',
//             margin: '0 auto',
//             padding: '10mm',
//             boxSizing: 'border-box',
//             position: 'relative',
//             backgroundColor: 'white',
//             pageBreakAfter: isLastPage ? 'auto' : 'always',
//             display: 'flex',
//             flexDirection: 'column'
//           }}>
//             <PageHeader  currentYear={currentYear} 
//                   parishInfo={family.parishInfo}  />
            
//             <hr style={{ 
//               margin: '0',
//               border: 'none',
//               borderTop: '2px solid black'
//             }} />
//             <hr style={{
//               margin: '1px 0 10px 0',
//               border: 'none',
//               borderTop: '2px solid black'
//             }} />
// {/* 
//             {pageIndex === 0 && ( */}
//               <FamilyDetails
//                familyData={family.familyData}
//                parishInfo={family.parishInfo}
//                koottaymaInfo={family.koottaymaInfo}
//               />
//             {/*  )} */}

//             <div style={{ flex: 1 }}>
              
//               <MemberTable
                
//                 members={pageMembers}
//                 transactions={family.transactions}
//                 showTotals={isLastPage}
//                 startIndex={startIndex}
//               />
//             </div>

//             { <PageFooter showSignatures={true} />}
            
//             <div style={{
//               position: 'absolute',
//               bottom: '5mm',
//               right: '10mm',
//               fontSize: '12px'
//             }}>
//               Page {pageIndex + 1} of {totalPages}
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

const BulkFamilyPrintSystem = () => {
  const [loading, setLoading] = useState(false);
  const [familiesData, setFamiliesData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const { selectedYear1: currentYear } = useFinancialYear();
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
// useEffect(() => {
//     // Add print-specific styles when component mounts
//     const style = document.createElement('style');
//     const printStyles = `
//     @page {
//      size: A4;
//      margin: 1mm;
//    }
//    @media print {
//      html, body {
//        height: auto !important;
//        overflow: visible !important;
//        -webkit-print-color-adjust: exact !important;
//        print-color-adjust: exact !important;
//        background-color: white !important;
//      }
     
//      * {
//        overflow: visible !important;
//      }
     
//      .MuiPaper-root {
//        box-shadow: none !important;
//        overflow: visible !important;
//      }
     
//      .print-content {
//        position: static !important;
//        transform: none !important;
//        overflow: visible !important;
//        height: auto !important;
//      }
     
//      .MuiTableContainer-root {
//        overflow: visible !important;
//        break-inside: auto !important;
//      }
     
//      .MuiTable-root {
//        width: 100% !important;
//        break-inside: auto !important;
//        page-break-inside: auto !important;
//      }
     
//      .MuiTableHead-root {
//        display: table-header-group !important;
//      }
     
//      .MuiTableBody-root {
//        display: table-row-group !important;
//      }
     
//      .MuiTableRow-root {
//        break-inside: avoid !important;
//        page-break-inside: avoid !important;
//      }
     
//      .MuiTableCell-root {
//        border: 1px solid black !important;
//        color: black !important;
//      }
     
//      .MuiTypography-root {
//        color: black !important;
//      }
     
//      .MuiDivider-root {
//        margin: 24px 0 !important;
//        border-color: black !important;
//      }
     
//      .no-print {
//        display: none !important;
//      }
 
//      .print-container,
//      .print-container * {
//        visibility: visible;
//      }
//   * {
//        overflow: visible !important;
//      }
//      .print-page {
//        break-after: page;
//        page-break-after: always;
//        margin: 0 !important;
//        border: initial !important;
//        border-radius: initial !important;
//        width: initial !important;
//        min-height: initial !important;
//        box-shadow: initial !important;
//        background: initial !important;
//        page-break-after: always !important;
//      }
 
//      .print-page:last-child {
//        page-break-after: auto;
//      }
 
//      .print-table {
      
//        table-layout: fixed;
//      }
 
//      .dialog-buttons,
//      .no-print {
//        display: none !important;
//      }
 
//      .MuiDialogContent-root {
//        overflow: visible !important;
//      }
 
//      /* Ensure table headers print with background */
//      .print-table th {
//        -webkit-print-color-adjust: exact !important;
//        print-color-adjust: exact !important;
//        background-color: #f3f4f6 !important;
//      }
 
//      /* Force page breaks */
//      .print-page {
//        break-inside: avoid;
//      }
//    }
 
//    /* High DPI print settings */
//    @media print and (-webkit-min-device-pixel-ratio: 2), 
//           print and (min-resolution: 192dpi) {
//      .print-table,
//      .print-table th,
//      .print-table td {
//        border-width: 0.5pt !important;
//      }
//         .signature-line {
//        border-width: 0.5pt;
//      }
//    }
 
//    /* Print preview styles */
//    .print-container {
//      background: white;
//    }
 
//    .print-page {
//      background: white;
//      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
//      margin-bottom: 20px;
//    }
 
//    .print-table {
//      width: 100%;
    
//    }
//      .print-table {
//        -webkit-print-color-adjust: exact;
//        color-adjust: exact;
//      }
 
//      .print-table th {
//        background-color: #f3f4f6 !important;
//        -webkit-print-color-adjust: exact;
//        color-adjust: exact;
//      }
//         /* Font faces */
//    @font-face {
//      font-family: 'FML-TTAyilyamBold';
//      src: url('../fonts/FMLAL0NTT.ttf') format('truetype');
//      font-weight: normal;
//      font-style: normal;
//    }
//    @font-face {
//      font-family: 'FML-TTGopika';
//      src: url('../fonts/FMLGP0BTT.ttf') format('truetype');
//      font-weight: normal;
//      font-style: normal;
//    }
//    @font-face {
//      font-family: 'FML-TTGopika1';
//      src: url('../fonts/FMLGP0NTT.ttf') format('truetype');
//      font-weight: normal;
//      font-style: normal;
//    }
//    @font-face {
//      font-family: 'FML-TTJaya';
//      src: url('../fonts/FMLJA0ITT.ttf') format('truetype');
//      font-weight: normal;
//      font-style: normal;
//    }
//    @font-face {
//      font-family: 'FML-TTJyothy';
//      src: url('../fonts/FMLJY0NTT.ttf') format('truetype');
//      font-weight: normal;
//      font-style: normal;
//    }
 
//    /* Malayalam text classes */
//    .malayalam-text { font-family: 'FML-TTAyilyamBold', sans-serif; }
//    .malayalam-text1 { font-family: 'FML-TTGopika', sans-serif; }
//    .malayalam-text2 { font-family: 'FML-TTJaya', sans-serif; }
//    .malayalam-text3 { font-family: 'FML-TTGopika1', sans-serif; }
//    .malayalam-text4 { font-family: 'FML-TTJyothy', sans-serif; }
//    .malayalam-text5 { font-family: 'ML-TTRevathi', sans-serif; }
 
//    /* Table styles */
//    .print-table {
//      width: 100%;
//      border-collapse: collapse;
//      border: 2px solid #000;
//      margin-bottom: 20px;
//    }
 
//    .print-table th,
//    .print-table td {
//      border: 1px solid #000;
//      padding: 8px;
//      font-size: 14px;
//    }
 
//    .print-table th {
//      background-color: #f3f4f6;
//      font-weight: bold;
//      text-align: center;
//    }
 
//    .print-table .text-center { text-align: center; }
//    .print-table .text-right { text-align: right; }
//    .print-table .font-bold { font-weight: bold; }
 
//    .total-row td {
//      border-top: 2px solid #000;
//      border-bottom: 2px solid #000;
//    }
 
//    /* Column widths */
//    .serial-column { width: 40px; }
//    .name-column { width: 120px; }
//    .relation-column { width: 100px; }
//    .gender-column { width: 60px; }
//    .date-column { width: 100px; }
//    .occupation-column { width: 100px; }
//    .education-column { width: 100px; }
//    .amount-column { width: 60px; }
//  `;
//  // Styles
//  const styles = `
//    @media print {
//      @page {
//        size: A4;
//        margin: 0;
//      }
 
//      body * {
//        visibility: hidden;
//      }
 
//      .print-section,
//      .print-section * {
//        visibility: visible;
//      }
 
//      .print-section {
//        position: absolute;
//        left: 0;
//        top: 0;
//        width: 225mm;
//        height: 297mm;
//        padding: 1mm;
//        margin: 0;
//      }
 
//      .dialog-buttons,
//      .no-print {
//        display: none !important;
//      }
 
//      .print-table {
//        -webkit-print-color-adjust: exact;
//        color-adjust: exact;
//      }
 
//      .print-table th {
//        background-color: #f3f4f6 !important;
//        -webkit-print-color-adjust: exact;
//        color-adjust: exact;
//      }
 
//      /* Page break handling */
//      .print-section {
//        page-break-after: always;
//      }
     
//      .print-section:last-child {
//        page-break-after: auto;
//      }
//    }
 
//    @media print and (-webkit-min-device-pixel-ratio: 2), 
//           print and (min-resolution: 192dpi) {
//      .print-table,
//      .print-table th,
//      .print-table td {
//        border-width: 0.5pt;
//      }
 
//      .signature-line {
//        border-width: 0.5pt;
//      }
//    }
 
//    /* Font faces */
//    @font-face {
//      font-family: 'FML-TTAyilyamBold';
//      src: url('../fonts/FMLAL0NTT.ttf') format('truetype');
//      font-weight: normal;
//      font-style: normal;
//    }
//    @font-face {
//      font-family: 'FML-TTGopika';
//      src: url('../fonts/FMLGP0BTT.ttf') format('truetype');
//      font-weight: normal;
//      font-style: normal;
//    }
//    @font-face {
//      font-family: 'FML-TTGopika1';
//      src: url('../fonts/FMLGP0NTT.ttf') format('truetype');
//      font-weight: normal;
//      font-style: normal;
//    }
//    @font-face {
//      font-family: 'FML-TTJaya';
//      src: url('../fonts/FMLJA0ITT.ttf') format('truetype');
//      font-weight: normal;
//      font-style: normal;
//    }
//    @font-face {
//      font-family: 'FML-TTJyothy';
//      src: url('../fonts/FMLJY0NTT.ttf') format('truetype');
//      font-weight: normal;
//      font-style: normal;
//    }
 
//    /* Malayalam text classes */
//    .malayalam-text { font-family: 'FML-TTAyilyamBold', sans-serif; }
//    .malayalam-text1 { font-family: 'FML-TTGopika', sans-serif; }
//    .malayalam-text2 { font-family: 'FML-TTJaya', sans-serif; }
//    .malayalam-text3 { font-family: 'FML-TTGopika1', sans-serif; }
//    .malayalam-text4 { font-family: 'FML-TTJyothy', sans-serif; }
//    .malayalam-text5 { font-family: 'ML-TTRevathi', sans-serif; }
 
//    /* Table styles */
//    .print-table {
//      width: 100%;
//      border-collapse: collapse;
//      border: 2px solid #000;
//      margin-bottom: 20px;
//    }
 
//    .print-table th,
//    .print-table td {
//      border: 1px solid #000;
//      padding: 8px;
//      font-size: 14px;
//    }
 
//    .print-table th {
//      background-color: #f3f4f6;
//      font-weight: bold;
//      text-align: center;
//    }
 
//    .print-table .text-center { text-align: center; }
//    .print-table .text-right { text-align: right; }
//    .print-table .font-bold { font-weight: bold; }
 
//    .total-row td {
//      border-top: 2px solid #000;
//      border-bottom: 2px solid #000;
//    }
 
//    /* Column widths */
//    .serial-column { width: 40px; }
//    .name-column { width: 120px; }
//    .relation-column { width: 100px; }
//    .gender-column { width: 60px; }
//    .date-column { width: 100px; }
//    .occupation-column { width: 100px; }
//    .education-column { width: 100px; }
//    .amount-column { width: 60px; }
//  `;
//  style.textContent = printStyles;
// // document.head.appendChild(style);
//     document.head.appendChild(style);

//     return () => {
//       document.head.removeChild(style);
//     };
//   }, []);

  const handlePrint = () => {
    // setPrintDialogOpen(false);
    setTimeout(() => {
      window.print();
    }, 100);
  };
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

  const handleLoadData = async () => {
    setLoading(true);
    try {
      if (!filters.forane || !filters.parish || !filters.koottayma) {
        throw new Error('Forane, Parish and Koottayma IDs are required');
      }
      
      const response = await axiosInstance.get(
        `/family/bulk-family-data/${filters.forane}/${filters.parish}/${filters.koottayma}/${currentYear}`
      );
      setFamiliesData(response.data);
      console.log(response.data);
      setShowPreview(true);
    } catch (error) {
      console.error('Error loading bulk data:', error);
    } finally {
      setLoading(false);
    }
  };

 
 
  //  const handlePrint = () => {
  //   // setPrintDialogOpen(false);
  //    setTimeout(() => {
  //      window.print();
  //    }, 100);
  //  };

  const handleReset = () => {
    setShowPreview(false);
    setFamiliesData([]);
    setFilters({
      forane: '',
      parish: '',
      koottayma: ''
    });
  };

  return (
    <Box sx={{ p: 3, backgroundColor: 'background.paper', borderRadius: 2 }}>
      {!showPreview ? (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>Bulk Print Family Details</Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Forane</InputLabel>
                <Select
                  name="forane"
                  value={filters.forane}
                  onChange={handleFilterChange}
                  label="Forane"
                  endAdornment={<KeyboardArrowDownIcon />}
                >
                  <MenuItem value="">Select Forane</MenuItem>
                  {options.foranes.map(forane => (
                    <MenuItem key={forane._id} value={forane._id}>
                      {forane.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Parish</InputLabel>
                <Select
                  name="parish"
                  value={filters.parish}
                  onChange={handleFilterChange}
                  label="Parish"
                  endAdornment={<KeyboardArrowDownIcon />}
                  disabled={!filters.forane || isLoading.parishes}
                >
                  <MenuItem value="">Select Parish</MenuItem>
                  {options.parishes.map(parish => (
                    <MenuItem key={parish._id} value={parish._id}>
                      {parish.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Koottayma</InputLabel>
                <Select
                  name="koottayma"
                  value={filters.koottayma}
                  onChange={handleFilterChange}
                  label="Koottayma"
                  endAdornment={<KeyboardArrowDownIcon />}
                  disabled={!filters.parish || isLoading.koottaymas}
                >
                  <MenuItem value="">Select Koottayma</MenuItem>
                  {options.koottaymas.map(koottayma => (
                    <MenuItem key={koottayma._id} value={koottayma._id}>
                      {koottayma.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          )}

          <Stack direction="row" spacing={2} sx={{ mt: 4, justifyContent: 'flex-end' }}>
            <Button
              onClick={handleLoadData}
              disabled={loading || !filters.forane || !filters.parish || !filters.koottayma}
              variant="contained"
              color="primary"
              startIcon={<LocalPrintshopIcon />}
            >
              Load Data
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Box className="print:overflow-visible">
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Button
              onClick={handleReset}
              variant="outlined"
              startIcon={<ArrowBackIcon />}
            >
              Back
            </Button>
            <Button
              onClick={handlePrint}
              disabled={loading}
              variant="contained"
              color="primary"
              startIcon={<PrintIcon />}
            >
              Print
            </Button>
          </Stack>

          <Box className="print:overflow-visible"
          // className="print-container"
          // // sx={{ 
          // //   maxHeight: 'calc(100vh - 200px)', 
          // //   overflow: 'auto',
          // //   p: 2,
          // //   backgroundColor: '#f5f5f5'
          // // }}
          >
            <BulkPrintLayout
              families={familiesData}
              currentYear={currentYear}
            />
          </Box>
        </Box>
      )}

       
    </Box>
  );
};
const printStyles = `
  
  @media print {
   @page {
    size: A4;
    margin: 1mm;
  }
  body > * {
  visibility: hidden;
}
  .print-container {
      visibility: visible !important;
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
    html, body {
      height: auto !important;
      overflow: visible !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      background-color: white !important;
    }
    .print-root {
    display: block !important;
    width: 100% !important;
    height: auto !important;
    position: relative !important;
    overflow: visible !important;
    page-break-before: avoid;
    page-break-after: avoid;
  }
    * {
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
  width: 285mm;
  min-height: 297mm;
  padding: 10mm;
  margin: 0 auto;
  background: white;
  box-sizing: border-box;
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
      background-color: #fff !important;
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

 

  .print-table {
    width: 100%;
   
  }
    .print-table {
      -webkit-print-color-adjust: exact;
      color-adjust: exact;
    }

    .print-table th {
      background-color: #fff !important;
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
    @font-face {
    font-family: 'ML-TTAnakha';
    src: url('../fonts/ML_TT_Anakha_Bold.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
     @font-face {
    font-family: 'ML-TTMalavika';
    src: url('../fonts/ML_TT_Malavika_Normal.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
       @font-face {
    font-family: 'ML-TTKarthika';
    src: url('../fonts/MLKR0NTT.TTF') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
     @font-face {
    font-family: 'ML-TTRevathi';
    src: url('../fonts/ML-TTRevathi-Normal.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
    @font-face {
    font-family: 'ML-TTVinay';
    src: url('../fonts/ML_TT_Vinay_Normal.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
     @font-face {
    font-family: 'ML-TTThunchan';
    src: url('../fonts/ML_TT_Thunchan_Normal.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
  @font-face {
    font-family: 'Wingdings 2';
    src: url('../fonts/WINGDNG2.TTF') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
      @font-face {
    font-family: 'Arial';
    src: url('../fonts/arial.ttf') format('truetype');
    font-weight: bold;
    font-style: normal;
  }

  @font-face {
    font-family: 'Times New Roman';
    src: url('../fonts/times.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }

  /* Malayalam text classes */    ML-TTThunchan
  .malayalam-text { font-family: 'FML-TTAyilyamBold', sans-serif; }
  .malayalam-text1 { font-family: 'FML-TTGopika', sans-serif; }
  .malayalam-text2 { font-family: 'FML-TTJaya', sans-serif; }
  .malayalam-text3 { font-family: 'FML-TTGopika1', sans-serif; }
  .malayalam-text4 { font-family: 'FML-TTJyothy', sans-serif; }
  .malayalam-text5 { font-family: 'ML-TTRevathi', sans-serif; }
  .malayalam-text6 { font-family: 'ML-TTAnakha', sans-serif; }
  .malayalam-text7 { font-family: 'ML-TTMalavika', sans-serif; }
  .malayalam-text8 { font-family: 'ML-TTKarthika', sans-serif; }
  .malayalam-text9 { font-family: 'ML-TTRevathi', sans-serif; }
  .malayalam-text10 { font-family: 'ML-TTVinay', sans-serif; }
  .malayalam-text12 { font-family: 'ML-TTRevathi', sans-serif; }
  .malayalam-text13 { font-family: 'Wingdings 2', sans-serif; }
   .malayalam-text14 { font-family: 'Arial', sans-serif;letter-spacing:normal; }
   .malayalam-text15 { font-family: 'Times New Roman', sans-serif;letter-spacing:normal; }
  /* Table styles  */
  .print-table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #665;
    margin-bottom: 20px;
  }

  .print-table th,
  .print-table td {
    border: 1px solid #665;
    padding-top: 0px;
    padding-bottom: 0px;
    padding-left: 8px;
    padding-right: 8px;
    font-size: 14px;
  }

  .print-table th {
    background-color: #fff;
    font-weight: bold;
    text-align: center;
  }

  .print-table .text-center { text-align: center; }
  .print-table .text-right { text-align: right; }
  .print-table .font-bold { font-weight: bold; }

  .total-row td {
    border-top: 1px solid #665;
    border-bottom: 1px solid #665;
  }

  /* Column widths */
  .serial-column { width: 45px; }
  .name-column { width: 120px; }
  .relation-column { width: 100px; }
  .gender-column { width: 40px; }
  .date-column { width: 60px; }
  .occupation-column { width: 100px; }
  .education-column { width: 100px; }
  .amount-column { width: 60px; }
  

  
`;
const style = document.createElement('style');
style.textContent = printStyles;
document.head.appendChild(style);
export default BulkFamilyPrintSystem;