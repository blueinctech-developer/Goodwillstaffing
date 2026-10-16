import type { ComponentType } from "react";
import { StaffingCostCalculator } from "./StaffingCostCalculator";

// Interactive pages referenced by name from imported content
// ({ type: "custom", component }); see CUSTOM_PAGES in the importer.
export const CUSTOM_COMPONENTS: Record<string, ComponentType> = {
  StaffingCostCalculator,
};
