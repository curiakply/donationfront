import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from "../axiosConfig";

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
  Grid,
  Chip,
  Tooltip,
  InputAdornment,
  TextField,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  Skeleton,
  Divider,
  Alert,
} from '@mui/material';
import {
  Print as PrintIcon,
  LocalPrintshop as LocalPrintshopIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  LocationOn as LocationOnIcon,
  People as PeopleIcon,
  CalendarToday as CalendarTodayIcon,
} from '@mui/icons-material';
import { stepConnectorClasses } from '@mui/material/StepConnector';
import { styled } from '@mui/material/styles';

// ─── Styled stepper connector ─────────────────────────────────────────────────
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 22 },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: 'linear-gradient(95deg, #1976d2 0%, #42a5f5 100%)',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: 'linear-gradient(95deg, #1976d2 0%, #42a5f5 100%)',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    borderRadius: 1,
  },
}));

const ColorlibStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
  zIndex: 1,
  color: '#fff',
  width: 44,
  height: 44,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  transition: 'all 0.3s ease',
  ...(ownerState.active && {
    backgroundImage: 'linear-gradient(136deg, #42a5f5 0%, #1976d2 100%)',
    boxShadow: '0 4px 10px 0 rgba(25,118,210,.4)',
  }),
  ...(ownerState.completed && {
    backgroundImage: 'linear-gradient(136deg, #42a5f5 0%, #1976d2 100%)',
  }),
}));

function ColorlibStepIcon({ active, completed, icon, icons }) {
  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }}>
      {completed ? <CheckCircleIcon sx={{ fontSize: 22 }} /> : icons[String(icon)]}
    </ColorlibStepIconRoot>
  );
}

// ─── Searchable Select ────────────────────────────────────────────────────────
const SearchableSelect = ({
  label, value, onChange, options, disabled, loading,
  placeholder, searchable = false, helperText,
}) => {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const searchRef = useRef(null);

  const filtered = searchable
    ? options.filter(o =>
        o.label.toLowerCase().includes(search.toLowerCase()) ||
        (o.sublabel && o.sublabel.toLowerCase().includes(search.toLowerCase()))
      )
    : options;

  const handleOpen = () => { setOpen(true); setTimeout(() => searchRef.current?.focus(), 50); };
  const handleClose = () => { setOpen(false); setSearch(''); };
  const handleChange = (e) => { onChange(e); handleClose(); };

  const selectedOption = options.find(o => o.value === value);

  return (
    <FormControl fullWidth disabled={disabled || loading}>
      <InputLabel shrink={!!value || open}>{label}</InputLabel>
      <Select
        value={value}
        onChange={handleChange}
        label={label}
        open={open}
        onOpen={handleOpen}
        onClose={handleClose}
        displayEmpty
        notched={!!value || open}
        IconComponent={loading ? () => <CircularProgress size={18} sx={{ mr: 1.5 }} /> : KeyboardArrowDownIcon}
        renderValue={() =>
          value ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1">{selectedOption?.label}</Typography>
              {selectedOption?.sublabel && (
                <Typography variant="caption" color="text.secondary">{selectedOption.sublabel}</Typography>
              )}
            </Box>
          ) : (
            <Typography variant="body2" color="text.disabled">{placeholder || `Select ${label}`}</Typography>
          )
        }
        MenuProps={{
          PaperProps: {
            sx: { maxHeight: 380, borderRadius: 2, mt: 0.5, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' },
          },
          autoFocus: false,
        }}
        sx={{
          borderRadius: 1.5,
          '& .MuiSelect-select': { py: 1.5 },
          ...(value && { '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1976d2' } }),
        }}
      >
        {/* Search box pinned inside menu */}
        {searchable && (
          <Box
            onKeyDown={e => e.stopPropagation()}
            sx={{ px: 1.5, pt: 1, pb: 0.5, position: 'sticky', top: 0, backgroundColor: 'background.paper', zIndex: 1 }}
          >
            <TextField
              inputRef={searchRef}
              size="small"
              fullWidth
              placeholder="Search…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment>,
                endAdornment: search && (
                  <InputAdornment position="end">
                    <ClearIcon fontSize="small" sx={{ cursor: 'pointer', color: 'text.secondary' }} onClick={() => setSearch('')} />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Divider sx={{ mt: 1 }} />
          </Box>
        )}

        {loading ? (
          <Box sx={{ px: 2, py: 1 }}>
            {[1, 2, 3].map(i => <Skeleton key={i} height={40} sx={{ my: 0.5 }} />)}
          </Box>
        ) : filtered.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              {search ? 'No results found' : 'No options available'}
            </Typography>
          </MenuItem>
        ) : (
          filtered.map(opt => (
            <MenuItem
              key={opt.value}
              value={opt.value}
              sx={{
                borderRadius: 1,
                mx: 0.5,
                '&.Mui-selected': { backgroundColor: 'primary.50', '&:hover': { backgroundColor: 'primary.100' } },
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body2">{opt.label}</Typography>
                {opt.sublabel && <Typography variant="caption" color="text.secondary">{opt.sublabel}</Typography>}
              </Box>
            </MenuItem>
          ))
        )}
      </Select>
      {helperText && (
        <Typography variant="caption" sx={{ mt: 0.5, ml: 1.5, color: disabled ? 'text.disabled' : 'text.secondary' }}>
          {helperText}
        </Typography>
      )}
    </FormControl>
  );
};

// ─── Selection Summary Card ───────────────────────────────────────────────────
const SelectionSummary = ({ foraneName, parishName, koottaymaName, familyName, year }) => {
  const items = [
    { icon: <CalendarTodayIcon fontSize="small" />, label: 'Year', value: year },
    { icon: <LocationOnIcon fontSize="small" />, label: 'Forane', value: foraneName },
    { icon: <LocationOnIcon fontSize="small" />, label: 'Parish', value: parishName },
    { icon: <LocationOnIcon fontSize="small" />, label: 'Koottayma', value: koottaymaName },
    { icon: <PeopleIcon fontSize="small" />, label: 'Family', value: familyName || 'All Families' },
  ].filter(i => i.value);

  return (
    <Box sx={{
      mt: 3, p: 2.5, borderRadius: 2,
      border: '1px solid', borderColor: 'primary.200',
      backgroundColor: 'primary.50',
    }}>
      <Typography variant="subtitle2" color="primary.main" sx={{ mb: 1.5, fontWeight: 700 }}>
        Print Summary
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={1}>
        {items.map(item => (
          <Chip
            key={item.label}
            icon={item.icon}
            label={`${item.label}: ${item.value}`}
            size="small"
            variant="outlined"
            color="primary"
            sx={{ fontWeight: 500 }}
          />
        ))}
      </Stack>
    </Box>
  );
};

// ─── Step indicator helper ────────────────────────────────────────────────────
const getActiveStep = (filters, selectedFamily) => {
  if (!filters.forane) return 0;
  if (!filters.parish) return 1;
  if (!filters.koottayma) return 2;
  return 3;
};

const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear + 1; y >= 2000; y--) years.push(y);
  return years;
};

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE HEADER / FAMILY DETAILS / TABLE / FOOTER — unchanged from original
// ═══════════════════════════════════════════════════════════════════════════════

const PageHeader = ({ currentYear, parishInfo, familyData }) => (
  <div className="header-section" style={{ display: 'flex', gap: '20px', marginBottom: '5px' }}>
    <div className="seal" style={{ width: '180px', height: '180px' }}>
      <img src="/Cross.jpg" alt="Parish Seal" className="seal-image" style={{ width: '100%', borderRadius: '50%' }} />
    </div>
    <div className="title-section" style={{ flexGrow: 0, textAlign: 'center' }}>
      <h1 className="main-title malayalam-text6" style={{ fontSize: '55px', fontWeight: 'bold', marginBottom: '-30px', color: 'black' }}>
        Poh³  {currentYear}
      </h1>
      <h2 className="sub-title malayalam-text9" style={{ fontSize: '35px', fontWeight: '600', marginBottom: '5px', lineHeight: '1', color: 'black', letterspacing: '1px' }}>
        Imªnc¸Ån cq]X
      </h2>
      <p className="subtitle-text malayalam-text10" style={{ fontSize: '23px', fontWeight: '600', marginBottom: '-8px', color: 'black', letterspacing: '1px' }}>
        ]¦phbv¡eneqsS Pohsâ kar²nbntebv¡v
      </p>
      <p className="verse-text malayalam-text12" style={{ fontSize: '20px', marginBottom: '0px', lineHeight: '1.6', color: 'black' }}>
        {`\\³a sN¿p¶Xnepw \\n§Ä¡pÅh ]¦phbv¡p¶Xnepw Dt]Ivj hcp¯cpXv. `}
      </p>
      <p className="verse-text malayalam-text12" style={{ fontSize: '20px', marginBottom: '0px', lineHeight: '1.6', color: 'black' }}>
        {`A¯cw _enIÄ ssZh¯n\\p {]oXnIcamWv.(sl{_mbÀ 13:16)`}
      </p>
    </div>
    <div className="seal" style={{ width: '80px', height: '180px', flexGrow: '2', textAlign: 'right' }}>
      <h1 className="main-title malayalam-text14" style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '0px', marginTop: '20px',color: 'black', textAlign: 'right', flex: 'unset' }}>
        {parishInfo.shortCode}{familyData.familyNumber}
      </h1>
    </div>
  </div>
);

const FamilyDetails = ({ familyData, parishInfo, koottaymaInfo }) => (
  <div className="family-details-container" style={{ display: 'flex', gap: '20px', width: '265mm', borderRadius: '5px', padding: '20px' }}>
    <div className="left-details" style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {[
        { label: 'CShI :', value: parishInfo.name, labelClass: 'malayalam-text5' },
        { label: 'IpSpw_ \\mYsâ /\\mYbpsS t]cv :', value: familyData.headname, labelClass: 'malayalam-text5' },
        { label: 'ho«pt]cv :', value: familyData.name, labelClass: 'malayalam-text5' },
      ].map(({ label, value, labelClass }) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'flex-start', border: '1px solid rgb(0 0 0 / 100%)', borderRadius: '5px', padding: '5px 10px', alignItems: 'baseline' }}>
          <span className={`detail-label ${labelClass}`} style={{ color: 'black', fontSize: '20px' }}>{label}</span>
          <span className="detail-value malayalam-text14" style={{ fontWeight: 'bold', paddingLeft: '10px', color: 'black', fontSize: '15px' }}>{value}</span>
        </div>
      ))}
    </div>
    <div className="right-details" style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {[
        { label: 'Iq«mbva :', value: koottaymaInfo.name },
        { label: 'hnemkw :', value: familyData.building },
        { label: 't^m¬ \\¼À :', value: familyData.phone, isArial: true },
      ].map(({ label, value, isArial }) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'flex-start', border: '1px solid rgb(0 0 0 / 100%)', borderRadius: '5px', padding: '5px 10px', alignItems: 'baseline', width: '425px' }}>
          <span className="detail-label malayalam-text5" style={{ color: 'black', fontSize: '20px' }}>{label}</span>
          <span className={isArial ? 'detail-value' : 'detail-value malayalam-text14'} style={{ fontWeight: '400', paddingLeft: '5px', color: 'black', fontSize: '15px' }}>{value}</span>
        </div>
      ))}
    </div>
  </div>
);

const MemberTable = ({ currentYear, members, transactions, showTotals = false, startIndex = 0 }) => (
  <table className="print-table" style={{ width: '285mm', maxWidth: '100%' }}>
    <thead style={{ border: '1px solid rgb(0, 0, 0)', outline: '1px solid rgb(0, 0, 0)', outlineOffset: '-3px' }}>
      <tr>
        <th className="serial-column malayalam-text5" style={{ fontSize: '19px', fontWeight: 100, color: 'black' }}>{`{Ia \\¼À`}</th>
        <th className="name-column malayalam-text5" style={{ fontSize: '15px', fontWeight: 100, color: 'black' }}>amt½mZok t]cv</th>
        <th className="name-column malayalam-text5" style={{ fontSize: '15px', fontWeight: 100, color: 'black' }}>hnfn¡p¶ t]cv</th>
        <th className="relation-column malayalam-text5" style={{ fontSize: '15px', fontWeight: 100, color: 'black' }}>IpSpw_ \mY\pambpÅ _Ôw</th>
        <th className="gender-column malayalam-text5" style={{ fontSize: '15px', fontWeight: 100, color: 'black' }}>{`]p/ kv{Xo`}</th>
        <th className="date-column malayalam-text5" style={{ fontSize: '15px', fontWeight: 100, color: 'black' }}>P\\  XobXn</th>
        <th className="occupation-column malayalam-text5" style={{ fontSize: '15px', fontWeight: 100, color: 'black' }}>sXmgnÂ</th>
        <th className="education-column malayalam-text5" style={{ fontSize: '15px', fontWeight: 100, color: 'black' }}>hnZym`ymkw</th>
        <th className="amount-column malayalam-text5" style={{ fontSize: '15px', fontWeight: 100, color: 'black' }}>
          Zimwiw <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '15px' }}>2003<span style={{ fontFamily: 'Arial, sans-serif' }}>-</span>{(currentYear - 1).toString().slice(-2)}</span>
        </th>
        <th className="amount-column malayalam-text5" style={{ fontSize: '15px', fontWeight: 100, color: 'black' }}>Zimwiw <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '15px' }}>{currentYear}</span></th>
      </tr>
    </thead>
    {/* <tbody>
      {members.map((member, index) => (
        <React.Fragment key={index}>
          <tr style={{ height: '26px' }}>
            <td className="text-right malayalam-text14" style={{ fontSize: '15px', color: 'black' }}>{startIndex + index + 1}</td>
            <td className="text-left malayalam-text15" style={{ fontSize: '15px', color: 'black' }}>{member.baptismName === 'NULL' ? '' : member.baptismName}</td>
            <td className="text-left malayalam-text14" style={{ fontSize: '15px', color: 'black' }}>{member.name === 'NULL' ? '' : member.name}</td>
            <td className="text-center malayalam-text15" style={{ fontSize: '11px', color: 'black' }}>
              {member.relation ? (member.relation.toUpperCase() === 'HEAD' ? 'FAMILY HEAD' : member.relation.toUpperCase()) : ''}
            </td>
            <td className="text-center malayalam-text14" style={{ fontSize: '15px', color: 'black' }}>{member.gender === 'male' ? 'M' : 'F'}</td>
            <td className="text-center malayalam-text15" style={{ fontSize: '12px', color: 'black' }}></td>
            <td className="text-center malayalam-text15" style={{ fontSize: '11px', color: 'black' }}>{member.occupation === 'NULL' ? '' : member.occupation}</td>
            <td className="text-center malayalam-text15" style={{ fontSize: '15px', color: 'black' }}>{member.education === 'NULL' ? '' : member.education}</td>
            <td className="text-right malayalam-text14" style={{ fontSize: '14px', color: 'black' }}>{member.totalAmount}</td>
            <td className="text-right malayalam-text14" style={{ fontSize: '15px', color: 'black' }}></td>
          </tr>
          <tr style={{ height: '26px' }}>
            {[...Array(10)].map((_, colIndex) => <td key={`even-${index}-${colIndex}`}>&nbsp;</td>)}
          </tr>
        </React.Fragment>
      ))}
      {[...Array(Math.max(0, 22 - members.length * 2))].map((_, index) => (
        <tr style={{ height: '26px' }} key={`empty-${index}`}>
          {[...Array(10)].map((_, colIndex) => <td key={`empty-${index}-${colIndex}`}>&nbsp;</td>)}
        </tr>
      ))}
      {showTotals && (
        <tr className="total-row">
          <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
          <td className="text-right malayalam-text15" style={{ color: 'black' }}>TOTAL</td>
          <td className="text-right malayalam-text14" style={{ fontSize: '14px', color: 'black' }}>
            {transactions?.reduce((sum, t) => sum + (t.amountPaid || 0), 0)}
          </td>
          <td className="text-right font-bold" style={{ fontSize: '10px', color: 'black' }}></td>
        </tr>
      )}
    </tbody> */}

    {/* Add this helper above or inside the component */}
{(() => {
  const dynFont = (text, base = 15, reduced = 13, threshold = 10) =>
    text && text.length > threshold ? `${reduced}px` : `${base}px`;

  return (
    <tbody>
      {members.map((member, index) => {
        const baptismName = member.baptismName === 'NULL' ? '' : member.baptismName || '';
        const name = member.name === 'NULL' ? '' : member.name || '';
        const relation = member.relation
          ? member.relation.toUpperCase() === 'HEAD'
            ? 'FAMILY HEAD'
            : member.relation.toUpperCase()
          : '';
        const occupation = member.occupation === 'NULL' ? '' : member.occupation || '';
        const education = member.education === 'NULL' ? '' : member.education || '';

        return (
          <React.Fragment key={index}>
            <tr style={{ height: '26px' }}>
              <td className="text-right malayalam-text14" style={{ fontSize: '15px', color: 'black' }}>
                {startIndex + index + 1}
              </td>
              <td className="text-left malayalam-text15" style={{ fontSize: dynFont(baptismName), color: 'black' }}>
                {baptismName}
              </td>
              <td className="text-left malayalam-text14" style={{ fontSize: dynFont(name), color: 'black' }}>
                {name}
              </td>
              <td className="text-center malayalam-text15" style={{ fontSize: dynFont(relation, 13, 10), color: 'black' }}>
                {relation}
              </td>
              <td className="text-center malayalam-text14" style={{ fontSize: '15px', color: 'black' }}>
                {member.gender === 'male' ? 'M' : 'F'}
              </td>
              <td className="text-center malayalam-text15" style={{ fontSize: '12px', color: 'black' }}></td>
              <td className="text-center malayalam-text15" style={{ fontSize: dynFont(occupation, 11, 9), color: 'black' }}>
                {occupation}
              </td>
              <td className="text-center malayalam-text15" style={{ fontSize: dynFont(education), color: 'black' }}>
                {education}
              </td>
              <td className="text-right malayalam-text14" style={{ fontSize: '14px', color: 'black' }}>
                {member.totalAmount}
              </td>
              <td className="text-right malayalam-text14" style={{ fontSize: '15px', color: 'black' }}></td>
            </tr>
            <tr style={{ height: '26px' }}>
              {[...Array(10)].map((_, colIndex) => (
                <td key={`even-${index}-${colIndex}`}>&nbsp;</td>
              ))}
            </tr>
          </React.Fragment>
        );
      })}

      {[...Array(Math.max(0, 22 - members.length * 2))].map((_, index) => (
        <tr style={{ height: '26px' }} key={`empty-${index}`}>
          {[...Array(10)].map((_, colIndex) => (
            <td key={`empty-${index}-${colIndex}`}>&nbsp;</td>
          ))}
        </tr>
      ))}

      {showTotals && (
        <tr className="total-row">
          <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
          <td className="text-right malayalam-text15" style={{ color: 'black' }}>TOTAL</td>
          <td className="text-right malayalam-text14" style={{ fontSize: '14px', color: 'black' }}>
            {transactions?.reduce((sum, t) => sum + (t.amountPaid || 0), 0)}
          </td>
          <td className="text-right font-bold" style={{ fontSize: '10px', color: 'black' }}></td>
        </tr>
      )}
    </tbody>
  );
})()}
  </table>
);

const PageFooter = ({ showSignatures = true }) => (
  <>
    {showSignatures && (
       <div className="signature-section" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '5px',
        padding: '20px',
        border: '1px solid rgb(0, 0, 0)',
        borderRadius: '10px',
         border: '1px solid rgb(0, 0, 0)', 
      outline: '1px solid rgb(3, 0, 0)',
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
    <div className="notes-section" style={{ width: '246mm', paddingTop: '0', marginTop: '4px', position: 'relative' }}>
      <div className="malayalam-text14" style={{ position: 'absolute', left: '0', top: '0', fontWeight: '600', fontSize: '14px', color: 'black' }}>NB</div>
      <div style={{ paddingLeft: '40px' }}>
        {[
          `Cu t^md-¯nÂ Fs´-¦nepw Xncp-¯-ep-IÄ Ds­-ï¦nÂ Ah \\n§-fpsS  t]cn\\p Xmsg-bpÅ tImf-¯nÂ hyà-ambn Fgp-tX-­­­­­ï­-Xm-Wv.`,
          `tcJ-IÄ UnPnässekv sN¿p-¶-Xn\\v kuI-cy-{]-Z-amb hn[-¯nÂ t]cp-IÄ Cw¥o-jnÂ Fgp-Xp-¶-Xn\\pw FÃm tImf-§fpw ]qcn-¸n-¡p-¶-Xn\\pw {i²n-¡p-I`,
          `IpSpw-_mw-K-§-fpsS t]cp-hn-h-c-§Ä hn«p-t]m-bn-«p-s­-ï¦nÂ {Ia-\\-¼À DÄs¸sS Ah Fgp-Xn-t¨Àt¡-ï­-Xm-Wv.`,
          `Cu enÌnÂ ac-W-a-S-ª-h-cp-s­-ï¦nÂ Ah-cpsS t]cn-\\p- Xmsg "ac-W-a-Sªp" F¶pw P\\-\\-Xo-b-Xn-bpsS tImf-¯nÂ ac-W-Xo-b-Xnbpw Fgp-X-Ww.`,
        ].map((text, i) => (
          <p key={i} className="malayalam-text5" style={{ marginBottom: '1px', color: 'black', letterSpacing: '0px', fontWeight: '600',fontSize: '14px' }}>
            <span className="malayalam-text13">C</span> {text}
          </p>
        ))}
      </div>
    </div>
  </>
);

const BulkPrintLayout = ({ families, currentYear }) => (
  <div className="print-container" style={{ width: '100%', maxWidth: '100%', margin: '0 auto', backgroundColor: 'white' }}>
    {families.map((family, familyIndex) => (
      <div key={familyIndex} className="family-section">
        {Array.from({ length: Math.ceil(family.persons.length / 11) }, (_, pageIndex) => {
          const startIndex = pageIndex * 11;
          const pageMembers = family.persons.slice(startIndex, startIndex + 11);
          const isLastPage = pageIndex === Math.ceil(family.persons.length / 11) - 1;
          return (
            <div key={pageIndex} className="print-page" style={{ width: '285mm', minHeight: '297mm', margin: '0 auto', padding: '10mm', paddingTop: '3mm', boxSizing: 'border-box', position: 'relative', backgroundColor: 'white', pageBreakAfter: isLastPage && familyIndex === families.length - 1 ? 'auto' : 'always', display: 'flex', flexDirection: 'column' }}>
              <PageHeader currentYear={currentYear} parishInfo={family.parishInfo} familyData={family.familyData} />
              <div className="detail-row" style={{ display: 'flex', justifyContent: 'flex-start', border: '1px solid rgb(0 0 0 / 100%)', borderRadius: '5px', padding: '.4px 1px', alignItems: 'baseline', marginBottom: '2px' }}></div>
              <div className="detail-row" style={{ display: 'flex', justifyContent: 'flex-start', border: '1px solid rgb(0 0 0 / 100%)', borderRadius: '5px', padding: '.4px 1px', alignItems: 'baseline' }}></div>
              <FamilyDetails familyData={family.familyData} parishInfo={family.parishInfo} koottaymaInfo={family.koottaymaInfo} />
              <div style={{ flex: 1 }}>
                <MemberTable currentYear={currentYear} members={pageMembers} transactions={family.transactions} showTotals={isLastPage} startIndex={startIndex} />
              </div>
              <PageFooter showSignatures={true} />
              <div style={{ marginTop: '16px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', top: '50%', left: '0', right: '0', height: '1px', backgroundColor: 'black', zIndex: 0 }}></div>
                <span className="malayalam-text13" style={{ position: 'absolute', left: '0', fontSize: '16px', color: 'black', backgroundColor: 'white', zIndex: 1 }}>ï</span>
                <span className="malayalam-text13" style={{ position: 'absolute', right: '0', fontSize: '16px', color: 'black', backgroundColor: 'white', zIndex: 1 }}>ï</span>
              </div>
              <div className="malayalam-text14" style={{ position: 'absolute', bottom: '2mm', right: '13mm', fontSize: '12px', color: 'black' }}>Page {pageIndex + 1}</div>
            </div>
          );
        })}
      </div>
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const BulkFamilyPrintSystem = () => {
  const [loading, setLoading] = useState(false);
  const [familiesData, setFamiliesData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filters, setFilters] = useState({ forane: '', parish: '', koottayma: '' });
  const [options, setOptions] = useState({ foranes: [], parishes: [], koottaymas: [] });
  const [isLoading, setIsLoading] = useState({ foranes: false, parishes: false, koottaymas: false });
  const [familyList, setFamilyList] = useState([]);
  const [selectedFamily, setSelectedFamily] = useState('');
  const [isFamilyLoading, setIsFamilyLoading] = useState(false);
  const [error, setError] = useState('');

  const yearOptions = generateYearOptions();
  const activeStep = getActiveStep(filters);

  // Names for summary
  const foraneName = options.foranes.find(f => f._id === filters.forane)?.name;
  const parishName = options.parishes.find(p => p._id === filters.parish)?.name;
  const koottaymaName = options.koottaymas.find(k => k._id === filters.koottayma)?.name;
  const familyName = familyList.find(f => f._id === selectedFamily)?.name;

  const isReadyToLoad = filters.forane && filters.parish && filters.koottayma;

  useEffect(() => {
    const fetchForanes = async () => {
      setIsLoading(prev => ({ ...prev, foranes: true }));
      try {
        const res = await axiosInstance.get('/forane');
        setOptions(prev => ({ ...prev, foranes: res.data || [] }));
      } catch (e) { console.error(e); }
      finally { setIsLoading(prev => ({ ...prev, foranes: false })); }
    };
    fetchForanes();
  }, []);

  useEffect(() => {
    if (!filters.forane) {
      setOptions(prev => ({ ...prev, parishes: [] }));
      setFilters(prev => ({ ...prev, parish: '', koottayma: '' }));
      return;
    }
    setIsLoading(prev => ({ ...prev, parishes: true }));
    axiosInstance.get(`/parish/forane/${filters.forane}`)
      .then(res => setOptions(prev => ({ ...prev, parishes: res.data || [] })))
      .catch(console.error)
      .finally(() => setIsLoading(prev => ({ ...prev, parishes: false })));
  }, [filters.forane]);

  useEffect(() => {
    if (!filters.parish) {
      setOptions(prev => ({ ...prev, koottaymas: [] }));
      setFilters(prev => ({ ...prev, koottayma: '' }));
      return;
    }
    setIsLoading(prev => ({ ...prev, koottaymas: true }));
    axiosInstance.get(`/koottayma/parish/${filters.parish}`)
      .then(res => setOptions(prev => ({ ...prev, koottaymas: res.data || [] })))
      .catch(console.error)
      .finally(() => setIsLoading(prev => ({ ...prev, koottaymas: false })));
  }, [filters.parish]);

  useEffect(() => {
    if (!filters.koottayma) { setFamilyList([]); setSelectedFamily(''); return; }
    setIsFamilyLoading(true);
    axiosInstance.get(`/family/koottayma/${filters.koottayma}`)
      .then(res => { setFamilyList(res.data || []); setSelectedFamily(''); })
      .catch(console.error)
      .finally(() => setIsFamilyLoading(false));
  }, [filters.koottayma]);

  const handleFilterChange = (name) => (e) => {
    setFilters(prev => ({ ...prev, [name]: e.target.value }));
    setError('');
  };

  const handleLoadData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get(
        `/family/bulk-family-data/${filters.forane}/${filters.parish}/${filters.koottayma}/${selectedYear}`
      );
      let data = res.data;
      if (selectedFamily) data = data.filter(f => f.familyData._id === selectedFamily);
      if (data.length === 0) { setError('No family data found for the selected filters.'); setLoading(false); return; }
      setFamiliesData(data);
      setShowPreview(true);
    } catch (e) {
      console.error(e);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => setTimeout(() => window.print(), 100);

  const handleReset = () => {
    setShowPreview(false);
    setFamiliesData([]);
    setFilters({ forane: '', parish: '', koottayma: '' });
    setSelectedFamily('');
    setFamilyList([]);
    setError('');
  };

  const stepIcons = {
    1: <LocationOnIcon sx={{ fontSize: 20 }} />,
    2: <LocationOnIcon sx={{ fontSize: 20 }} />,
    3: <LocationOnIcon sx={{ fontSize: 20 }} />,
    4: <PeopleIcon sx={{ fontSize: 20 }} />,
  };

  return (
    <Box sx={{ p: 3, backgroundColor: 'background.paper', borderRadius: 2 }}>
      {!showPreview ? (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          {/* ── Header ─────────────────────────────────────────────────────── */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>Bulk Print Family Details</Typography>
            {/* <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Select location filters and optionally a specific family to print
            </Typography> */}
          </Box>

          {/* ── Progress stepper ──────────────────────────────────────────── */}
          <Stepper
            alternativeLabel
            activeStep={activeStep}
            connector={<ColorlibConnector />}
            sx={{ mb: 4 }}
          >
            {['Select Forane', 'Select Parish', 'Select Koottayma', 'Ready to Print'].map((label, index) => (
              <Step key={label} completed={activeStep > index}>
                <StepLabel
                  StepIconComponent={(props) => (
                    <ColorlibStepIcon {...props} icons={stepIcons} />
                  )}
                >
                  <Typography variant="caption" fontWeight={activeStep === index ? 700 : 400} color={activeStep >= index ? 'primary.main' : 'text.disabled'}>
                    {label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          <Grid container spacing={3}>
            {/* Year */}
            <Grid item xs={12} sm={6} md={3}>
              <SearchableSelect
                label="Year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                options={yearOptions.map(y => ({ value: y, label: String(y) }))}
                placeholder="Select year"
              />
            </Grid>

            {/* Forane */}
            <Grid item xs={12} sm={6} md={3}>
              <SearchableSelect
                // label="Forane"
                value={filters.forane}
                onChange={handleFilterChange('forane')}
                options={options.foranes.map(f => ({ value: f._id, label: f.name }))}
                loading={isLoading.foranes}
                placeholder="Select Forane"
                searchable={options.foranes.length > 6}
                helperText={isLoading.foranes ? 'Loading…' : `${options.foranes.length} foranes available`}
              />
            </Grid>

            {/* Parish */}
            <Grid item xs={12} sm={6} md={3}>
              <Tooltip
                title={!filters.forane ? 'Please select a Forane first' : ''}
                placement="top"
                arrow
              >
                <span style={{ display: 'block' }}>
                  <SearchableSelect
                    // label="Parish"
                    value={filters.parish}
                    onChange={handleFilterChange('parish')}
                    options={options.parishes.map(p => ({ value: p._id, label: p.name }))}
                    disabled={!filters.forane}
                    loading={isLoading.parishes}
                    placeholder="Select Parish"
                    searchable={options.parishes.length > 6}
                    helperText={
                      !filters.forane
                        ? '← Select a Forane first'
                        : isLoading.parishes
                        ? 'Loading parishes…'
                        : `${options.parishes.length} parishes available`
                    }
                  />
                </span>
              </Tooltip>
            </Grid>

            {/* Koottayma */}
            <Grid item xs={12} sm={6} md={3}>
              <Tooltip
                title={!filters.parish ? 'Please select a Parish first' : ''}
                placement="top"
                arrow
              >
                <span style={{ display: 'block' }}>
                  <SearchableSelect
                    // label="Koottayma"
                    value={filters.koottayma}
                    onChange={handleFilterChange('koottayma')}
                    options={options.koottaymas.map(k => ({ value: k._id, label: k.name }))}
                    disabled={!filters.parish}
                    loading={isLoading.koottaymas}
                    placeholder="Select Koottayma"
                    searchable={options.koottaymas.length > 6}
                    helperText={
                      !filters.parish
                        ? '← Select a Parish first'
                        : isLoading.koottaymas
                        ? 'Loading koottaymas…'
                        : `${options.koottaymas.length} koottaymas available`
                    }
                  />
                </span>
              </Tooltip>
            </Grid>

            {/* Family (optional) */}
            <Grid item xs={12} md={6}>
              <Tooltip
                title={!filters.koottayma ? 'Please select a Koottayma first' : ''}
                placement="top"
                arrow
              >
                <span style={{ display: 'block' }}>
                  <SearchableSelect
                    // label="Family (optional)"
                    value={selectedFamily}
                    onChange={(e) => setSelectedFamily(e.target.value)}
                    options={[
                      { value: '', label: 'All Families', sublabel: `Print all ${familyList.length} families` },
                      ...familyList.map(f => ({
                        value: f._id,
                        label: f.name,
                        sublabel: f.headname ? `Head: ${f.headname}` : undefined,
                      })),
                    ]}
                    disabled={!filters.koottayma}
                    loading={isFamilyLoading}
                    placeholder="All Families"
                    searchable={familyList.length > 6}
                    helperText={
                      !filters.koottayma
                        ? '← Select a Koottayma first'
                        : isFamilyLoading
                        ? 'Loading families…'
                        : familyList.length > 0
                        ? `${familyList.length} families — leave blank to print all`
                        : 'No families found'
                    }
                  />
                </span>
              </Tooltip>
            </Grid>
          </Grid>

          {/* Summary */}
          {isReadyToLoad && (
            <SelectionSummary
              foraneName={foraneName}
              parishName={parishName}
              koottaymaName={koottaymaName}
              familyName={familyName}
              year={selectedYear}
            />
          )}

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Action */}
          <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
            <Button
              onClick={handleLoadData}
              disabled={loading || !isReadyToLoad}
              variant="contained"
              color="primary"
              size="large"
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <LocalPrintshopIcon />}
              sx={{ minWidth: 160, borderRadius: 2, fontWeight: 600 }}
            >
              {loading ? 'Loading…' : 'Load Data'}
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Box>
          <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
            <Button onClick={handleReset} variant="outlined" startIcon={<ArrowBackIcon />} sx={{ borderRadius: 2 }}>
              Back
            </Button>
            <Button
              onClick={handlePrint}
              disabled={loading}
              variant="contained"
              color="primary"
              startIcon={<PrintIcon />}
              sx={{ borderRadius: 2 }}
            >
              Print
            </Button>
            <Chip
              label={`${familiesData.length} ${familiesData.length === 1 ? 'family' : 'families'} loaded`}
              color="success"
              variant="outlined"
              icon={<CheckCircleIcon />}
            />
          </Stack>
          <BulkPrintLayout families={familiesData} currentYear={selectedYear} />
        </Box>
      )}
    </Box>
  );
};

// ─── Print Styles ─────────────────────────────────────────────────────────────
const printStyles = `
  @media print {
    @page { size: A4; margin: 1mm; }
    body > * { visibility: hidden; }
    .print-container { visibility: visible !important; position: absolute; left: 0; top: 0; width: 100%; }
    html, body { height: auto !important; overflow: visible !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background-color: white !important; }
    * { overflow: visible !important; }
    .no-print { display: none !important; }
    .print-container, .print-container * { visibility: visible; }
    .print-page { width: 285mm; min-height: 297mm; padding: 10mm; margin: 0 auto; background: white; box-sizing: border-box; break-inside: avoid; }
    .print-page:last-child { page-break-after: auto; }
    .print-table { table-layout: fixed; }
    .dialog-buttons, .no-print { display: none !important; }
    .MuiDialogContent-root { overflow: visible !important; }
    .print-table th { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background-color: #fff !important; }
  }
  @media print and (-webkit-min-device-pixel-ratio: 2), print and (min-resolution: 192dpi) {
    .print-table, .print-table th, .print-table td { border-width: 0.5pt !important; }
    .signature-line { border-width: 0.5pt; }
  }
  .print-container { background: white; }
  .print-table { width: 100%; -webkit-print-color-adjust: exact; color-adjust: exact; }
  .print-table th { background-color: #fff !important; -webkit-print-color-adjust: exact; color-adjust: exact; }
  @font-face { font-family: 'FML-TTAyilyamBold'; src: url('../fonts/FMLAL0NTT.ttf') format('truetype'); }
  @font-face { font-family: 'FML-TTGopika';      src: url('../fonts/FMLGP0BTT.ttf') format('truetype'); }
  @font-face { font-family: 'FML-TTGopika1';     src: url('../fonts/FMLGP0NTT.ttf') format('truetype'); }
  @font-face { font-family: 'FML-TTJaya';        src: url('../fonts/FMLJA0ITT.ttf') format('truetype'); }
  @font-face { font-family: 'FML-TTJyothy';      src: url('../fonts/FMLJY0NTT.ttf') format('truetype'); }
  @font-face { font-family: 'ML-TTAnakha';       src: url('../fonts/ML_TT_Anakha_Bold.ttf') format('truetype'); }
  @font-face { font-family: 'ML-TTMalavika';     src: url('../fonts/ML_TT_Malavika_Normal.ttf') format('truetype'); }
  @font-face { font-family: 'ML-TTKarthika';     src: url('../fonts/MLKR0NTT.TTF') format('truetype'); }
  @font-face { font-family: 'ML-TTRevathi';      src: url('../fonts/ML-TTRevathi-Normal.ttf') format('truetype'); }
  @font-face { font-family: 'ML-TTVinay';        src: url('../fonts/ML_TT_Vinay_Normal.ttf') format('truetype'); }
  @font-face { font-family: 'ML-TTThunchan';     src: url('../fonts/ML_TT_Thunchan_Normal.ttf') format('truetype'); }
  @font-face { font-family: 'Wingdings 2';       src: url('../fonts/WINGDNG2.TTF') format('truetype'); }
  @font-face { font-family: 'Arial';             src: url('../fonts/arial.ttf') format('truetype'); font-weight: bold; }
  @font-face { font-family: 'Times New Roman';   src: url('../fonts/times.ttf') format('truetype'); }
  .malayalam-text   { font-family: 'FML-TTAyilyamBold', sans-serif; }
  .malayalam-text1  { font-family: 'FML-TTGopika', sans-serif; }
  .malayalam-text2  { font-family: 'FML-TTJaya', sans-serif; }
  .malayalam-text3  { font-family: 'FML-TTGopika1', sans-serif; }
  .malayalam-text4  { font-family: 'FML-TTJyothy', sans-serif; }
  .malayalam-text5  { font-family: 'ML-TTRevathi', sans-serif; }
  .malayalam-text6  { font-family: 'ML-TTAnakha', sans-serif; }
  .malayalam-text7  { font-family: 'ML-TTMalavika', sans-serif; }
  .malayalam-text8  { font-family: 'ML-TTKarthika', sans-serif; }
  .malayalam-text9  { font-family: 'ML-TTRevathi', sans-serif; }
  .malayalam-text10 { font-family: 'ML-TTVinay', sans-serif; }
  .malayalam-text12 { font-family: 'ML-TTRevathi', sans-serif; }
  .malayalam-text13 { font-family: 'Wingdings 2', sans-serif; }
  .malayalam-text14 { font-family: 'Arial', sans-serif; letter-spacing: normal; }
  .malayalam-text15 { font-family: 'Times New Roman', sans-serif; letter-spacing: normal; }
  .print-table { width: 100%; border-collapse: collapse; border: 1px solid rgb(0, 0, 0); margin-bottom: 20px; }
  .print-table th, .print-table td { border: 1px solid rgb(0, 0, 0); padding-top: 0px; padding-bottom: 0px; padding-left: 8px; padding-right: 8px; font-size: 14px; }
  .print-table th { background-color: #fff; font-weight: bold; text-align: center; }
  .print-table .text-center { text-align: center; }
  .print-table .text-right  { text-align: right; }
  .print-table .font-bold   { font-weight: bold; }
  .total-row td { border-top: 1px solid rgb(0, 0, 0); border-bottom: 1px solid rgb(0, 0, 0); }
  .serial-column     { width: 45px; }
  .name-column       { width: 120px; }
  .relation-column   { width: 100px; }
  .gender-column     { width: 40px; }
  .date-column       { width: 60px; }
  .occupation-column { width: 100px; }
  .education-column  { width: 100px; }
  .amount-column     { width: 60px; }
`;

const style = document.createElement('style');
style.textContent = printStyles;
document.head.appendChild(style);

export default BulkFamilyPrintSystem;