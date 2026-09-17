import React from 'react';
import { Box, Container, Grid, Typography, Link } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled components
const FooterWrapper = styled(Box)(({ theme }) => ({
  background: '#fafafa',
  borderTop: '1px solid rgb(229, 231, 235)',
  padding: '24px 0',
  position: 'relative',
  bottom: 0,
  width: '100%'
}));

const Copyright = styled(Typography)(({ theme }) => ({
  color: 'rgb(71, 84, 103)',
  fontSize: '14px',
  '& a': {
    color: 'rgb(66, 102, 242)',
    fontWeight: 500,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline'
    }
  }
}));

const FooterNav = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '24px',
  [theme.breakpoints.down('md')]: {
    justifyContent: 'flex-start',
    marginTop: '16px'
  }
}));

const FooterLink = styled(Link)(({ theme }) => ({
  color: 'rgb(107, 114, 128)',
  fontSize: '14px',
  textDecoration: 'none',
  '&:hover': {
    color: 'rgb(66, 102, 242)',
    textDecoration: 'none'
  }
}));

const Footer = () => {
  return (
    <FooterWrapper>
      <Container maxWidth={false}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Copyright variant="body2">
              © {new Date().getFullYear()},{' '}
              <Link
                href="#"
                target="_blank"
                rel="noopener noreferrer"
              >
                AJCE
              </Link>
            </Copyright>
          </Grid>
          <Grid item xs={12} md={6}>
            <FooterNav>
              <FooterLink href="#" target="_blank">
                About Us
              </FooterLink>
              <FooterLink href="#" target="_blank">
                Privacy Policy
              </FooterLink>
              <FooterLink href="#" target="_blank">
                Terms of Service
              </FooterLink>
              <FooterLink href="#" target="_blank">
                Contact
              </FooterLink>
            </FooterNav>
          </Grid>
        </Grid>
      </Container>
    </FooterWrapper>
  );
};

export default Footer;