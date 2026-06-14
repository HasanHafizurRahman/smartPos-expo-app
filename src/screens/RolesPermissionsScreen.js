import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import useRoles from "../hooks/useRoles";
import useRoleForm from "../hooks/useRoleForm";
import { findAccessByRoleId, saveAccess } from "../services/api/settings/roleMenuApi";
import Svg, { Path } from "react-native-svg";

const { width: screenWidth } = Dimensions.get("window");

const BackIcon = ({ size = 20, color = "#111827" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 12H5M12 19l-7-7 7-7" />
  </Svg>
);

const SearchIcon = ({ size = 16, color = "#9CA3AF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="11" cy="11" r="8" />
    <Path d="M21 21l-4.35-4.35" />
  </Svg>
);

const CheckSquareIcon = ({ size = 18, color = "#2563EB" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 11l3 3L22 4" />
    <Path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </Svg>
);

const IndeterminateIcon = ({ size = 18, color = "#F59E0B" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M5 12h14" />
    <Path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2z" />
  </Svg>
);

const SquareIcon = ({ size = 18, color = "#D1D5DB" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
  </Svg>
);

const Circle = (props) => <View />; // dummy to bypass react-native-svg missing Circle import issues if any, Svg holds Circle
const Rect = (props) => <View />;

export default function RolesPermissionsScreen() {
  const navigation = useNavigation();
  const {
    roles,
    totalRecords,
    lastPage,
    pageNo,
    pageSize,
    search,
    loading: rolesLoading,
    error: rolesError,
    handleSearch,
    handlePageChange,
    createRole,
    updateRole,
    removeRole,
  } = useRoles();

  const [activeRoleForMenu, setActiveRoleForMenu] = useState(null);
  const [menuTree, setMenuTree] = useState([]);
  const [treeLoading, setTreeLoading] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  // Form submission handler
  const handleFormSubmit = async (values) => {
    let success = false;
    if (editingRole) {
      success = await updateRole({
        id: editingRole.id,
        roleCode: editingRole.roleCode,
        ...values,
      });
    } else {
      success = await createRole(values);
    }

    if (success) {
      Alert.alert("Success", `Role ${editingRole ? "updated" : "created"} successfully.`);
      setShowFormModal(false);
      setEditingRole(null);
    } else {
      Alert.alert("Error", `Failed to ${editingRole ? "update" : "create"} role.`);
    }
  };

  const initialValues = editingRole
    ? {
        roleName: editingRole.roleName,
        roleDescription: editingRole.roleDescription,
        isAdmin: editingRole.isAdmin,
        isSuperAdmin: editingRole.isSuperAdmin,
      }
    : {
        roleName: "",
        roleDescription: "",
        isAdmin: false,
        isSuperAdmin: false,
      };

  const form = useRoleForm(handleFormSubmit, initialValues);

  // Recursive mappings for childMenuList <-> childMenus
  const mapNode = useCallback((node) => ({
    id: node.id,
    menuName: node.menuName,
    menuCode: node.menuCode,
    parentId: node.parentId ?? null,
    isChecked: !!node.isChecked,
    childMenus: Array.isArray(node.childMenuList) ? node.childMenuList.map(mapNode) : [],
  }), []);

  const convertNode = useCallback((node) => ({
    id: node.id,
    menuName: node.menuName,
    menuCode: node.menuCode,
    parentId: node.parentId ?? null,
    isChecked: !!node.isChecked,
    childMenuList: Array.isArray(node.childMenus) ? node.childMenus.map(convertNode) : [],
  }), []);

  // Fetch access tree
  const handleOpenPermissions = async (role) => {
    setActiveRoleForMenu(role);
    setTreeLoading(true);
    setShowMenuModal(true);
    try {
      const res = await findAccessByRoleId(role.id);
      if (res.data?.success || res.success) {
        const payload = res.data?.obj ?? res.obj;
        const parentList = payload.parentMenuList || [];
        setMenuTree(parentList.map(mapNode));
      } else {
        Alert.alert("Error", "Failed to fetch menu permissions tree.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Error fetching menu permissions tree.");
    } finally {
      setTreeLoading(false);
    }
  };

  // Tri-state checkbox state fetcher
  const getCheckState = useCallback((node) => {
    if (!node.childMenus || node.childMenus.length === 0) {
      return node.isChecked ? "checked" : "unchecked";
    }
    const states = node.childMenus.map(getCheckState);
    const allChecked = states.every((s) => s === "checked");
    const allUnchecked = states.every((s) => s === "unchecked");

    if (allChecked) return "checked";
    if (allUnchecked) return "unchecked";
    return "indeterminate";
  }, []);

  // Recalculates parent node checked status based on whether all children are checked
  const recalculateTreeStates = useCallback((nodes) => {
    return nodes.map((node) => {
      if (node.childMenus && node.childMenus.length > 0) {
        const updatedChildren = recalculateTreeStates(node.childMenus);
        const childStates = updatedChildren.map(getCheckState);
        const allChecked = childStates.every((s) => s === "checked");
        return {
          ...node,
          childMenus: updatedChildren,
          isChecked: allChecked,
        };
      }
      return node;
    });
  }, [getCheckState]);

  // Recursively toggle target node and all children
  const toggleNodeInTree = useCallback((nodes, id) => {
    return nodes.map((node) => {
      if (node.id === id) {
        const currentState = getCheckState(node);
        const targetChecked = currentState !== "checked";

        const setChecked = (n, val) => {
          n.isChecked = val;
          if (n.childMenus) {
            n.childMenus.forEach((c) => setChecked(c, val));
          }
        };

        const newNode = JSON.parse(JSON.stringify(node));
        setChecked(newNode, targetChecked);
        return newNode;
      }

      if (node.childMenus && node.childMenus.length > 0) {
        const updatedChildren = toggleNodeInTree(node.childMenus, id);
        return {
          ...node,
          childMenus: updatedChildren,
        };
      }

      return node;
    });
  }, [getCheckState]);

  const handleToggleCheckbox = (id) => {
    const updatedWithToggle = toggleNodeInTree(menuTree, id);
    const finalTree = recalculateTreeStates(updatedWithToggle);
    setMenuTree(finalTree);
  };

  const handleSavePermissions = async () => {
    if (!activeRoleForMenu) return;
    const parentMenuListPayload = menuTree.map(convertNode);
    const payload = {
      roleId: activeRoleForMenu.id,
      roleName: activeRoleForMenu.roleName,
      parentMenuList: parentMenuListPayload,
    };

    setTreeLoading(true);
    try {
      const res = await saveAccess(payload);
      if (res.data?.success || res.success) {
        Alert.alert("Success", "Permissions matrix saved successfully!");
        setShowMenuModal(false);
      } else {
        Alert.alert("Error", res.data?.message || res.message || "Failed to save permissions matrix.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Error saving permissions.");
    } finally {
      setTreeLoading(false);
    }
  };

  const handleDeleteRole = (role) => {
    Alert.alert("Confirm Delete", `Are you sure you want to delete the role "${role.roleName}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const success = await removeRole(role.id);
          if (success) {
            Alert.alert("Success", "Role deleted.");
          } else {
            Alert.alert("Error", "Failed to delete role.");
          }
        },
      },
    ]);
  };

  // Expandable Accordion Menu Node Component for Expo
  function ExpandableMenuNode({ node }) {
    const [expanded, setExpanded] = useState(false);
    const checkState = getCheckState(node);

    return (
      <View style={styles.treeNode}>
        <View style={styles.nodeHeader}>
          {/* Tri-state Checkbox */}
          <Pressable style={styles.checkboxWrapper} onPress={() => handleToggleCheckbox(node.id)}>
            {checkState === "checked" ? (
              <CheckSquareIcon size={18} color="#2563EB" />
            ) : checkState === "indeterminate" ? (
              <IndeterminateIcon size={18} color="#F59E0B" />
            ) : (
              <SquareIcon size={18} color="#9CA3AF" />
            )}
          </Pressable>

          <Text style={styles.menuNameText}>{node.menuName}</Text>

          {node.childMenus && node.childMenus.length > 0 && (
            <Pressable
              style={({ pressed }) => [styles.expandBtn, pressed && styles.expandBtnPressed]}
              onPress={() => setExpanded(!expanded)}
            >
              <Text style={styles.expandBtnText}>{expanded ? "▼" : "▶"}</Text>
            </Pressable>
          )}
        </View>

        {expanded && node.childMenus && node.childMenus.length > 0 && (
          <View style={styles.treeChildren}>
            {node.childMenus.map((child) => (
              <ExpandableMenuNode key={child.id} node={child} />
            ))}
          </View>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FCFC" />

      {/* Screen Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
          onPress={() => navigation.goBack()}
        >
          <BackIcon size={20} color="#1F2937" />
        </Pressable>
        <Text style={styles.headerTitle}>Roles & Permissions</Text>
        <Pressable
          style={styles.addHeaderBtn}
          onPress={() => {
            setEditingRole(null);
            form.resetForm();
            setShowFormModal(true);
          }}
        >
          <Text style={styles.addHeaderBtnText}>+ Add</Text>
        </Pressable>
      </View>

      {/* Main List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search filter */}
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search roles..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={handleSearch}
          />
        </View>

        {rolesLoading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginVertical: 40 }} />
        ) : rolesError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{rolesError}</Text>
          </View>
        ) : roles.length > 0 ? (
          <View style={styles.listContainer}>
            {roles.map((role) => (
              <View key={role.id} style={styles.roleCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.roleName}>{role.roleName}</Text>
                  <View style={styles.badgeRow}>
                    {role.isAdmin && (
                      <View style={[styles.badge, { backgroundColor: "#DBEAFE" }]}>
                        <Text style={[styles.badgeText, { color: "#1D4ED8" }]}>Admin</Text>
                      </View>
                    )}
                    {role.isSuperAdmin && (
                      <View style={[styles.badge, { backgroundColor: "#FEE2E2" }]}>
                        <Text style={[styles.badgeText, { color: "#B91C1C" }]}>SuperAdmin</Text>
                      </View>
                    )}
                  </View>
                </View>

                <Text style={styles.roleDesc}>{role.roleDescription}</Text>
                <Text style={styles.roleCode}>Code: {role.roleCode}</Text>

                <View style={styles.cardActions}>
                  <Pressable
                    style={styles.permActionBtn}
                    onPress={() => handleOpenPermissions(role)}
                  >
                    <Text style={styles.permActionBtnText}>Permissions Tree</Text>
                  </Pressable>

                  <Pressable
                    style={styles.editActionBtn}
                    onPress={() => {
                      setEditingRole(role);
                      form.setValues({
                        roleName: role.roleName,
                        roleDescription: role.roleDescription,
                        isAdmin: role.isAdmin,
                        isSuperAdmin: role.isSuperAdmin,
                      });
                      setShowFormModal(true);
                    }}
                  >
                    <Text style={styles.editActionBtnText}>Edit</Text>
                  </Pressable>

                  <Pressable
                    style={styles.deleteActionBtn}
                    onPress={() => handleDeleteRole(role)}
                  >
                    <Text style={styles.deleteActionBtnText}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No roles found.</Text>
        )}

        {/* Simple Pagination */}
        {roles.length > 0 && (
          <View style={styles.paginationRow}>
            <Pressable
              style={[styles.pageBtn, pageNo <= 1 && styles.pageBtnDisabled]}
              onPress={() => pageNo > 1 && handlePageChange(pageNo - 1)}
              disabled={pageNo <= 1}
            >
              <Text style={styles.pageBtnText}>Previous</Text>
            </Pressable>
            <Text style={styles.pageIndicator}>
              Page {pageNo} of {lastPage}
            </Text>
            <Pressable
              style={[styles.pageBtn, pageNo >= lastPage && styles.pageBtnDisabled]}
              onPress={() => pageNo < lastPage && handlePageChange(pageNo + 1)}
              disabled={pageNo >= lastPage}
            >
              <Text style={styles.pageBtnText}>Next</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* 1. Add/Edit Role Modal Form */}
      <Modal visible={showFormModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingRole ? "Modify Role Details" : "Create New Role"}</Text>

            <ScrollView contentContainerStyle={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Role Name *</Text>
                <TextInput
                  style={[styles.textInput, form.touched.roleName && form.errors.roleName && styles.inputError]}
                  value={form.values.roleName}
                  onChangeText={(val) => form.handleChange("roleName", val)}
                  onBlur={() => form.handleBlur("roleName")}
                  placeholder="e.g. Sales Executive"
                />
                {form.touched.roleName && form.errors.roleName && (
                  <Text style={styles.errorTextTip}>{form.errors.roleName}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Role Description *</Text>
                <TextInput
                  style={[styles.textInput, form.touched.roleDescription && form.errors.roleDescription && styles.inputError, { height: 80 }]}
                  value={form.values.roleDescription}
                  onChangeText={(val) => form.handleChange("roleDescription", val)}
                  onBlur={() => form.handleBlur("roleDescription")}
                  placeholder="e.g. Handles POS cashier functions"
                  multiline
                />
                {form.touched.roleDescription && form.errors.roleDescription && (
                  <Text style={styles.errorTextTip}>{form.errors.roleDescription}</Text>
                )}
              </View>

              <View style={styles.switchGroup}>
                <Text style={styles.switchLabel}>Is Admin?</Text>
                <Switch
                  value={form.values.isAdmin}
                  onValueChange={(val) => form.handleChange("isAdmin", val)}
                  thumbColor={form.values.isAdmin ? "#2563EB" : "#D1D5DB"}
                  trackColor={{ true: "#93C5FD", false: "#E5E7EB" }}
                />
              </View>

              <View style={styles.switchGroup}>
                <Text style={styles.switchLabel}>Is Super Admin?</Text>
                <Switch
                  value={form.values.isSuperAdmin}
                  onValueChange={(val) => form.handleChange("isSuperAdmin", val)}
                  thumbColor={form.values.isSuperAdmin ? "#2563EB" : "#D1D5DB"}
                  trackColor={{ true: "#93C5FD", false: "#E5E7EB" }}
                />
              </View>

              <View style={styles.modalActionButtons}>
                <Pressable
                  style={styles.cancelModalBtn}
                  onPress={() => {
                    setShowFormModal(false);
                    setEditingRole(null);
                  }}
                >
                  <Text style={styles.cancelModalBtnText}>Cancel</Text>
                </Pressable>

                <Pressable
                  style={[styles.submitModalBtn, !form.isValid && styles.submitModalBtnDisabled]}
                  onPress={form.handleSubmit}
                  disabled={form.isSubmitting}
                >
                  <Text style={styles.submitModalBtnText}>Save Role</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 2. Menu Permissions Tree Matrix Modal */}
      <Modal visible={showMenuModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { height: "80%", width: screenWidth - 32 }]}>
            <Text style={styles.modalTitle}>
              Menu Permissions: {activeRoleForMenu?.roleName}
            </Text>

            {treeLoading ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={styles.modalLoadingText}>Syncing access configurations...</Text>
              </View>
            ) : (
              <ScrollView style={styles.treeScrollView} showsVerticalScrollIndicator={false}>
                {menuTree.length > 0 ? (
                  menuTree.map((node) => <ExpandableMenuNode key={node.id} node={node} />)
                ) : (
                  <Text style={styles.emptyText}>No menu options found in tree.</Text>
                )}
              </ScrollView>
            )}

            <View style={styles.modalActionButtons}>
              <Pressable
                style={styles.cancelModalBtn}
                onPress={() => {
                  setShowMenuModal(false);
                  setActiveRoleForMenu(null);
                  setMenuTree([]);
                }}
              >
                <Text style={styles.cancelModalBtnText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={styles.submitModalBtn}
                onPress={handleSavePermissions}
                disabled={treeLoading}
              >
                <Text style={styles.submitModalBtnText}>Save Tree Matrix</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FCFC",
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnPressed: {
    backgroundColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  addHeaderBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addHeaderBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  searchBar: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 16,
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    fontSize: 14,
    color: "#111827",
  },
  listContainer: {
    gap: 12,
  },
  roleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  roleName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
    flex: 1,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "800",
  },
  roleDesc: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 18,
    marginBottom: 8,
  },
  roleCode: {
    fontSize: 10,
    color: "#9CA3AF",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    marginBottom: 14,
  },
  cardActions: {
    flexDirection: "row",
    gap: 10,
  },
  permActionBtn: {
    backgroundColor: "#EBF5FF",
    borderColor: "#BFDBFE",
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  permActionBtnText: {
    color: "#2563EB",
    fontSize: 11,
    fontWeight: "700",
  },
  editActionBtn: {
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  editActionBtnText: {
    color: "#374151",
    fontSize: 11,
    fontWeight: "700",
  },
  deleteActionBtn: {
    borderColor: "#FEE2E2",
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  deleteActionBtnText: {
    color: "#EF4444",
    fontSize: 11,
    fontWeight: "700",
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  errorText: {
    color: "#991B1B",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 13,
    color: "#9CA3AF",
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 30,
  },
  paginationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    paddingHorizontal: 4,
  },
  pageBtn: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pageBtnDisabled: {
    opacity: 0.5,
  },
  pageBtnText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "600",
  },
  pageIndicator: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: screenWidth - 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 10,
  },
  formContainer: {
    gap: 14,
  },
  inputGroup: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4B5563",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
    borderWidth: 1.5,
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#111827",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorTextTip: {
    color: "#EF4444",
    fontSize: 11,
    fontWeight: "600",
  },
  switchGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },
  modalActionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 14,
  },
  cancelModalBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelModalBtnText: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "700",
  },
  submitModalBtn: {
    flex: 1.5,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  submitModalBtnDisabled: {
    opacity: 0.5,
  },
  submitModalBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  modalLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  modalLoadingText: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "500",
  },
  treeScrollView: {
    flex: 1,
    marginVertical: 8,
  },
  treeNode: {
    marginVertical: 4,
  },
  nodeHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  checkboxWrapper: {
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  menuNameText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    flex: 1,
  },
  expandBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  expandBtnPressed: {
    backgroundColor: "#F3F4F6",
  },
  expandBtnText: {
    fontSize: 10,
    color: "#6B7280",
  },
  treeChildren: {
    paddingLeft: 24,
    borderLeftWidth: 1,
    borderLeftColor: "#E5E7EB",
    marginLeft: 9,
    marginTop: 2,
  },
});
