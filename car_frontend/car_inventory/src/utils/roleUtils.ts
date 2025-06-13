// src/utils/roleUtils.ts
export const canView = (role: string, action: string): boolean => {
    const permissions: Record<string, string[]> = {
      admin: [
        "view_cars", "add_car", "edit_car", "delete_car",
        "view_statistics", "view_average_price", "view_expensive",
        "view_low_stock", "manage_sales", "manage_customers",
      ],
      staff: [
        "view_cars", "view_statistics", "view_average_price",
        "view_expensive", "view_low_stock", "manage_sales",
      ],
      customer: [
        "view_cars", "view_statistics", "view_average_price",
      ],
    };
  
    return permissions[role]?.includes(action) ?? false;
  };
  