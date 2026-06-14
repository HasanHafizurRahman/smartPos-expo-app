import React, { useState, useEffect } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Image,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { performLogout } from "../store/features/auth/authSlice";
import { loadUserMenu } from "../store/features/menu/menuSlice";
import { loadCompanyConfigInit } from "../store/features/company/companySlice";
import useCompanyConfig from "../hooks/useCompanyConfig";
import { getDashboard } from "../services/api/report/reportApi";
import Svg, { Path, Rect, Circle } from "react-native-svg";
import { LineChart, PieChart, BarChart } from "react-native-gifted-charts";
import DateTimePicker from "@react-native-community/datetimepicker";

// Get screen dimensions for sizing
const { width: screenWidth } = Dimensions.get("window");

// Premium Custom SVG Icons
const SalesIcon = ({ size = 22, color = "#2563EB" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </Svg>
);

const CollectionIcon = ({ size = 22, color = "#10B981" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
    <Path d="M12 11h.01" />
    <Path d="M16 11h.01" />
    <Path d="M8 11h.01" />
    <Path d="M12 15h.01" />
    <Path d="M16 15h.01" />
    <Path d="M8 15h.01" />
  </Svg>
);

const DueIcon = ({ size = 22, color = "#F59E0B" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Path d="M12 8v4l3 3" />
  </Svg>
);

const OrdersIcon = ({ size = 22, color = "#111827" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <Path d="M3 6h18" />
    <Path d="M16 10a4 4 0 0 1-8 0" />
  </Svg>
);

const CalendarIcon = ({ size = 16, color = "#6B7280" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <Path d="M16 2v4" />
    <Path d="M8 2v4" />
    <Path d="M3 10h18" />
  </Svg>
);

const FilterIcon = ({ size = 14, color = "#FFFFFF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
  </Svg>
);

const ClearIcon = ({ size = 14, color = "#4B5563" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 6L6 18M6 6l12 12" />
  </Svg>
);

const LogoutIcon = ({ size = 18, color = "#EF4444" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <Path d="M16 17l5-5-5-5" />
    <Path d="M21 12H9" />
  </Svg>
);

const SettingsIcon = ({ size = 20, color = "#2563EB" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="3" />
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Svg>
);

const SecurityIcon = ({ size = 20, color = "#10B981" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Svg>
);

export default function HomeScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { user, token, isLoading: authLoading } = useSelector((state) => state.auth);
  const { items: menuItems, isLoading: menuLoading } = useSelector((state) => state.menu);
  const { config, logoUrl, imageHeaders } = useCompanyConfig();

  // Dashboard state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [data, setData] = useState({
    totalSales: 0,
    totalCollection: 0,
    totalDue: 0,
    totalOrder: 0,
    top5Products: [],
    paymentSplit: [],
    last10DaysSalesTrend: [],
  });

  // Load menu permissions and company configuration on mount/user change
  useEffect(() => {
    if (user && user.userId) {
      dispatch(loadUserMenu(user.userId));
      dispatch(loadCompanyConfigInit());
    }
  }, [user, dispatch]);

  // Fetch dashboard data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    dispatch(performLogout());
  };

  // Helper to parse safe numbers
  const toNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  // Formatting helpers for Hermes compatibility
  const formatCurrency = (val) => {
    const num = toNumber(val);
    return num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
  };

  const formatInteger = (val) => {
    const num = Math.round(toNumber(val));
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Locale-independent friendly date label helper (e.g. "Jun 14")
  const formatDateLabel = (d) => {
    if (!d) return d;
    const maybeDate = new Date(d);
    if (!isNaN(maybeDate.getTime())) {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${months[maybeDate.getMonth()]} ${maybeDate.getDate()}`;
    }
    return d;
  };

  // Date param formatter for API: YYYY-MM-DD HH:mm:ss
  const formatDateParam = (date, isEnd = false) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const time = isEnd ? "23:59:59" : "00:00:00";
    return `${year}-${month}-${day} ${time}`;
  };

  const fetchDashboardData = async (start = null, end = null) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (start) params.startDate = formatDateParam(start, false);
      if (end) params.endDate = formatDateParam(end, true);

      const res = await getDashboard(params);
      const payload = res?.obj ?? res;
      if (!payload) {
        throw new Error("Empty dashboard payload");
      }

      setData({
        totalSales: toNumber(payload.totalSales),
        totalCollection: toNumber(payload.totalCollection),
        totalDue: toNumber(payload.totalDue),
        totalOrder: toNumber(payload.totalOrder),
        top5Products: Array.isArray(payload.top5Products) ? payload.top5Products : [],
        paymentSplit: Array.isArray(payload.paymentSplit) ? payload.paymentSplit : [],
        last10DaysSalesTrend: Array.isArray(payload.last10DaysSalesTrend)
          ? payload.last10DaysSalesTrend.map(([label, val]) => {
              const formattedLabel = typeof label === "string" ? formatDateLabel(label) : label;
              return [formattedLabel, toNumber(val)];
            })
          : [],
      });
    } catch (err) {
      console.error("Failed to load dashboard statistics:", err);
      setError(err?.message || "Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchDashboardData(startDate, endDate);
  };

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    fetchDashboardData(null, null);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  // DatePicker Change Handlers
  const onChangeStart = (event, selectedDate) => {
    setShowStartPicker(false);
    if (event.type === "set" && selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onChangeEnd = (event, selectedDate) => {
    setShowEndPicker(false);
    if (event.type === "set" && selectedDate) {
      setEndDate(selectedDate);
    }
  };

  // --- Derived Chart Data Configurations
  // 1. Line Chart (Sales Trend)
  const lineData = data.last10DaysSalesTrend.map(([label, val]) => ({
    value: val,
    label: label,
  }));

  // 2. Pie Chart (Payment Split)
  const colors = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
  const pieData = data.paymentSplit.map(([label, val], index) => ({
    value: toNumber(val),
    text: label,
    color: colors[index % colors.length],
  }));
  const totalPayment = data.paymentSplit.reduce((acc, [_, val]) => acc + toNumber(val), 0);

  // 3. Bar Chart (Top 5 Products)
  const barData = data.top5Products.map(([label, val]) => ({
    value: toNumber(val),
    label: label.length > 10 ? label.slice(0, 10) + ".." : label,
    frontColor: "#2563EB",
    topLabelComponent: () => (
      <Text style={styles.barTopLabel}>{val}</Text>
    ),
  }));

  const isSystemAdmin = !!(user?.isAdmin || user?.isSuperAdmin);
  const canAccessSettings = true; // Always visible to authenticated session for testing/bootstrapping
  const canAccessRoles = true; // Always visible to authenticated session for testing/bootstrapping
  const showAdminPanel = true;

  if (authLoading && !user) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Fetching profile details...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FCFC" />

      {/* Corporate branding header */}
      <View style={styles.companyHeaderBar}>
        {logoUrl ? (
          <Image
            source={{ uri: logoUrl, headers: imageHeaders }}
            style={styles.companyLogoHeader}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.companyLogoHeader, { alignItems: "center", justifyContent: "center" }]}>
            <Text style={{ fontSize: 13, fontWeight: "900", color: "#2563EB" }}>SP</Text>
          </View>
        )}
        <Text style={styles.companyNameText}>
          {config?.COMPANY_NAME || "SmartPOS Solutions"}
        </Text>
      </View>

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

        <View style={styles.headerActions}>
          <Pressable
            style={({ pressed }) => [
              styles.settingsHeaderBtn,
              pressed && styles.settingsHeaderBtnPressed,
            ]}
            onPress={() => navigation.navigate("Settings")}
          >
            <SettingsIcon size={20} color="#2563EB" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.logoutBtn,
              pressed && styles.logoutBtnPressed,
            ]}
            onPress={handleLogout}
          >
            <LogoutIcon size={18} color="#EF4444" />
            <Text style={styles.logoutBtnText}>Logout</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Filter Panel */}
        <View style={styles.filterCard}>
          <Text style={styles.filterTitle}>Analytics Filters</Text>

          <View style={styles.dateSelectorRow}>
            <Pressable
              style={styles.datePickerButton}
              onPress={() => setShowStartPicker(true)}
            >
              <CalendarIcon size={16} color="#6B7280" />
              <Text style={startDate ? styles.dateTextActive : styles.dateTextPlaceholder}>
                {startDate ? startDate.toLocaleDateString() : "Start Date"}
              </Text>
            </Pressable>

            <Text style={styles.dateRangeSeparator}>-</Text>

            <Pressable
              style={styles.datePickerButton}
              onPress={() => setShowEndPicker(true)}
            >
              <CalendarIcon size={16} color="#6B7280" />
              <Text style={endDate ? styles.dateTextActive : styles.dateTextPlaceholder}>
                {endDate ? endDate.toLocaleDateString() : "End Date"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.filterActionsRow}>
            <Pressable
              style={({ pressed }) => [
                styles.filterBtn,
                pressed && styles.filterBtnPressed,
              ]}
              onPress={handleFilter}
            >
              <FilterIcon size={13} color="#FFFFFF" />
              <Text style={styles.filterBtnText}>Apply Filter</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.clearBtn,
                pressed && styles.clearBtnPressed,
              ]}
              onPress={handleClear}
            >
              <ClearIcon size={13} color="#4B5563" />
              <Text style={styles.clearBtnText}>Clear</Text>
            </Pressable>
          </View>
        </View>

        {/* DateTimePicker Modals */}
        {showStartPicker && (
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            display="default"
            onChange={onChangeStart}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            value={endDate || new Date()}
            mode="date"
            display="default"
            minimumDate={startDate || undefined}
            onChange={onChangeEnd}
          />
        )}

        {/* Dashboard Loading & Error Handling */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Fetching analytics metrics...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
            <Pressable style={styles.retryBtn} onPress={() => fetchDashboardData(startDate, endDate)}>
              <Text style={styles.retryBtnText}>Retry Fetch</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* 4 Summary Cards Grid */}
            <View style={styles.statsGrid}>
              {/* Total Sales Card */}
              <View style={[styles.statCard, { borderLeftColor: "#2563EB" }]}>
                <View style={styles.statCardHeader}>
                  <SalesIcon color="#2563EB" />
                  <View style={[styles.growthBadge, { backgroundColor: "#DCFCE7" }]}>
                    <Text style={[styles.growthText, { color: "#15803D" }]}>+12.5%</Text>
                  </View>
                </View>
                <Text style={styles.statLabel}>Total Sales</Text>
                <Text style={[styles.statValue, { color: "#2563EB" }]} numberOfLines={1}>
                  ${formatCurrency(data.totalSales)}
                </Text>
              </View>

              {/* Total Collection Card */}
              <View style={[styles.statCard, { borderLeftColor: "#10B981" }]}>
                <View style={styles.statCardHeader}>
                  <CollectionIcon color="#10B981" />
                  <View style={[styles.growthBadge, { backgroundColor: "#DCFCE7" }]}>
                    <Text style={[styles.growthText, { color: "#15803D" }]}>+8.2%</Text>
                  </View>
                </View>
                <Text style={styles.statLabel}>Total Collection</Text>
                <Text style={[styles.statValue, { color: "#10B981" }]} numberOfLines={1}>
                  ${formatCurrency(data.totalCollection)}
                </Text>
              </View>

              {/* Total Due Card */}
              <View style={[styles.statCard, { borderLeftColor: "#F59E0B" }]}>
                <View style={styles.statCardHeader}>
                  <DueIcon color="#F59E0B" />
                  <View style={[styles.growthBadge, { backgroundColor: "#FEE2E2" }]}>
                    <Text style={[styles.growthText, { color: "#991B1B" }]}>-3.1%</Text>
                  </View>
                </View>
                <Text style={styles.statLabel}>Total Due</Text>
                <Text style={[styles.statValue, { color: "#F59E0B" }]} numberOfLines={1}>
                  ${formatCurrency(data.totalDue)}
                </Text>
              </View>

              {/* Orders Card */}
              <View style={[styles.statCard, { borderLeftColor: "#111827" }]}>
                <View style={styles.statCardHeader}>
                  <OrdersIcon color="#111827" />
                  <View style={[styles.growthBadge, { backgroundColor: "#DCFCE7" }]}>
                    <Text style={[styles.growthText, { color: "#15803D" }]}>+15.8%</Text>
                  </View>
                </View>
                <Text style={styles.statLabel}>Orders</Text>
                <Text style={[styles.statValue, { color: "#111827" }]} numberOfLines={1}>
                  {formatInteger(data.totalOrder)}
                </Text>
              </View>
            </View>

            {/* Sales Trend Line Chart */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Sales Trend</Text>
                <View style={[styles.chartStatusDot, { backgroundColor: "#2563EB" }]} />
              </View>
              {lineData.length > 0 ? (
                <View style={styles.chartContainer}>
                  <LineChart
                    data={lineData}
                    color="#2563EB"
                    thickness={3.5}
                    noOfSections={4}
                    areaChart
                    startFillColor="rgba(37, 99, 235, 0.3)"
                    endFillColor="rgba(37, 99, 235, 0.01)"
                    rulesColor="#E5E7EB"
                    rulesType="dashed"
                    yAxisTextStyle={styles.chartAxisText}
                    xAxisLabelTextStyle={styles.chartAxisText}
                    height={180}
                    spacing={screenWidth * 0.1}
                    initialSpacing={12}
                    dataPointsColor="#2563EB"
                    dataPointsRadius={4}
                    textColor="#4B5563"
                    textFontSize={9}
                  />
                </View>
              ) : (
                <View style={styles.emptyChartContainer}>
                  <Text style={styles.emptyChartText}>No sales trend data available for this range.</Text>
                </View>
              )}
            </View>

            {/* Payment Split Pie Chart */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Payment Split</Text>
                <View style={[styles.chartStatusDot, { backgroundColor: "#10B981" }]} />
              </View>
              {pieData.length > 0 ? (
                <View style={styles.rowChartLayout}>
                  <View style={styles.pieContainer}>
                    <PieChart
                      data={pieData}
                      donut
                      radius={60}
                      innerRadius={42}
                      innerCircleColor="#FFFFFF"
                      centerLabelComponent={() => (
                        <View style={styles.pieCenterLabel}>
                          <Text style={styles.pieCenterLabelTitle}>Total</Text>
                          <Text style={styles.pieCenterLabelVal} numberOfLines={1}>
                            {totalPayment > 1000 ? `$${(totalPayment / 1000).toFixed(1)}k` : `$${totalPayment.toFixed(0)}`}
                          </Text>
                        </View>
                      )}
                    />
                  </View>
                  <View style={styles.legendsList}>
                    {data.paymentSplit.map(([label, val], idx) => {
                      const amount = toNumber(val);
                      const percent = totalPayment > 0 ? ((amount / totalPayment) * 100).toFixed(1) : "0.0";
                      const color = colors[idx % colors.length];
                      return (
                        <View key={idx} style={styles.legendItem}>
                          <View style={[styles.legendColorDot, { backgroundColor: color }]} />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.legendLabel} numberOfLines={1}>{label}</Text>
                            <Text style={styles.legendVal}>
                              ${formatCurrency(amount)} ({percent}%)
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ) : (
                <View style={styles.emptyChartContainer}>
                  <Text style={styles.emptyChartText}>No payment split data available.</Text>
                </View>
              )}
            </View>

            {/* Top 5 Products Bar Chart */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Top Products</Text>
                <View style={[styles.chartStatusDot, { backgroundColor: "#F59E0B" }]} />
              </View>
              {barData.length > 0 ? (
                <View style={styles.barChartContainer}>
                  <BarChart
                    data={barData}
                    barWidth={18}
                    spacing={screenWidth * 0.065}
                    roundedTop
                    roundedBottom
                    noOfSections={4}
                    yAxisTextStyle={styles.chartAxisText}
                    xAxisLabelTextStyle={styles.chartAxisText}
                    height={160}
                    rulesColor="#E5E7EB"
                    rulesType="dashed"
                    frontColor="#2563EB"
                  />
                </View>
              ) : (
                <View style={styles.emptyChartContainer}>
                  <Text style={styles.emptyChartText}>No product distribution data available.</Text>
                </View>
              )}
            </View>
          </>
        )}

        {/* Terminal Administration Panel */}
        {showAdminPanel && (
          <View style={[styles.sectionContainer, { marginBottom: 18 }]}>
            <Text style={styles.sectionHeaderTitle}>Terminal Administration</Text>
            <View style={styles.adminGrid}>
              {canAccessSettings && (
                <Pressable
                  style={({ pressed }) => [styles.adminCard, pressed && styles.adminCardPressed]}
                  onPress={() => navigation.navigate("Settings")}
                >
                  <View style={[styles.iconCircle, { backgroundColor: "#EFF6FF" }]}>
                    <SettingsIcon color="#2563EB" />
                  </View>
                  <View style={styles.adminCardMeta}>
                    <Text style={styles.adminCardTitle}>Company Settings</Text>
                    <Text style={styles.adminCardDesc}>Branding and configs</Text>
                  </View>
                </Pressable>
              )}

              {canAccessRoles && (
                <Pressable
                  style={({ pressed }) => [styles.adminCard, pressed && styles.adminCardPressed]}
                  onPress={() => navigation.navigate("RolesPermissions")}
                >
                  <View style={[styles.iconCircle, { backgroundColor: "#ECFDF5" }]}>
                    <SecurityIcon color="#10B981" />
                  </View>
                  <View style={styles.adminCardMeta}>
                    <Text style={styles.adminCardTitle}>Roles & Tree</Text>
                    <Text style={styles.adminCardDesc}>Manage user permissions</Text>
                  </View>
                </Pressable>
              )}
            </View>
          </View>
        )}

        {/* Authorized Modules Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeaderTitle}>Authorized Modules</Text>
          {menuLoading ? (
            <ActivityIndicator color="#2563EB" style={{ alignSelf: "flex-start", marginTop: 8 }} />
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FCFC",
  },
  screen: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FCFC",
  },
  loadingContainer: {
    marginVertical: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  errorContainer: {
    marginVertical: 30,
    backgroundColor: "#FEE2E2",
    borderColor: "#FCA5A5",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  errorText: {
    color: "#991B1B",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 10,
  },
  retryBtn: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  profileHeader: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2563EB",
  },
  profileDetails: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 10,
    color: "#6B7280",
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    flexWrap: "wrap",
    gap: 6,
  },
  roleBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleBadgeText: {
    color: "#15803D",
    fontSize: 9,
    fontWeight: "800",
  },
  designationText: {
    fontSize: 10,
    color: "#4B5563",
    fontWeight: "500",
  },
  logoutBtn: {
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  logoutBtnPressed: {
    backgroundColor: "#F9FAFB",
  },
  logoutBtnText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "700",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  filterCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1F2937",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  dateSelectorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  datePickerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  dateTextPlaceholder: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "500",
  },
  dateTextActive: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "600",
  },
  dateRangeSeparator: {
    paddingHorizontal: 8,
    color: "#9CA3AF",
    fontWeight: "bold",
  },
  filterActionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  filterBtn: {
    flex: 1.5,
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  filterBtnPressed: {
    backgroundColor: "#1D4ED8",
  },
  filterBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  clearBtn: {
    flex: 1,
    borderColor: "#D1D5DB",
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  clearBtnPressed: {
    backgroundColor: "#F9FAFB",
  },
  clearBtnText: {
    color: "#4B5563",
    fontSize: 13,
    fontWeight: "700",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 18,
    gap: 12,
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderLeftWidth: 4,
    padding: 14,
    flexBasis: "48%",
    flexGrow: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  growthBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 10,
  },
  growthText: {
    fontSize: 9,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },
  chartStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chartContainer: {
    marginLeft: -10,
    marginTop: 8,
  },
  emptyChartContainer: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyChartText: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "500",
    fontStyle: "italic",
    textAlign: "center",
  },
  rowChartLayout: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  pieContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pieCenterLabel: {
    justifyContent: "center",
    alignItems: "center",
    width: 60,
  },
  pieCenterLabelTitle: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "600",
  },
  pieCenterLabelVal: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },
  legendsList: {
    flex: 1.2,
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  legendColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#374151",
  },
  legendVal: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "500",
    marginTop: 1,
  },
  barChartContainer: {
    alignItems: "center",
    marginLeft: -16,
    marginTop: 10,
  },
  barTopLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  chartAxisText: {
    color: "#6B7280",
    fontSize: 9,
    fontWeight: "500",
  },
  sectionContainer: {
    backgroundColor: "#FFFFFF",
    borderColor: "#EEEEEE",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeaderTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  permissionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  permissionChip: {
    backgroundColor: "#F3F4F6",
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
    backgroundColor: "#10B981",
    marginRight: 6,
  },
  permissionText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4B5563",
  },
  noPermissionsText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  companyHeaderBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F172A",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  companyLogoHeader: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
  },
  companyNameText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  adminGrid: {
    flexDirection: "row",
    gap: 12,
  },
  adminCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  adminCardPressed: {
    backgroundColor: "#F3F4F6",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  adminCardMeta: {
    flex: 1,
  },
  adminCardTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111827",
  },
  adminCardDesc: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingsHeaderBtn: {
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 8,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsHeaderBtnPressed: {
    backgroundColor: "#F9FAFB",
  },
});
