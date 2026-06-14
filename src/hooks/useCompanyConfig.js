import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Platform } from "react-native";
import {
  loadCompanyConfigInit,
  loadCompanyConfigGrid,
  updateCompanyConfigGrid,
} from "../store/features/company/companySlice";
import {
  uploadCompanyLogo,
  uploadFavicon,
} from "../services/api/company/companyConfigApi";

export default function useCompanyConfig() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const config = useSelector((state) => state.company.config);
  const configData = useSelector((state) => state.company.configData);
  const loading = useSelector((state) => state.company.isLoading);
  const configDataLoading = useSelector((state) => state.company.configDataLoading);

  // Use a timestamp to force the image components to bust cache when we update them
  const [logoTimestamp, setLogoTimestamp] = useState(Date.now());
  const [faviconTimestamp, setFaviconTimestamp] = useState(Date.now());

  const baseUrl = "http://118.179.144.13:8069";
  const logoUrl = `${baseUrl}/api/company/get-company-logo?t=${logoTimestamp}`;
  const faviconUrl = `${baseUrl}/api/company/get-fav-icon?t=${faviconTimestamp}`;

  const fetchInitData = useCallback(() => {
    dispatch(loadCompanyConfigInit());
  }, [dispatch]);

  const fetchConfigGrid = useCallback(() => {
    dispatch(loadCompanyConfigGrid());
  }, [dispatch]);

  const updateLogo = useCallback(async (imageUri) => {
    if (!imageUri) return false;
    try {
      const formData = new FormData();
      // Resolve proper URI format for android vs iOS
      const cleanUri = Platform.OS === "android" ? imageUri : imageUri.replace("file://", "");
      formData.append("file", {
        uri: cleanUri,
        name: "company_logo.png",
        type: "image/png",
      });

      const res = await uploadCompanyLogo(formData);
      if (res.data?.success || res.success) {
        setLogoTimestamp(Date.now());
        dispatch(loadCompanyConfigInit()); // refresh config settings
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error uploading mobile company logo:", err);
      return false;
    }
  }, [dispatch]);

  const updateFaviconFile = useCallback(async (imageUri) => {
    if (!imageUri) return false;
    try {
      const formData = new FormData();
      const cleanUri = Platform.OS === "android" ? imageUri : imageUri.replace("file://", "");
      formData.append("file", {
        uri: cleanUri,
        name: "favicon.ico",
        type: "image/x-icon",
      });

      const res = await uploadFavicon(formData);
      if (res.data?.success || res.success) {
        setFaviconTimestamp(Date.now());
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error uploading mobile favicon:", err);
      return false;
    }
  }, []);

  const updateConfigData = useCallback(async (list) => {
    try {
      const result = await dispatch(updateCompanyConfigGrid(list)).unwrap();
      return result;
    } catch (err) {
      console.error("Error updating configuration grid:", err);
      return false;
    }
  }, [dispatch]);

  // Headers for secure Image loading in React Native
  const imageHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  return {
    config,
    configData,
    logoUrl,
    faviconUrl,
    logoTimestamp,
    faviconTimestamp,
    loading,
    configDataLoading,
    fetchInitData,
    fetchConfigGrid,
    updateLogo,
    updateFavicon: updateFaviconFile,
    updateConfigData,
    imageHeaders,
  };
}
