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
  Assessment as ReportsIcon,
  Dashboard as DashboardIcon,
  Balance as TrialBalanceIcon,
  AccountBalance as FinancialIcon,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import { useStockAuth } from "../../context/StockAuthContext.jsx";

const iconMap = {
  "Reports Dashboard": DashboardIcon,
  "Trial Balance": TrialBalanceIcon,
  "Financial Reports": FinancialIcon,
};

export default function ReportLinks({ theme, themeColors }) {
  const { user, loading } = useStockAuth();
  const [openReports, setOpenReports] = useState(false);

  const reportLinks = [
    { to: "/stock/reports-dashboard", label: "Reports Dashboard", roles: ["ADMIN", "MANAGER", "ACCOUNTANT"], icon: "Reports Dashboard" },
    { to: "/stock/trialbalance", label: "Trial Balance", roles: ["ADMIN", "ACCOUNTANT", "MANAGER"], icon: "Trial Balance" },
    { to: "/stock/financial", label: "Financial Reports", roles: ["ADMIN", "ACCOUNTANT", "MANAGER"], icon: "Financial Reports" },
  ];

  if (loading) {
    return (
      <ListItem>
        <ListItemText primary="Loading menu..." sx={{ color: "rgba(255, 255, 255, 0.7)" }} />
      </ListItem>
    );
  }

  const filteredLinks = user
    ? reportLinks.filter((link) => link.roles.includes(user.role))
    : [];

  useEffect(() => {
    if (filteredLinks.length > 0) setOpenReports(true);
  }, [filteredLinks.length]);

  return (
    <ListItem disablePadding sx={{ display: "block" }}>
      <ListItemButton
        onClick={() => setOpenReports(!openReports)}
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
          <ReportsIcon />
        </ListItemIcon>
        <ListItemText
          primary="Reports"
          primaryTypographyProps={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "white",
          }}
        />
        {openReports ? <ExpandLess sx={{ color: "white" }} /> : <ExpandMore sx={{ color: "white" }} />}
      </ListItemButton>

      <Collapse in={openReports} timeout="auto" unmountOnExit>
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
              const IconComponent = iconMap[item.icon] || ReportsIcon;
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
