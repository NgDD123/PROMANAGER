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
  PrecisionManufacturing as ProductionIcon,
  Assignment as PlanIcon,
  Inventory as FinishedGoodsIcon,
  Science as MaterialIcon,
  Loop as CycleIcon,
  AttachMoney as CostIcon,
  CalendarToday as PlanningIcon,
  Assessment as ReportsIcon,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import { useStockAuth } from "../../context/StockAuthContext.jsx";

const iconMap = {
  "Production Plan": PlanIcon,
  "Finished Goods": FinishedGoodsIcon,
  "Material Consumptions": MaterialIcon,
  "Production Cycle": CycleIcon,
  "Production Cost": CostIcon,
  "Planning Production": PlanningIcon,
  "Production Reports": ReportsIcon,
};

export default function ProductionLinks({ theme, themeColors }) {
  const { user, loading } = useStockAuth();
  const [openProduction, setOpenProduction] = useState(false);

  const productionLinks = [
    { to: "/stock/production-plan", label: "Production Plan", roles: ["ADMIN", "PRODUCTIONMANAGER"], icon: "Production Plan" },
    { to: "/stock/finished-goods", label: "Finished Goods", roles: ["ADMIN", "PRODUCTIONMANAGER", "STOREKEEPER", "ACCOUNTANT"], icon: "Finished Goods" },
    { to: "/stock/material-consumptions", label: "Material Consumptions", roles: ["ADMIN", "PRODUCTIONMANAGER", "ACCOUNTANT"], icon: "Material Consumptions" },
    { to: "/stock/production-cycle", label: "Production Cycle", roles: ["ADMIN", "PRODUCTIONMANAGER"], icon: "Production Cycle" },
    { to: "/stock/production-cost", label: "Production Cost", roles: ["ADMIN", "ACCOUNTANT", "MANAGER"], icon: "Production Cost" },
    { to: "/stock/production-planning", label: "Planning Production", roles: ["ADMIN", "PRODUCTIONMANAGER"], icon: "Planning Production" },
    { to: "/stock/production-reports", label: "Production Reports", roles: ["ADMIN", "MANAGER"], icon: "Production Reports" },
  ];

  if (loading) {
    return (
      <ListItem>
        <ListItemText primary="Loading menu..." sx={{ color: "rgba(255, 255, 255, 0.7)" }} />
      </ListItem>
    );
  }

  const filteredLinks = user
    ? productionLinks.filter((link) => link.roles.includes(user.role))
    : [];

  useEffect(() => {
    if (filteredLinks.length > 0) setOpenProduction(true);
  }, [filteredLinks.length]);

  return (
    <ListItem disablePadding sx={{ display: "block" }}>
      <ListItemButton
        onClick={() => setOpenProduction(!openProduction)}
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
          <ProductionIcon />
        </ListItemIcon>
        <ListItemText
          primary="Production Futures"
          primaryTypographyProps={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "white",
          }}
        />
        {openProduction ? <ExpandLess sx={{ color: "white" }} /> : <ExpandMore sx={{ color: "white" }} />}
      </ListItemButton>

      <Collapse in={openProduction} timeout="auto" unmountOnExit>
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
              const IconComponent = iconMap[item.icon] || ProductionIcon;
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
