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
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  PointOfSale as SalesIcon,
  LocalPharmacy as DispenseIcon,
  Description as JournalIcon,
  Receipt as ExpenseIcon,
  Assessment as ReportsIcon,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import { useStockAuth } from "../../context/StockAuthContext.jsx";

const iconMap = {
  Inventory: InventoryIcon,
  Purchases: ShoppingCartIcon,
  "Customer/Sales": SalesIcon,
  Dispense: DispenseIcon,
  Journals: JournalIcon,
  Expenses: ExpenseIcon,
  Reports: ReportsIcon,
};

export default function StockLinks({ theme, themeColors }) {
  const { user, loading } = useStockAuth();
  const [openStock, setOpenStock] = useState(false);

  const stockLinks = [
    { to: "/stock/inventory", label: "Inventory", roles: ["ADMIN", "MANAGER", "STOREKEEPER", "ACCOUNTANT"], icon: "Inventory" },
    { to: "/stock/purchases", label: "Purchases", roles: ["ADMIN", "PURCHASER", "MANAGER", "ACCOUNTANT"], icon: "Purchases" },
    { to: "/stock/sales", label: "Customer/Sales", roles: ["ADMIN", "SALES", "MANAGER", "ACCOUNTANT"], icon: "Customer/Sales" },
    { to: "/stock/dispense", label: "Dispense", roles: ["ADMIN", "STOREKEEPER", "MANAGER"], icon: "Dispense" },
    { to: "/stock/general-journal", label: "Journals", roles: ["ADMIN", "ACCOUNTANT", "MANAGER"], icon: "Journals" },
    { to: "/stock/expenses", label: "Expenses", roles: ["ADMIN", "ACCOUNTANT", "MANAGER"], icon: "Expenses" },
    { to: "/stock/reports-dashboard", label: "Reports", roles: ["ADMIN", "MANAGER", "ACCOUNTANT"], icon: "Reports" },
  ];

  if (loading) {
    return (
      <ListItem>
        <ListItemText primary="Loading menu..." sx={{ color: "rgba(255, 255, 255, 0.7)" }} />
      </ListItem>
    );
  }

  const filteredLinks = user
    ? stockLinks.filter((link) => link.roles.includes(user.role))
    : [];

  useEffect(() => {
    if (filteredLinks.length > 0) setOpenStock(true);
  }, [filteredLinks.length]);

  return (
    <ListItem disablePadding sx={{ display: "block" }}>
      <ListItemButton
        onClick={() => setOpenStock(!openStock)}
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
          <InventoryIcon />
        </ListItemIcon>
        <ListItemText
          primary="Stock Management"
          primaryTypographyProps={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "white",
          }}
        />
        {openStock ? <ExpandLess sx={{ color: "white" }} /> : <ExpandMore sx={{ color: "white" }} />}
      </ListItemButton>

      <Collapse in={openStock} timeout="auto" unmountOnExit>
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
              const IconComponent = iconMap[item.icon] || InventoryIcon;
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
