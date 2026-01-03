import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Inventory2 as ProductSettingsIcon,
  AccountTree as ChartIcon,
  Business as FixedAssetsIcon,
  Person as UserIcon,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import { useStockAuth } from "../../context/StockAuthContext.jsx";

const iconMap = {
  "Product Settings": ProductSettingsIcon,
  "Chart of Accounts": ChartIcon,
  "Fixed Assets": FixedAssetsIcon,
  "User Settings": UserIcon,
};

export default function SettingsLinks({ theme, themeColors }) {
  const { user, loading } = useStockAuth();
  const [openSettings, setOpenSettings] = useState(false);

  const settingsLinks = [
    { to: "/stock/product-settings", label: "Product Settings", roles: ["ADMIN", "MANAGER"], icon: "Product Settings" },
    { to: "/stock/charts-of-accounts", label: "Chart of Accounts", roles: ["ADMIN", "ACCOUNTANT"], icon: "Chart of Accounts" },
    { to: "/stock/fixed-assets", label: "Fixed Assets", roles: ["ADMIN", "ACCOUNTANT", "MANAGER"], icon: "Fixed Assets" },
    { to: "/stock/user-settings", label: "User Settings", roles: ["ADMIN", "MANAGER"], icon: "User Settings" },
  ];

  if (loading) {
    return (
      <ListItem>
        <ListItemText primary="Loading menu..." sx={{ color: "rgba(255, 255, 255, 0.7)" }} />
      </ListItem>
    );
  }

  const filteredLinks = user
    ? settingsLinks.filter((link) => link.roles.includes(user.role))
    : [];

  useEffect(() => {
    if (filteredLinks.length > 0) setOpenSettings(true);
  }, [filteredLinks.length]);

  return (
    <ListItem disablePadding sx={{ display: "block" }}>
      <ListItemButton
        onClick={() => setOpenSettings(!openSettings)}
        sx={{
          borderRadius: 2,
          mb: 1,
          bgcolor: "rgba(255, 255, 255, 0.1)",
          "&:hover": {
            bgcolor: "rgba(255, 255, 255, 0.2)",
          },
          py: 1.5,
        }}
      >
        <ListItemIcon sx={{ minWidth: 40, color: "white" }}>
          <SettingsIcon />
        </ListItemIcon>
        <ListItemText
          primary="Settings"
          primaryTypographyProps={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "white",
          }}
        />
        {openSettings ? <ExpandLess sx={{ color: "white" }} /> : <ExpandMore sx={{ color: "white" }} />}
      </ListItemButton>

      <Collapse in={openSettings} timeout="auto" unmountOnExit>
        <Box
          component="ul"
          sx={{
            listStyle: "none",
            p: 0,
            m: 0,
            pl: 4,
            borderLeft: `3px solid ${themeColors.secondary}`,
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
          }}
        >
          {filteredLinks.length > 0 ? (
            filteredLinks.map((item) => {
              const IconComponent = iconMap[item.icon] || SettingsIcon;
              return (
                <ListItem key={item.to} disablePadding>
                  <NavLink
                    to={item.to}
                    style={{ textDecoration: "none", width: "100%" }}
                  >
                    {({ isActive }) => (
                      <ListItemButton
                        sx={{
                          borderRadius: 1.5,
                          bgcolor: isActive
                            ? themeColors.secondary
                            : "transparent",
                          "&:hover": {
                            bgcolor: isActive
                              ? themeColors.light
                              : "rgba(255, 255, 255, 0.1)",
                          },
                          py: 1,
                          px: 2,
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36, color: "white" }}>
                          <IconComponent fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            fontSize: "0.9rem",
                            fontWeight: isActive ? 600 : 500,
                            color: "white",
                          }}
                        />
                      </ListItemButton>
                    )}
                  </NavLink>
                </ListItem>
              );
            })
          ) : (
            <ListItem>
              <ListItemText
                primary="No accessible pages"
                primaryTypographyProps={{
                  fontSize: "0.85rem",
                  color: "rgba(255, 255, 255, 0.5)",
                }}
              />
            </ListItem>
          )}
        </Box>
      </Collapse>
    </ListItem>
  );
}
