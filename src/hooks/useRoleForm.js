import { useState, useCallback, useEffect } from "react";

const initialValuesDefault = {
  roleName: "",
  roleDescription: "",
  isAdmin: false,
  isSuperAdmin: false,
};

export default function useRoleForm(onSubmit, initialValues = initialValuesDefault) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync initial values when they change (e.g. when editing a role)
  useEffect(() => {
    if (initialValues) {
      setValues({
        roleName: initialValues.roleName || "",
        roleDescription: initialValues.roleDescription || "",
        isAdmin: !!initialValues.isAdmin,
        isSuperAdmin: !!initialValues.isSuperAdmin,
        id: initialValues.id,
        roleCode: initialValues.roleCode,
      });
    }
  }, [initialValues]);

  const validate = useCallback((vals) => {
    const errs = {};
    if (!vals.roleName || !vals.roleName.trim()) {
      errs.roleName = "Role Name is required";
    }
    if (!vals.roleDescription || !vals.roleDescription.trim()) {
      errs.roleDescription = "Role Description is required";
    }
    return errs;
  }, []);

  const handleChange = useCallback((field, val) => {
    setValues((prev) => {
      const next = { ...prev, [field]: val };
      // Real-time validation if field has been touched
      if (touched[field]) {
        const validationErrors = validate(next);
        setErrors((prevErrs) => ({
          ...prevErrs,
          [field]: validationErrors[field],
        }));
      }
      return next;
    });
  }, [touched, validate]);

  const handleBlur = useCallback((field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const validationErrors = validate(values);
    setErrors((prevErrs) => ({
      ...prevErrs,
      [field]: validationErrors[field],
    }));
  }, [values, validate]);

  const resetForm = useCallback(() => {
    setValues(initialValues || initialValuesDefault);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const handleSubmit = useCallback(async () => {
    setTouched({
      roleName: true,
      roleDescription: true,
    });

    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (err) {
        console.error("Submit error:", err);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, validate, onSubmit]);

  const isValid = Object.keys(validate(values)).length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues,
  };
}
