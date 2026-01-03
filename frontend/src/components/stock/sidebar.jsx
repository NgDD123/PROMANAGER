import React, { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  LocalPharmacy as PharmacyIcon,
  Palette as PaletteIcon,
} from "@mui/icons-material";
import { useStockAuth } from "../../context/StockAuthContext";
import StockLinks from "./stockLinks";
import SettingsLinks from "./SettingsLinks";
import ReportLinks from "./ReportsLinks";
import Production from "./ProductionLink";

const drawerWidth = 320;

export default function Sidebar() {
  const [theme, setTheme] = useState("teal");
  const { user } = useStockAuth();

  const toggleTheme = () => {
    setTheme((prev) => (prev === "teal" ? "cyan" : "teal"));
  };

  const themeColors = {
    teal: {
      primary: "#0d9488",
      secondary: "#14b8a6",
      dark: "#134e4a",
      light: "#2dd4bf",
      gradient: "linear-gradient(180deg, #134e4a 0%, #0d9488 50%, #14b8a6 100%)",
    },
    cyan: {
      primary: "#0891b2",
      secondary: "#06b6d4",
      dark: "#164e63",
      light: "#22d3ee",
      gradient: "linear-gradient(180deg, #164e63 0%, #0891b2 50%, #06b6d4 100%)",
    },
  };

  const currentTheme = themeColors[theme];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          background: currentTheme.gradient,
          color: "white",
          boxShadow: "4px 0 20px rgba(0, 0, 0, 0.15)",
          borderRight: "none",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
            background: "rgba(255, 255, 255, 0.05)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <PharmacyIcon sx={{ fontSize: 32, color: "white" }} />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                letterSpacing: "0.5px",
                color: "white",
              }}
            >
              E-Pharmacy
            </Typography>
          </Box>
          <Tooltip title={`Switch to ${theme === "teal" ? "Cyan" : "Teal"} theme`}>
            <IconButton
              onClick={toggleTheme}
              sx={{
                color: "white",
                bgcolor: "rgba(255, 255, 255, 0.2)",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.3)",
                },
              }}
              size="small"
            >
              <PaletteIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Navigation */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            px: 2,
            py: 3,
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: `linear-gradient(180deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
              borderRadius: "10px",
              "&:hover": {
                background: `linear-gradient(180deg, ${currentTheme.secondary}, ${currentTheme.light})`,
              },
            },
          }}
        >
          <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0, display: "flex", flexDirection: "column", gap: 1.5 }}>
            <SettingsLinks theme={theme} themeColors={currentTheme} />
            <StockLinks theme={theme} themeColors={currentTheme} />
            <Production theme={theme} themeColors={currentTheme} />
            <ReportLinks theme={theme} themeColors={currentTheme} />
          </Box>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            p: 2,
            textAlign: "center",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            background: "rgba(255, 255, 255, 0.05)",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "0.75rem",
            }}
          >
            © 2025 E-Pharmacy System
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
}
