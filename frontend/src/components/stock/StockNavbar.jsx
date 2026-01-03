// frontend/src/components/stock/StockNavbar.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Avatar,
  Typography,
  Chip,
  Button,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import {
  Logout as LogoutIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useStockAuth } from "../../context/StockAuthContext.jsx";

export default function StockNavbar() {
  const { user, logout } = useStockAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    window.location.href = '/stock/login';
  };

  // Show login/register when NOT logged in, show profile when logged in
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      {!user ? (
        <>
          <Button
            component={Link}
            to="/stock/register"
            variant="outlined"
            sx={{
              color: "white",
              borderColor: "rgba(255, 255, 255, 0.5)",
              "&:hover": {
                borderColor: "white",
                bgcolor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            Register
          </Button>
          <Button
            component={Link}
            to="/stock/login"
            variant="contained"
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.2)",
              color: "white",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.3)",
              },
            }}
          >
            Login
          </Button>
        </>
      ) : (
        <Avatar
          onClick={handleClick}
          sx={{
            width: 40,
            height: 40,
            bgcolor: "rgba(255, 255, 255, 0.2)",
            color: "white",
            fontSize: "1rem",
            fontWeight: 600,
            border: "2px solid rgba(255, 255, 255, 0.3)",
            cursor: "pointer",
            "&:hover": {
              bgcolor: "rgba(255, 255, 255, 0.3)",
              borderColor: "rgba(255, 255, 255, 0.5)",
            },
          }}
        >
          {user.name?.charAt(0)?.toUpperCase() || "U"}
        </Avatar>
      )}

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 200,
            borderRadius: 2,
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.15))",
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: "primary.main",
                color: "white",
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {user?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 0.5, mt: 1.5 }}>
            <Chip
              label={user?.role}
              size="small"
              sx={{ fontSize: "0.7rem", height: 22 }}
            />
            <Chip
              label={user?.department}
              size="small"
              sx={{ fontSize: "0.7rem", height: 22 }}
            />
          </Box>
        </Box>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
          <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
}
