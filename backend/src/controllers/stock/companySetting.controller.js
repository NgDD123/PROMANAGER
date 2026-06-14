import { CompanySettingModel } from "../../models/stock/companySetting.model.js";

const getLoginCompanyName = (user = {}) =>
  user.company ||
  user.organizationName ||
  user.businessName ||
  user.companyName ||
  user.name ||
  "";

export const CompanySettingController = {
  async get(req, res) {
    try {
      const settings = await CompanySettingModel.get();
      const loginCompanyName = getLoginCompanyName(req.user);
      return res.status(200).json({
        ...settings,
        companyName: loginCompanyName || settings.companyName || "",
      });
    } catch (err) {
      console.error("Error fetching company settings:", err);
      return res.status(500).json({ error: "Failed to fetch company settings" });
    }
  },

  async save(req, res) {
    try {
      const settings = await CompanySettingModel.save({
        ...req.body,
        companyName: req.body.companyName || getLoginCompanyName(req.user),
      });
      return res.status(200).json(settings);
    } catch (err) {
      console.error("Error saving company settings:", err);
      return res.status(500).json({ error: "Failed to save company settings" });
    }
  },
};
