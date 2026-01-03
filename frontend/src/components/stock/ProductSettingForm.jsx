import React, { useState, useEffect } from "react";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from "@mui/material";
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";

const ProductSettingForm = ({ initialData, onSave, onCancel, saving }) => {
  const [formData, setFormData] = useState({
    type: "Product",
    mainOrSub: "Main Store",
    storeLocation: "",
    locationGroup: "",
    storeCategory: "Online",
    productCategory: "Food",
    name: "",
    quality: "High",
    tax: 0,
    openingStock: 0,
    unit: "Piece",
    status: "Draft",
  });

  const storeOptions = ["Main Store", "Sub Store", "Add New"];
  const locationGroups = ["Group A", "Group B", "Group C", "Add New"];
  const typeOptions = ["Product", "Service"];
  const storeCategories = ["Online", "Raw Materials", "Finished Products", "Service", "Add New"];
  const productCategories = ["Food", "Drink", "Equipment", "Electronics", "Service Categories", "Add New"];
  const qualityOptions = ["High", "Medium", "Low"];
  const statusOptions = ["Draft", "Active", "Inactive"];
  const unitOptions = ["Piece", "Kg", "Gram", "Liter", "Pack", "Box", "Meter", "Botle", "Cas", "stal"];

  const [newStore, setNewStore] = useState("");
  const [newLocationGroup, setNewLocationGroup] = useState("");
  const [newStoreCategory, setNewStoreCategory] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({ ...formData, ...initialData });
    }
  }, [initialData]);

  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      backgroundColor: "rgba(255,255,255,0.7)",
      transition: "0.25s ease",
      "& fieldset": {
        borderColor: "rgba(0,0,0,0.15)",
      },
      "&:hover fieldset": {
        borderColor: "#0d9488",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#0d9488",
        boxShadow: "0 0 0 2px rgba(13,148,136,0.15)",
      },
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#0d9488",
    },
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddNew = (type) => {
    if (type === "mainOrSub" && newStore) {
      storeOptions.push(newStore);
      setFormData((prev) => ({ ...prev, mainOrSub: newStore }));
      setNewStore("");
    } else if (type === "locationGroup" && newLocationGroup) {
      locationGroups.push(newLocationGroup);
      setFormData((prev) => ({ ...prev, locationGroup: newLocationGroup }));
      setNewLocationGroup("");
    } else if (type === "storeCategory" && newStoreCategory) {
      storeCategories.push(newStoreCategory);
      setFormData((prev) => ({ ...prev, storeCategory: newStoreCategory }));
      setNewStoreCategory("");
    } else if (type === "productCategory" && newProductCategory) {
      productCategories.push(newProductCategory);
      setFormData((prev) => ({ ...prev, productCategory: newProductCategory }));
      setNewProductCategory("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div
      className="max-w-5xl mx-auto p-10"
      style={{
        background: "rgba(255, 255, 255, 0.6)",
        backdropFilter: "blur(14px)",
        borderRadius: "24px",
        border: "1px solid rgba(255,255,255,0.4)",
        boxShadow: "0 4px 30px rgba(0,0,0,0.06)",
      }}
    >
      {/* HEADER */}
      <h2 className="text-2xl font-bold text-gray-800 mb-10 flex items-center gap-3">
        <div className="w-2 h-8 rounded-full bg-teal-600"></div>
        {initialData ? "Edit Product Setting" : "Add Product or Service"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-14">

        {/* ==================== SECTION 1 ==================== */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            General Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ">

            {/* Type */}
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                label="Type"
                sx={inputStyle}
              >
                {typeOptions.map((opt) => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Store */}
            <FormControl fullWidth>
              <InputLabel>Store</InputLabel>
              <Select
                name="mainOrSub"
                value={formData.mainOrSub}
                onChange={handleChange}
                label="Store"
                sx={inputStyle}
              >
                {storeOptions.map((opt) => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {formData.mainOrSub === "Add New" && (
              <div className="flex gap-3 mt-2 col-span-2">
                <TextField
                  size="small"
                  placeholder="New store"
                  value={newStore}
                  onChange={(e) => setNewStore(e.target.value)}
                  className="flex-1"
                  sx={inputStyle}
                />
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleAddNew("mainOrSub")}
                  sx={{
                    bgcolor: "#0d9488",
                    "&:hover": { bgcolor: "#14b8a6" },
                    borderRadius: "10px",
                  }}
                >
                  Add
                </Button>
              </div>
            )}

            {/* Store Location */}
            <TextField
              fullWidth
              name="storeLocation"
              label="Store Location"
              value={formData.storeLocation}
              onChange={handleChange}
              placeholder="e.g., Kigali Main Store"
              sx={inputStyle}
            />

            {/* Location Group */}
            <FormControl fullWidth>
              <InputLabel>Location Group</InputLabel>
              <Select
                name="locationGroup"
                value={formData.locationGroup}
                onChange={handleChange}
                label="Location Group"
                sx={inputStyle}
              >
                {locationGroups.map((opt) => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {formData.locationGroup === "Add New" && (
              <div className="flex gap-3 mt-2 col-span-2">
                <TextField
                  size="small"
                  placeholder="New location group"
                  value={newLocationGroup}
                  onChange={(e) => setNewLocationGroup(e.target.value)}
                  className="flex-1"
                  sx={inputStyle}
                />
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleAddNew("locationGroup")}
                  sx={{
                    bgcolor: "#0d9488",
                    "&:hover": { bgcolor: "#14b8a6" },
                    borderRadius: "10px",
                  }}
                >
                  Add
                </Button>
              </div>
            )}

            {/* Store Category */}
            <FormControl fullWidth>
              <InputLabel>Store Category</InputLabel>
              <Select
                name="storeCategory"
                value={formData.storeCategory}
                onChange={handleChange}
                label="Store Category"
                sx={inputStyle}
              >
                {storeCategories.map((opt) => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {formData.storeCategory === "Add New" && (
              <div className="flex gap-3 mt-2 col-span-2">
                <TextField
                  size="small"
                  placeholder="New store category"
                  value={newStoreCategory}
                  onChange={(e) => setNewStoreCategory(e.target.value)}
                  className="flex-1"
                  sx={inputStyle}
                />
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleAddNew("storeCategory")}
                  sx={{
                    bgcolor: "#0d9488",
                    "&:hover": { bgcolor: "#14b8a6" },
                    borderRadius: "10px",
                  }}
                >
                  Add
                </Button>
              </div>
            )}

            {/* Product Category */}
            <FormControl fullWidth>
              <InputLabel>Product Category</InputLabel>
              <Select
                name="productCategory"
                value={formData.productCategory}
                onChange={handleChange}
                label="Product Category"
                sx={inputStyle}
              >
                {productCategories.map((opt) => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {formData.productCategory === "Add New" && (
              <div className="flex gap-3 mt-2 col-span-2">
                <TextField
                  size="small"
                  placeholder="New product category"
                  value={newProductCategory}
                  onChange={(e) => setNewProductCategory(e.target.value)}
                  className="flex-1"
                  sx={inputStyle}
                />
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleAddNew("productCategory")}
                  sx={{
                    bgcolor: "#0d9488",
                    "&:hover": { bgcolor: "#14b8a6" },
                    borderRadius: "10px",
                  }}
                >
                  Add
                </Button>
              </div>
            )}

          </div>
        </div>

        <div className="h-px bg-gray-200" />

        {/* ==================== SECTION 2 ==================== */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Product Details
          </h3>

          <TextField
            fullWidth
            name="name"
            label="Product / Service Name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter product or service name"
            required
            multiline
            rows={4}
            sx={inputStyle}
          />

        </div>

        <div className="h-px bg-gray-200" />

        {/* ==================== SECTION 3 ==================== */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Stock & Pricing
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* Quality */}
            <FormControl fullWidth>
              <InputLabel>Quality</InputLabel>
              <Select
                name="quality"
                value={formData.quality}
                onChange={handleChange}
                label="Quality"
                sx={inputStyle}
              >
                {qualityOptions.map((opt) => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Tax */}
            <TextField
              fullWidth
              name="tax"
              label="Tax (%)"
              type="number"
              value={formData.tax}
              onChange={handleChange}
              inputProps={{ min: 0, step: 0.01 }}
              sx={inputStyle}
            />

            {/* Opening Stock */}
            <TextField
              fullWidth
              name="openingStock"
              label="Opening Stock"
              type="number"
              value={formData.openingStock}
              onChange={handleChange}
              inputProps={{ min: 0 }}
              sx={inputStyle}
            />

            {/* Unit */}
            <FormControl fullWidth>
              <InputLabel>Unit</InputLabel>
              <Select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                label="Unit"
                sx={inputStyle}
              >
                {unitOptions.map((u) => (
                  <MenuItem key={u} value={u}>{u}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Status */}
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                label="Status"
                sx={inputStyle}
              >
                {statusOptions.map((opt) => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>

          </div>
        </div>

        {/* ==================== BUTTONS ==================== */}
        <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">

          <Button
            variant="outlined"
            onClick={onCancel}
            startIcon={<CancelIcon />}
            size="large"
            sx={{
              minWidth: 140,
              height: 48,
              borderRadius: "12px",
              borderColor: "rgb(209 213 219)",
              color: "rgb(55 65 81)",
              fontWeight: 500,
              "&:hover": {
                borderColor: "rgb(156 163 175)",
                bgcolor: "rgb(243 244 246)",
              },
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            startIcon={<SaveIcon />}
            size="large"
            sx={{
              minWidth: 140,
              height: 48,
              borderRadius: "12px",
              fontWeight: 600,
              background: "linear-gradient(135deg, #0d9488, #14b8a6)",
              boxShadow: "0 4px 14px rgba(13,148,136,0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #0f9e93, #1cc3b1)",
                boxShadow: "0 4px 20px rgba(13,148,136,0.4)",
              },
              "&:disabled": {
                bgcolor: "grey.400",
              },
            }}
          >
            {initialData ? "Update" : "Save"}
          </Button>
        </div>

      </form>
    </div>
  );
};

export default ProductSettingForm;
