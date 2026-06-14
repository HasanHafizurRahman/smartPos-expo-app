import React, { useEffect } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { performLogout } from "../store/features/auth/authSlice";
import { loadUserMenu } from "../store/features/menu/menuSlice";

const categories = ["New In", "Women", "Men", "Shoes", "Home"];

const featuredProducts = [
  {
    name: "Linen Utility Jacket",
    detail: "Stone green",
    price: "$84",
    image:
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Daily Runner Sneaker",
    detail: "Cloud white",
    price: "$118",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Studio Headphones",
    detail: "Matte black",
    price: "$149",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Minimal Desk Lamp",
    detail: "Warm brass",
    price: "$64",
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=80",
  },
];

export default function HomeScreen() {
  const dispatch = useDispatch();
  const { user, token, isLoading: authLoading } = useSelector((state) => state.auth);
  const { items: menuItems, allowedNames, isLoading: menuLoading } = useSelector(
    (state) => state.menu
  );

  // Trigger loading the user menus when the user is populated
  useEffect(() => {
    if (user && user.userId) {
      dispatch(loadUserMenu(user.userId));
    }
  }, [user, dispatch]);

  const handleLogout = () => {
    dispatch(performLogout());
  };

  // Helper for rendering user initials as avatar
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  // Loader state while retrieving profile or initial configuration
  if (authLoading && !user) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0e7c66" />
        <Text style={styles.loadingText}>Fetching profile details...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f8fb" />
      
      {/* Premium Profile Header Panel */}
      <View style={styles.profileHeader}>
        <View style={styles.userInfoWrapper}>
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarText}>
              {user ? getInitials(user.userFullName) : "U"}
            </Text>
          </View>
          <View style={styles.profileDetails}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.userFullName || "User Profile"}</Text>
            <View style={styles.badgeRow}>
              {user?.roleName ? (
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>{user.roleName}</Text>
                </View>
              ) : null}
              {user?.designation ? (
                <Text style={styles.designationText}>{user.designation}</Text>
              ) : null}
            </View>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.logoutBtn,
            pressed && styles.logoutBtnPressed,
          ]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutBtnText}>Logout</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Menu Permissions Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeaderTitle}>Authorized Modules</Text>
          {menuLoading ? (
            <ActivityIndicator color="#0e7c66" style={{ alignSelf: "flex-start", marginTop: 8 }} />
          ) : menuItems && menuItems.length > 0 ? (
            <View style={styles.permissionGrid}>
              {menuItems.map((item, index) => (
                <View key={index} style={styles.permissionChip}>
                  <View style={styles.greenDot} />
                  <Text style={styles.permissionText}>{item.menuName}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noPermissionsText}>No module permissions assigned.</Text>
          )}
        </View>

        {/* Existing Store / POS Layout from App.js */}
        <View style={styles.storefrontHeader}>
          <View>
            <Text style={styles.kicker}>Spring edit</Text>
            <Text style={styles.brand}>Mercato POS</Text>
          </View>
          <Pressable style={styles.bagButton}>
            <Text style={styles.bagText}>Bag</Text>
            <View style={styles.bagCount}>
              <Text style={styles.bagCountText}>2</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.searchBar}>
          <Text style={styles.searchLabel}>Search</Text>
          <Text style={styles.searchText}>Search items, barcode, transactions</Text>
        </View>

        <View style={styles.categoryRow}>
          {categories.map((category, index) => (
            <Pressable
              key={category}
              style={[styles.categoryChip, index === 0 && styles.categoryChipActive]}
            >
              <Text
                style={[
                  styles.categoryText,
                  index === 0 && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured products</Text>
          <Text style={styles.sectionLink}>View all</Text>
        </View>

        <View style={styles.productGrid}>
          {featuredProducts.map((product) => (
            <Pressable key={product.name} style={styles.productCard}>
              <Image source={{ uri: product.image }} style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={styles.productDetail}>{product.detail}</Text>
                <Text style={styles.productPrice}>{product.price}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.promoBand}>
          <View style={styles.promoBadge}>
            <Text style={styles.promoBadgeText}>15%</Text>
          </View>
          <View style={styles.promoCopy}>
            <Text style={styles.promoTitle}>Weekend member offer</Text>
            <Text style={styles.promoText}>
              Save on curated sets when you build a cart of three or more items.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f8fb",
  },
  screen: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f8fb",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },
  profileHeader: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#e0f2fe", // Styled soft blue badge
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0369a1",
  },
  profileDetails: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 11,
    color: "#6b7280",
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    flexWrap: "wrap",
    gap: 6,
  },
  roleBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleBadgeText: {
    color: "#15803d",
    fontSize: 10,
    fontWeight: "800",
  },
  designationText: {
    fontSize: 11,
    color: "#4b5563",
    fontWeight: "500",
  },
  logoutBtn: {
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  logoutBtnPressed: {
    backgroundColor: "#f3f4f6",
  },
  logoutBtnText: {
    color: "#ef4444",
    fontSize: 13,
    fontWeight: "700",
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  sectionContainer: {
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  permissionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  permissionChip: {
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10b981",
    marginRight: 6,
  },
  permissionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4b5563",
  },
  noPermissionsText: {
    fontSize: 13,
    color: "#9ca3af",
    fontStyle: "italic",
  },
  storefrontHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  kicker: {
    color: "#0e7c66",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  brand: {
    color: "#111827",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0,
    marginTop: 2,
  },
  bagButton: {
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    minHeight: 40,
    paddingHorizontal: 12,
  },
  bagText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  bagCount: {
    alignItems: "center",
    backgroundColor: "#f4c95d",
    borderRadius: 6,
    height: 20,
    justifyContent: "center",
    width: 20,
  },
  bagCountText: {
    color: "#111827",
    fontSize: 11,
    fontWeight: "800",
  },
  searchBar: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 46,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  searchLabel: {
    color: "#0e7c66",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  searchText: {
    color: "#6b7280",
    flex: 1,
    fontSize: 14,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },
  categoryChip: {
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 36,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  categoryChipActive: {
    backgroundColor: "#0e7c66",
    borderColor: "#0e7c66",
  },
  categoryText: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "700",
  },
  categoryTextActive: {
    color: "#ffffff",
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0,
  },
  sectionLink: {
    color: "#f25c54",
    fontSize: 13,
    fontWeight: "800",
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  productCard: {
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: "47%",
    flexGrow: 1,
    overflow: "hidden",
  },
  productImage: {
    aspectRatio: 1.2,
    backgroundColor: "#e5e7eb",
    width: "100%",
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 18,
    minHeight: 36,
  },
  productDetail: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 2,
  },
  productPrice: {
    color: "#0e7c66",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 6,
  },
  promoBand: {
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 8,
    flexDirection: "row",
    gap: 12,
    marginTop: 22,
    padding: 14,
  },
  promoBadge: {
    alignItems: "center",
    backgroundColor: "#f4c95d",
    borderRadius: 8,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  promoBadgeText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "900",
  },
  promoCopy: {
    flex: 1,
  },
  promoTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  promoText: {
    color: "#cbd5e1",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
});
