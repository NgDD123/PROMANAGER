import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav style={styles.nav}>
      <Link to='/' style={styles.link}>Home</Link>
      <Link to='/pharmacies' style={styles.link}>Doctor: Pharmacies</Link>
       <Link to='/prescription' style={styles.link}>Prescription</Link>
    <Link to='/quotes' style={styles.link}>Quotes</Link>
      <Link to='/orders' style={styles.link}>Orders</Link>
      <Link to='/clinics' style={styles.link}>Clinics</Link> 
      <Link to='/branding' style={styles.link}>Branding</Link>
      <Link to='/payments' style={styles.link}>Payments</Link>  
       <Link to='/admin' style={styles.link}>Admin</Link> 
      <Link to='/register' style={styles.link}>Register</Link>
      <Link to='/login' style={{ ...styles.link, marginLeft: 'auto' }}>Login</Link>
      <Link to='/pharmacy-rx' style={styles.link}>Pharmacy Dashboard</Link>
      <Link to='/callcenter' style={styles.link}>Call Center</Link>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    gap: 40,
    padding: '12px 20px',
    flexWrap: 'wrap',
    alignItems: 'center',
    backgroundColor: 'rgb(35,183,88)',
    color: '#fff',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    opacity: 1,
  },
  link: {
    color: '#fff',          // white text
    textDecoration: 'none', // remove underline
    transition: 'color 0.2s',
  },
};

// Add hover effect for links
document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('nav a');
  links.forEach(link => {
    link.addEventListener('mouseenter', () => {
      link.style.color = '#e0ffd8'; // slightly brighter on hover
    });
    link.addEventListener('mouseleave', () => {
      link.style.color = '#fff';
    });
  });
});
