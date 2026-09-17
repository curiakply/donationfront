// components/PersonalInfoTable.jsx
import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  IconButton,
  Stack,
  TextField,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  SwapHoriz as MoveIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { MaterialReactTable } from 'material-react-table';
import { alpha } from '@mui/material/styles';

const PersonalInfoTable = ({
  persons,
  transactions,
  onPersonMove,
  onStatusChange,
  onRefreshData,
  onSaveRow,
}) => {
  const [isEditingRow, setIsEditingRow] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const currentYear = new Date().getFullYear();

  const handleValidation = (values) => {
    const errors = {};
    if (!values.name) errors.name = 'Name is required';
    if (!values.baptismName) errors.baptismName = 'Baptism Name is required';
    if (!values.relation) errors.relation = 'Relation is required';
    if (!values.gender) errors.gender = 'Gender is required';
    if (!values.dob) errors.dob = 'Date of Birth is required';
    return errors;
  };

  const handleEditStart = () => {
    setIsEditingRow(true);
  };

  const handleEditCancel = () => {
    setIsEditingRow(false);
    setValidationErrors({});
  };

  const handleSaveRow = async ({ exitEditingMode, row, values }) => {
    const errors = handleValidation(values);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    await onSaveRow(values, row.original);
    exitEditingMode();
    setIsEditingRow(false);
    setValidationErrors({});
    onRefreshData();
  };

  const columns = [
    {
      accessorKey: 'baptismName',
      header: 'Baptism',
      size: 70,
      enableEditing: true,
      muiTableBodyCellEditTextFieldProps: {
        required: true,
        error: !!validationErrors.baptismName,
        helperText: validationErrors.baptismName,
      },
    },
    {
      accessorKey: 'name',
      header: 'Name',
      size: 70,
      enableEditing: true,
      muiTableBodyCellEditTextFieldProps: {
        required: true,
        error: !!validationErrors.name,
        helperText: validationErrors.name,
      },
    },
    {
      accessorKey: 'relation',
      header: 'Rel.',
      size: 60,
      enableEditing: true,
      editVariant: 'select',
      editSelectOptions: ['head', 'wife', 'son', 'daughter', 'other'],
      muiTableBodyCellEditTextFieldProps: {
        select: true,
        required: true,
        error: !!validationErrors.relation,
        helperText: validationErrors.relation,
      },
    },
    // Add other columns similar to the original implementation
  ];

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        borderRadius: 3, 
        p: 3,
        background: 'linear-gradient(to right, #ffffff 0%, #f9fafe 100%)',
      }}
    >
      <Box sx={{ width: '100%', overflow: 'auto' }}>
        <MaterialReactTable
          columns={columns}
          data={persons}
          enableRowActions
          enableEditing
          editDisplayMode="row"
          onEditingRowSave={handleSaveRow}
          onEditingRowCancel={handleEditCancel}
          renderRowActions={({ row, table }) => (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {table.getState().editingRow?.id === row.id ? (
                <>
                  <Tooltip title="Save">
                    <IconButton
                      color="primary"
                      onClick={() => handleSaveRow({
                        exitEditingMode: () => table.setEditingRow(null),
                        row,
                        values: row._values// components/PersonalInfoTable.jsx (continued)
                    })}
                  >
                    <SaveIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cancel">
                  <IconButton
                    color="error"
                    onClick={() => {
                      table.setEditingRow(null);
                      handleEditCancel();
                    }}
                  >
                    <CancelIcon />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <>
                <Tooltip title="Edit">
                  <IconButton
                    onClick={() => {
                      table.setEditingRow(row);
                      handleEditStart();
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Move to Another Family">
                  <IconButton
                    onClick={() => onPersonMove(row.original)}
                  >
                    <MoveIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Change Status">
                  <IconButton
                    onClick={() => onStatusChange(row.original)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        )}
        muiTableBodyCellProps={({ cell }) => ({
          sx: {
            backgroundColor: cell.row.isEditing ? alpha('#1976d2', 0.1) : undefined,
          },
        })}
      />
    </Box>
  </Paper>
);
};

export default PersonalInfoTable;