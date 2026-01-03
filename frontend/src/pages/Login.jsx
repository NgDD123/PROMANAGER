import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login, logout, user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const nav = useNavigate();

  const onSubmit = async e => {
    e.preventDefault();
    try {
      await login(email, password);
      nav('/'); // redirect after login
    } catch (err) {
      alert('Login failed: ' + err.message);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={onSubmit} style={styles.form}>
        <h2 style={styles.heading}>Login</h2>
        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={styles.input}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Login</button>

        {!loading && user && (
          <div style={styles.userInfo}>
            Logged in as: <b>{user.email}</b> <br />
            Role: <b>{user.role}</b>
            <br />
            <button
              type="button"
              style={styles.logoutButton}
              onClick={() => {
                logout();
                setEmail('');
                setPassword('');
                nav('/login');
              }}
            >
              Logout
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 128px)',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  form: {
    backgroundColor: 'rgb(44,145,145)',
    padding: '32px',
    borderRadius: '12px',
    maxWidth: '360px',
    width: '100%',
    display: 'grid',
    gap: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    color: '#fff',
  },
  heading: {
    textAlign: 'center',
    marginBottom: '16px',
    fontSize: '24px',
  },
  input: {
    padding: '10px',
    borderRadius: '6px',
    border: 'none',
    width: '100%',
    fontSize: '14px',
  },
  button: {
    marginTop: '16px',
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#23b758',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s', // smooth transition
  },
  userInfo: {
    marginTop: '12px',
    fontSize: '14px',
    color: '#fff',
  },
  logoutButton: {
    marginTop: 8,
    padding: '4px 8px',
    fontSize: '13px',
    backgroundColor: '#d9534f',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  },
};

// Hover effect: brightens the login button
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('form button[type="submit"]');
  if (btn) {
    btn.addEventListener('mouseenter', () => {
      btn.style.backgroundColor = '#2ee26a'; // brighter green on hover
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.backgroundColor = '#23b758'; // original green
    });
  }
});
