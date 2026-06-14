import { useState, useEffect, useCallback } from "react";
import {
  getRolesList,
  saveRole,
  updateRole as updateRoleApi,
  deleteRole,
} from "../services/api/settings/roleApi";

export default function useRoles() {
  const [roles, setRoles] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRolesList({
        pageNo,
        pageSize,
        sortDirection: "DESC",
        search: search.trim() || undefined,
      });

      if (res.data?.success || res.success) {
        const payload = res.data?.obj ?? res.obj;
        setRoles(payload.data || []);
        setTotalRecords(payload.totalRecords || 0);
      } else {
        setError(res.data?.message || res.message || "Failed to load roles");
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
      setError(err.message || "Failed to load roles");
    } finally {
      setLoading(false);
    }
  }, [pageNo, pageSize, search]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleSearch = useCallback((query) => {
    setSearch(query);
    setPageNo(1); // reset to first page
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPageNo(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newSize) => {
    setPageSize(newSize);
    setPageNo(1);
  }, []);

  const createRole = useCallback(async (data) => {
    try {
      const res = await saveRole(data);
      if (res.data?.success || res.success) {
        fetchRoles();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error creating role:", err);
      return false;
    }
  }, [fetchRoles]);

  const updateRole = useCallback(async (data) => {
    try {
      const res = await updateRoleApi(data);
      if (res.data?.success || res.success) {
        fetchRoles();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error updating role:", err);
      return false;
    }
  }, [fetchRoles]);

  const removeRole = useCallback(async (id) => {
    try {
      const res = await deleteRole(id);
      if (res.data?.success || res.success) {
        fetchRoles();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error deleting role:", err);
      return false;
    }
  }, [fetchRoles]);

  const lastPage = Math.max(1, Math.ceil(totalRecords / pageSize));

  return {
    roles,
    totalRecords,
    lastPage,
    pageNo,
    pageSize,
    search,
    loading,
    error,
    handleSearch,
    handlePageChange,
    handlePageSizeChange,
    createRole,
    updateRole,
    removeRole,
    refreshRoles: fetchRoles,
  };
}
