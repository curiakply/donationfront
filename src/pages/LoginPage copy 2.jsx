// src/pages/LoginPage.js
import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  ThemeProvider,
  createTheme,
  CssBaseline,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
  Backdrop,
  Fade,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Visibility,
  VisibilityOff,
  LockOutlined,
  Email,
  ArrowBack,
} from '@mui/icons-material';
import axiosInstance from "../axiosConfig";
import { setAuthToken } from "../utils/auth";
import logo from "../assets/images/diocese-logo-new5.webp";

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563EB',
      light: '#3B82F6',
      dark: '#1E40AF'
    },
    secondary: {
      main: '#10B981',
      light: '#34D399',
      dark: '#047857'
    }
  }
});

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  padding: theme.spacing(4),
  maxWidth: 400,
  width: '100%'
}));

const LoadingOverlay = styled(Backdrop)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  color: '#fff',
  flexDirection: 'column',
  backgroundColor: 'rgba(0, 0, 0, 0.7)'
}));

// OTP input - 6 individual boxes
const OtpInput = ({ value, onChange, disabled }) => {
  const inputRefs = useRef([]);
  const otpArr = value.split('').concat(Array(6 - value.length).fill(''));

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otpArr[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleInput = (e, idx) => {
    const val = e.target.value.replace(/\D/g, '');
    if (!val) return;
    const char = val.slice(-1);
    const newOtp = otpArr.slice();
    newOtp[idx] = char;
    onChange(newOtp.join(''));
    if (idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
      {otpArr.map((digit, idx) => (
        <TextField
          key={idx}
          inputRef={el => inputRefs.current[idx] = el}
          value={digit}
          onChange={(e) => handleInput(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onPaste={idx === 0 ? handlePaste : undefined}
          disabled={disabled}
          inputProps={{
            maxLength: 1,
            style: { textAlign: 'center', fontSize: '1.25rem', fontWeight: 600, padding: '10px 0' },
            inputMode: 'numeric',
          }}
          sx={{ width: 46, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
        />
      ))}
    </Box>
  );
};

const LoginPage = () => {
  // Login state
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot password state: 'login' | 'forgot-email' | 'forgot-otp' | 'forgot-reset'
  const [view, setView] = useState('login');
  const [fpEmail, setFpEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState(''); // token returned after OTP verify
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Countdown for resend OTP
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const resetForgotState = () => {
    setFpEmail('');
    setOtp('');
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setResendTimer(0);
  };

  const goBackToLogin = () => {
    resetForgotState();
    setView('login');
  };

  // --- Login ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const response = await axiosInstance.get(`/auth/login/${formData.username}/${formData.password}`);
      if (response.data && response.data.token) {
        setAuthToken(response.data.token);
        if (response.data.admin) {
          const userInfo = {
            id: response.data.admin.id || response.data.admin._id,
            name: response.data.admin.name || response.data.admin.username,
            email: response.data.admin.email || formData.username,
            role: response.data.admin.role || 'admin',
            phone: response.data.admin.phone,
            isActive: response.data.admin.isActive
          };
          localStorage.setItem('user', JSON.stringify(userInfo));
          if (userInfo.role === 'superadmin') {
            window.location.href = '/home';
          } else {
            window.location.href = '/home';
          }
        } else {
          await new Promise(resolve => setTimeout(resolve, 800));
          window.location.href = '/home';
        }
      } else {
        setError('Login failed - no token received');
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        switch (error.response.status) {
          case 401: setError('Invalid email or password'); break;
          case 403: setError(error.response.data?.message || 'Account access denied. Please contact administrator.'); break;
          case 400: setError('Please provide valid credentials'); break;
          default: setError(error.response.data?.message || 'Login failed. Please try again.');
        }
      } else if (error.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setLoading(false);
    }
  };

  // --- Forgot Password: Send OTP ---
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!fpEmail) { setError('Please enter your email'); return; }
    try {
      setLoading(true);
      setError('');
      await axiosInstance.post('/auth/forgot-password', { email: fpEmail });
      setSuccess('OTP sent to your email');
      setResendTimer(60);
      setView('forgot-otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- Forgot Password: Verify OTP ---
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) { setError('Please enter the 6-digit OTP'); return; }
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const res = await axiosInstance.post('/auth/verify-otp', { email: fpEmail, otp });
      setResetToken(res.data.resetToken || '');
      setView('forgot-reset');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await axiosInstance.post('/auth/forgot-password', { email: fpEmail });
      setOtp('');
      setSuccess('OTP resent to your email');
      setResendTimer(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // --- Forgot Password: Reset ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) { setError('Please fill in both fields'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    try {
      setLoading(true);
      setError('');
      await axiosInstance.post('/auth/reset-password', {
        email: fpEmail,
        resetToken,
        newPassword
      });
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => goBackToLogin(), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // --- Render helpers ---
  const renderBackButton = () => (
    <Button
      startIcon={<ArrowBack />}
      onClick={goBackToLogin}
      sx={{ alignSelf: 'flex-start', mb: 1, textTransform: 'none', color: 'text.secondary' }}
      disabled={loading}
    >
      Back to login
    </Button>
  );

  const renderAlerts = () => (
    <>
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 1 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 1 }}>{success}</Alert>}
    </>
  );

  const renderForgotEmail = () => (
    <Box component="form" onSubmit={handleSendOtp} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {renderBackButton()}
      <Typography variant="h6" fontWeight={600}>Forgot Password</Typography>
      <Typography variant="body2" color="text.secondary">
        Enter your registered email. We'll send a 6-digit OTP to reset your password.
      </Typography>
      {renderAlerts()}
      <TextField
        fullWidth
        label="Email"
        value={fpEmail}
        onChange={(e) => { setFpEmail(e.target.value); setError(''); }}
        disabled={loading}
        autoFocus
        type="email"
        InputProps={{
          startAdornment: <InputAdornment position="start"><Email /></InputAdornment>,
        }}
      />
      <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ py: 1.5 }}>
        {loading ? 'Sending...' : 'Send OTP'}
      </Button>
    </Box>
  );

  const renderForgotOtp = () => (
    <Box component="form" onSubmit={handleVerifyOtp} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {renderBackButton()}
      <Typography variant="h6" fontWeight={600}>Enter OTP</Typography>
      <Typography variant="body2" color="text.secondary">
        A 6-digit code was sent to <strong>{fpEmail}</strong>
      </Typography>
      {renderAlerts()}
      <OtpInput value={otp} onChange={(v) => { setOtp(v); setError(''); }} disabled={loading} />
      <Button type="submit" variant="contained" size="large" disabled={loading || otp.length !== 6} sx={{ py: 1.5 }}>
        {loading ? 'Verifying...' : 'Verify OTP'}
      </Button>
      <Box sx={{ textAlign: 'center' }}>
        <Button
          onClick={handleResendOtp}
          disabled={resendTimer > 0 || loading}
          sx={{ textTransform: 'none', fontSize: '0.85rem' }}
        >
          {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
        </Button>
      </Box>
    </Box>
  );

  const renderResetPassword = () => (
    <Box component="form" onSubmit={handleResetPassword} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {renderBackButton()}
      <Typography variant="h6" fontWeight={600}>Reset Password</Typography>
      <Typography variant="body2" color="text.secondary">
        Set a new password for your account.
      </Typography>
      {renderAlerts()}
      <TextField
        fullWidth
        label="New Password"
        type={showNewPassword ? 'text' : 'password'}
        value={newPassword}
        onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
        disabled={loading}
        autoFocus
        InputProps={{
          startAdornment: <InputAdornment position="start"><LockOutlined /></InputAdornment>,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end" disabled={loading}>
                {showNewPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <TextField
        fullWidth
        label="Confirm Password"
        type={showConfirmPassword ? 'text' : 'password'}
        value={confirmPassword}
        onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
        disabled={loading}
        InputProps={{
          startAdornment: <InputAdornment position="start"><LockOutlined /></InputAdornment>,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" disabled={loading}>
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ py: 1.5 }}>
        {loading ? 'Resetting...' : 'Reset Password'}
      </Button>
    </Box>
  );

  const renderLogin = () => (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <img src={logo} style={{ width: '100%' }} alt="Diocese Logo" />
        <Typography variant="body2" color="text.secondary">
          Please sign in to continue
        </Typography>
      </Box>
      {renderAlerts()}
      <TextField
        fullWidth
        label="Email"
        name="username"
        value={formData.username}
        onChange={handleChange}
        disabled={loading}
        autoComplete="email"
        autoFocus
        InputProps={{
          startAdornment: <InputAdornment position="start"><Email /></InputAdornment>,
        }}
      />
      <TextField
        fullWidth
        label="Password"
        name="password"
        type={showPassword ? 'text' : 'password'}
        value={formData.password}
        onChange={handleChange}
        disabled={loading}
        autoComplete="current-password"
        InputProps={{
          startAdornment: <InputAdornment position="start"><LockOutlined /></InputAdornment>,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" disabled={loading}>
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Box sx={{ textAlign: 'right', mt: -1 }}>
        <Button
          onClick={() => { resetForgotState(); setView('forgot-email'); }}
          sx={{ textTransform: 'none', fontSize: '0.85rem', p: 0, minWidth: 'auto' }}
        >
          Forgot Password?
        </Button>
      </Box>
      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={loading}
        sx={{ py: 1.5, backgroundColor: 'primary.main', '&:hover': { backgroundColor: 'primary.dark' } }}
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </Button>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 3,
          background: 'linear-gradient(120deg, #E2E8F0 0%, #F8FAFC 100%)'
        }}
      >
        <LoadingOverlay open={loading}>
          <CircularProgress color="inherit" size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {view === 'login' ? 'Logging in...' : 'Please wait...'}
          </Typography>
        </LoadingOverlay>

        <StyledCard>
          {view === 'login' && renderLogin()}
          {view === 'forgot-email' && renderForgotEmail()}
          {view === 'forgot-otp' && renderForgotOtp()}
          {view === 'forgot-reset' && renderResetPassword()}
        </StyledCard>
      </Box>
    </ThemeProvider>
  );
};

export default LoginPage;