import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  VisibilityOutlined as ViewIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';

const RequestManagement = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');
  const [action, setAction] = useState('');
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/requests/list/');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      showSnackbar('Failed to fetch requests', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.user_type === 'ADMIN') {
      fetchRequests();
    }
  }, [user, fetchRequests]);

  const handleResolveRequest = async () => {
    try {
      await api.put(`/requests/${selectedRequest.id}/resolve/`, {
        action: action,
        message: adminMessage
      });
      
      showSnackbar(`Request ${action}d successfully`, 'success');
      setResolveDialogOpen(false);
      setConfirmationDialogOpen(false);
      setSelectedRequest(null);
      setAdminMessage('');
      setAction('');
      fetchRequests();
    } catch (error) {
      console.error('Error resolving request:', error);
      showSnackbar('Failed to resolve request', 'error');
    }
  };

  const handleConfirmAction = () => {
    setResolveDialogOpen(false);
    setConfirmationDialogOpen(true);
  };

  const handleCancelConfirmation = () => {
    setConfirmationDialogOpen(false);
    setResolveDialogOpen(true);
  };

  const handleCloseResolveDialog = () => {
    setResolveDialogOpen(false);
    setSelectedRequest(null);
    setAdminMessage('');
    setAction('');
  };



  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  const formatRequestType = (type) => {
    if (!type) return '';
    if (type.startsWith('DELETE_')) return type.replace('DELETE_', '');
    return type.replaceAll('_', ' ');
  };

  const columns = [
    {
      field: 'request_type',
      headerName: 'Request Type',
      flex: 1,
      renderCell: (params) => (
        <Chip 
          label={formatRequestType(params.value)} 
          color="primary" 
          size="small" 
        />
      )
    },
    {
      field: 'object_title',
      headerName: 'Object',
      flex: 1
    },
    {
      field: 'requested_by',
      headerName: 'Requested By',
      flex: 1
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={getStatusColor(params.value)} 
          size="small" 
        />
      )
    },
    {
      field: 'created_at',
      headerName: 'Created',
      flex: 1,
      renderCell: (params) => new Date(params.value).toLocaleDateString()
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View">
            <IconButton
              onClick={() => {
                setSelectedRequest(params.row);
                setAdminMessage('');
                setAction('');
                setResolveDialogOpen(true);
              }}
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  if (user?.user_type !== 'ADMIN') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Only admin users can access request management.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Request Management
      </Typography>
      
      <Paper sx={{ height: '70vh', width: '100%', mt: 2 }}>
        <DataGrid
          rows={requests}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
          loading={loading}
          getRowId={(row) => row.id}
          disableColumnMenu
        />
      </Paper>

      {/* Resolve Request Dialog */}
      <Dialog 
        open={resolveDialogOpen} 
        onClose={handleCloseResolveDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {action === 'approve' ? 'Approve Request' : action === 'reject' ? 'Reject Request' : 'Request Details'}
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Request Type:</strong> {formatRequestType(selectedRequest.request_type)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Object:</strong> {selectedRequest.object_title}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Requested By:</strong> {selectedRequest.requested_by}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Status:</strong> {selectedRequest.status}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Created:</strong> {new Date(selectedRequest.created_at).toLocaleString()}
              </Typography>
              {selectedRequest.message && (
              <Typography variant="body1" gutterBottom>
                <strong>Message:</strong> {selectedRequest.message}
              </Typography>
              )}
              {selectedRequest.resolved_by && (
                <Typography variant="body1" gutterBottom>
                  <strong>Resolved By:</strong> {selectedRequest.resolved_by}
                </Typography>
              )}
              {selectedRequest.resolved_at && (
                <Typography variant="body1" gutterBottom>
                  <strong>Resolved At:</strong> {new Date(selectedRequest.resolved_at).toLocaleString()}
                </Typography>
              )}
              
              {selectedRequest.status === 'PENDING' && (action === 'approve' || action === 'reject') && (
                <TextField
                  margin="normal"
                  fullWidth
                  label="Admin Response (Optional)"
                  multiline
                  rows={4}
                  value={adminMessage}
                  onChange={(e) => setAdminMessage(e.target.value)}
                  placeholder="Add a response message..."
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResolveDialog}>
            Cancel
          </Button>
          {selectedRequest?.status === 'PENDING' && !action && (
            <>
              <Tooltip title="Approve" arrow>
                <IconButton
                  onClick={() => {
                    setAdminMessage('');
                    setAction('approve');
                  }}
                  color="success"
                >
                  <ApproveIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reject" arrow>
                <IconButton
                  onClick={() => {
                    setAdminMessage('');
                    setAction('reject');
                  }}
                  color="error"
                >
                  <RejectIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
          {selectedRequest?.status === 'PENDING' && (action === 'approve' || action === 'reject') && (
            <Button
              onClick={() => {
                setAdminMessage('');
                setAction('');
              }}
              variant="text"
            >
              Back
            </Button>
          )}
          {selectedRequest?.status === 'PENDING' && (action === 'approve' || action === 'reject') && (
            <Button 
              onClick={handleConfirmAction} 
              variant="contained"
              color={action === 'approve' ? 'success' : 'error'}
            >
              {action === 'approve' ? 'Approve' : 'Reject'} Request
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog 
        open={confirmationDialogOpen} 
        onClose={handleCancelConfirmation} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          Confirm {action === 'approve' ? 'Approval' : 'Rejection'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to {action === 'approve' ? 'approve' : 'reject'} this request?
          </Typography>
          {selectedRequest && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Request Type:</strong> {formatRequestType(selectedRequest.request_type)}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Object:</strong> {selectedRequest.object_title}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Requested By:</strong> {selectedRequest.requested_by}
              </Typography>
              {adminMessage && (
                <Typography variant="body2" gutterBottom>
                  <strong>Your Response:</strong> {adminMessage}
                </Typography>
              )}
            </Box>
          )}
          {action === 'approve' && selectedRequest?.request_type?.startsWith('DELETE_') && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <strong>Warning:</strong> This action will get hide from the user {selectedRequest?.request_type?.replace('DELETE_', '').toLowerCase()}.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelConfirmation}>
            Cancel
          </Button>
          <Button 
            onClick={handleResolveRequest} 
            variant="contained"
            color={action === 'approve' ? 'success' : 'error'}
          >
            {action === 'approve' ? 'Yes, Approve' : 'Yes, Reject'}
          </Button>
        </DialogActions>
      </Dialog>



      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RequestManagement; 
