import React from 'react';

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <p>© {new Date().getFullYear()} E-Pharmacy. All rights reserved.</p>
      <div>
        <a href="/privacy" style={styles.link}>Privacy Policy</a> | 
        <a href="/terms" style={styles.link}>Terms of Service</a>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    padding: '12px',
    backgroundColor: 'rgb(44,145,145)', // updated background
    color: '#fff', // white text for contrast
    textAlign: 'center',
    fontSize: '14px',
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    opacity: 1, // fully opaque
  },
  link: {
    margin: '0 5px',
    color: '#fff', // white links
    textDecoration: 'none',
  },
};
