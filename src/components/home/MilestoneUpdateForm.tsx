import { useCallback, useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Schema } from "../../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import {
  SpaceBetween,
  Button,
  Form,
  Header,
  Container,
  FormField,
  Input,
  Checkbox,
  TextContent,
  Select,
  Box,
  Textarea,
  Table,
  Pagination,
  StatusIndicator,
  Modal,
  Alert
} from "@cloudscape-design/components";

const client = generateClient<Schema>();

interface LocationState {
  item: Schema["Milestone"]["type"];
  sca: Schema["Sca"]["type"];
}

interface MilestoneFormData {
  id: string;
  milestone_type: string | null | undefined;
  milestone_description: string | null | undefined;
  is_tech: boolean;
  is_currency: boolean;
  kpi_value: string | null | undefined;
  targeted_date: string | null | undefined;
  input_type: string | null | undefined;
  milestone_goal: string | null | undefined;
  latest_actuals: string | null | undefined;
  calc_rag_type: string | null | undefined;
  is_rag_override: boolean;
  updated_last_by: string | null | undefined;
  scaId: string;
  is_baselined: boolean;
  milestone_start_date: string | null | undefined;
  comments: string | null | undefined;
}

interface StatusUpdateFormData {
  status_date: string | null | undefined;
  expected_kpi_value: string | null | undefined;
  latest_actuals: string | null | undefined;
  status_rag_status: string | null | undefined;
  is_status_rag_override: boolean;
  status_notes: string | null | undefined;
  updated_by: string | null | undefined;
  notes: string | null | undefined;
  milestoneId: string;
  id: string;
}

interface MilestoneStatusType {
  id: string;
  lastest_kpi_planned: string | null;
  latest_status_actuals: string | null;
  status_rag_status: string | null;
  is_status_rag_override: boolean;
  status_notes: string | null;
  status_date: string | null; 
  updated_by: string | null;
  milestoneId: string;
  createdAt?: string;
  updatedAt?: string;
}

interface FormError {
  milestone_type?: string;
  milestone_description?: string;
  milestone_goal?: string;
  targeted_date?: string;
  input_type?: string;
  kpi_value?: string;
  start_date?: string;
  status_date?: string;
  expected_kpi_value?: string;
  latest_actuals?: string;
  milestone_start_date?: string;
  comments?: string;
}
// Use a more specific type for the input parameter and handle null case
const convertToMilestoneStatusType = (item: Schema["MilestoneStatus"]["type"] | null): MilestoneStatusType => {
  if (!item) {
    // Return a default MilestoneStatusType if item is null
    return {
      id: "",
      milestoneId: "",
      lastest_kpi_planned: null,
      latest_status_actuals: null,
      status_rag_status: null,
      is_status_rag_override: false,
      status_notes: null,
      updated_by: null,
      status_date: null,
      createdAt: undefined,
      updatedAt: undefined
    };
  }
  return {
    id: item.id,
    milestoneId: item.milestoneId || "",
    lastest_kpi_planned: item.lastest_kpi_planned || null,
    latest_status_actuals: item.latest_status_actuals || null,
    status_rag_status: item.status_rag_status || null,
    is_status_rag_override: Boolean(item.is_status_rag_override),
    status_notes: item.status_notes || null,
    updated_by: item.updated_by || null,
    status_date: item.status_date || null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
};
// Helper function to get today's date in MM/DD/YY format
const getTodayFormatted = (): string => {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const year = String(today.getFullYear()).slice(-2);
  return `${month}/${day}/${year}`;
};
// Helper function to validate and format date in MM/DD/YY format
const validateAndFormatDate = (dateString: string | null | undefined): { 
  isValid: boolean; 
  formattedDate: string | null;
  errorMessage?: string;
} => {
  if (!dateString) return { isValid: true, formattedDate: null };
  // Check for MM/DD/YY format
  const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{2}$/;
  if (!regex.test(dateString)) {
    return { 
      isValid: false, 
      formattedDate: null,
      errorMessage: "Date must be in MM/DD/YY format" 
    };
  }
  // Validate the date is real
  const [month, day, year] = dateString.split('/').map(num => parseInt(num, 10));
  const date = new Date(2000 + year, month - 1, day);
  const isValid = date.getMonth() === month - 1 && date.getDate() === day;
  if (!isValid) {
    return { 
      isValid: false, 
      formattedDate: null,
      errorMessage: "Please enter a valid date" 
    };
  }
  // Format the date as MM/DD/YY
  const formattedMonth = month.toString().padStart(2, '0');
  const formattedDay = day.toString().padStart(2, '0');
  const formattedYear = (year % 100).toString().padStart(2, '0');
  
  return { 
    isValid: true, 
    formattedDate: `${formattedMonth}/${formattedDay}/${formattedYear}`,
    errorMessage: undefined
  };
};

function MilestoneUpdateForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showBaselineModal, setShowBaselineModal] = useState(false);
  const [baselineConfirmationText, setBaselineConfirmationText] = useState("");
  const { item, sca } = location.state as LocationState;
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error" | "warning" | "info">("success");
  const [alertMessage, setAlertMessage] = useState("");
  const showNotification = (type: "success" | "error" | "warning" | "info", message: string) => {
    setAlertType(type);
    setAlertMessage(message);
    setShowAlert(true);
    
    // Automatically hide the alert after 5 seconds
    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };
  // Store the original milestone data for comparison
  const originalMilestoneData = useMemo(() => ({
    milestone_type: item.milestone_type,
    milestone_description: item.milestone_description,
    is_tech: Boolean(item.is_tech),
    is_currency: Boolean(item.is_currency),
    kpi_value: item.kpi_value,
    targeted_date: item.targeted_date,
    input_type: item.input_type,
    milestone_goal: item.milestone_goal,
    latest_actuals: item.latest_actuals,
    calc_rag_type: item.calc_rag_type,
    is_rag_override: Boolean(item.is_rag_override),
    milestone_start_date: item.milestone_start_date,
    comments: item.comments
  }), [item]); // Only recreate when item changes
  const [milestoneData, setMilestoneData] = useState<MilestoneFormData>({
    id: item.id,
    milestone_type: item.milestone_type,
    milestone_description: item.milestone_description,
    is_tech: Boolean(item.is_tech),
    is_currency: Boolean(item.is_currency),
    kpi_value: item.kpi_value,
    targeted_date: item.targeted_date,
    input_type: item.input_type,
    milestone_goal: item.milestone_goal,
    latest_actuals: item.latest_actuals,
    calc_rag_type: item.calc_rag_type,
    is_rag_override: Boolean(item.is_rag_override),
    updated_last_by: item.updated_last_by,
    scaId: item.scaId || sca.id,
    is_baselined: Boolean(item.is_baselined),
    milestone_start_date: item.milestone_start_date,
    comments: item.comments
  });
    // Define validateFormFields function with useCallback to avoid unnecessary re-renders
    const validateFormFields = useCallback(() => {
      const errors: FormError = {};
      // Always show validation errors for empty fields regardless of whether they had data initially
      if (isEmpty(milestoneData.milestone_type)) errors.milestone_type = "Milestone type is required";
      if (isEmpty(milestoneData.milestone_description)) errors.milestone_description = "Description is required";
      if (isEmpty(milestoneData.milestone_goal)) errors.milestone_goal = "Goal is required";
      if (isEmpty(milestoneData.targeted_date)) errors.targeted_date = "Target date is required";
      if (isEmpty(milestoneData.input_type)) errors.input_type = "Input type is required";
      if (isEmpty(milestoneData.kpi_value)) errors.kpi_value = "KPI value is required";
      return errors;
    }, [
      milestoneData.milestone_type,
      milestoneData.milestone_description,
      milestoneData.milestone_goal,
      milestoneData.targeted_date,
      milestoneData.input_type,
      milestoneData.kpi_value
    ]);
    const [statusData, setStatusData] = useState<StatusUpdateFormData>({
    status_date: getTodayFormatted(),
    expected_kpi_value: null,
    latest_actuals: null,
    status_rag_status: null,
    is_status_rag_override: false,
    status_notes: null,
    updated_by: null,
    notes: null,
    milestoneId: item.id,
    id: ""  
  });
  const [formErrors, setFormErrors] = useState<FormError>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showRagNote, setShowRagNote] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [fieldsWithData, setFieldsWithData] = useState<Record<string, boolean>>({});
  // State for milestone status history
  const [milestoneStatusHistory, setMilestoneStatusHistory] = useState<MilestoneStatusType[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [pageSize] = useState(10);
  const [sortingColumn, setSortingColumn] = useState<{ id: string, sortingField: string }>({ id: "status_date", sortingField: "status_date" });
  const [sortingDescending, setSortingDescending] = useState(true);
  // Add this function to handle the baseline action
  const handleBaseline = () => {
    setShowBaselineModal(true);
    setBaselineConfirmationText("");
  };
  const handleConfirmBaseline = async () => {
    if (baselineConfirmationText.toLowerCase() !== 'baseline') {
      return;
    }
    
    setIsLoading(true);
    try {
      // Update the milestone to set is_baselined to true
      await client.models.Milestone.update({
        id: milestoneData.id,
        is_baselined: true
      });
      
      // Update local state
      setMilestoneData(prev => ({
        ...prev,
        is_baselined: true
      }));
      
      // Close the modal and reset the confirmation text
      setShowBaselineModal(false);
      setBaselineConfirmationText("");
      
      showNotification("success", "Milestone has been baselined successfully.");
    } catch (error) {
      console.error("Error baselining milestone:", error);
      showNotification("error", "Failed to baseline milestone.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add this helper function to determine if form fields should be disabled
const isFormDisabled = () => {
  return milestoneData.is_baselined === true;
};
const getMilestoneSummaryHeader = () => {
    if (!milestoneData.calc_rag_type) {
      return "Milestone Summary - No status entries";
    } else {
      return (
        <SpaceBetween direction="horizontal" size="xs" alignItems="center">
          <span>Milestone Summary  </span>
          <StatusIndicator type={getRagStatusType(milestoneData.calc_rag_type)}>
            {milestoneData.calc_rag_type}
          </StatusIndicator>
        </SpaceBetween>
      );
    }
  };
  // Add this function inside the MilestoneUpdateForm component
const isStatusFormValid = useCallback(() => {
    // Check if required fields are filled
    if (!statusData.expected_kpi_value || !statusData.latest_actuals || !statusData.status_rag_status) {
      return false;
    }
    
    // Check notes length based on RAG override
    const notesContent = statusData.notes || statusData.status_notes || '';
    if (statusData.is_status_rag_override) {
      // Minimum 20 characters required for RAG override
      return notesContent.length >= 20;
    } else {
      // Minimum 10 characters required otherwise
      return notesContent.length >= 10;
    }
  }, [
    statusData.expected_kpi_value, 
    statusData.latest_actuals, 
    statusData.status_rag_status,
    statusData.notes,
    statusData.status_notes,
    statusData.is_status_rag_override
  ]);
  const updateMilestoneRagStatus = async (ragStatus: string | null) => {
    if (!item?.id) return;
    
    try {
      // Update only the calc_rag_type field in the milestone table
      await client.models.Milestone.update({
        id: item.id,
        calc_rag_type: ragStatus
      });
      
      // Update the local state to reflect the change
      setMilestoneData(prev => ({
        ...prev,
        calc_rag_type: ragStatus
      }));
      
      console.log('Milestone RAG status updated successfully');
    } catch (error) {
      console.error('Error updating milestone RAG status:', error);
    }
  };
  const validateMilestoneForm = useCallback(() => {
    const errors = validateFormFields();
    
    // Validate date formats
    if (milestoneData.milestone_start_date) {
      const { isValid, errorMessage } = validateAndFormatDate(milestoneData.milestone_start_date);
      if (!isValid) {
        errors.milestone_start_date = errorMessage;
      }
    }
    
    if (milestoneData.targeted_date) {
      const { isValid, errorMessage } = validateAndFormatDate(milestoneData.targeted_date);
      if (!isValid) {
        errors.targeted_date = errorMessage;
      }
    }
    
    // Check date order if both dates are valid
    if (milestoneData.milestone_start_date && milestoneData.targeted_date) {
      const startDateResult = validateAndFormatDate(milestoneData.milestone_start_date);
      const targetDateResult = validateAndFormatDate(milestoneData.targeted_date);
      
      if (startDateResult.isValid && targetDateResult.isValid) {
        // Parse dates for comparison
        const [startMonth, startDay, startYear] = milestoneData.milestone_start_date.split('/').map(num => parseInt(num, 10));
        const [targetMonth, targetDay, targetYear] = milestoneData.targeted_date.split('/').map(num => parseInt(num, 10));
        
        const startDate = new Date(2000 + startYear, startMonth - 1, startDay);
        const targetDate = new Date(2000 + targetYear, targetMonth - 1, targetDay);
        
        if (startDate > targetDate) {
          errors.milestone_start_date = "Start Date must be before Due Date";
        }
      }
    }
    
    // For submission validation, only block submission if fields that had data initially are now empty
    // Define a type that represents the keys that are common between MilestoneFormData and FormError
    type CommonKeys = keyof MilestoneFormData & keyof FormError;
  
    // Then use this type when iterating
    Object.keys(fieldsWithData).forEach(field => {
      const key = field as CommonKeys;
      if (fieldsWithData[key as keyof typeof fieldsWithData] && 
          isEmpty(milestoneData[key])) {
        errors[key] = `${key.replace(/_/g, ' ')} is required`;
      }
    });
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [milestoneData, validateFormFields, fieldsWithData]);
  
  function areValuesEqual<T>(a: T | null | undefined, b: T | null | undefined): boolean {
    // If both are null or undefined, they're equal
    if (a == null && b == null) return true;
    
    // If only one is null or undefined, they're not equal
    if (a == null || b == null) return false;
    
    // For booleans
    if (typeof a === 'boolean' && typeof b === 'boolean') {
      return a === b;
    }
    
    // For strings, compare after trimming
    if (typeof a === 'string' && typeof b === 'string') {
      return a.trim() === b.trim();
    }
    
    // For other types, direct comparison
    return a === b;
  }
  const handleSaveStatusUpdate = async () => {
    // Use the dedicated status validation function
    if (!validateStatusForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create a new status entry in the MilestoneStatus table
      const result = await client.models.MilestoneStatus.create({
        milestoneId: milestoneData.id,
        lastest_kpi_planned: statusData.expected_kpi_value,
        latest_status_actuals: statusData.latest_actuals,
        status_rag_status: statusData.status_rag_status,
        is_status_rag_override: statusData.is_status_rag_override,
        status_notes: statusData.status_notes || statusData.notes,
        updated_by: statusData.updated_by || 'Current User'
      });
      
      // Extract the created item from the result and convert it
      const newStatus = convertToMilestoneStatusType(result.data);
      
      // Add the new status to the history
      setMilestoneStatusHistory(prev => [newStatus, ...prev]);
      
      // Clear only the status form fields
      setStatusData({
        status_date: getTodayFormatted(),
        expected_kpi_value: null,
        latest_actuals: null,
        status_rag_status: null,
        is_status_rag_override: false,
        status_notes: null,
        updated_by: null,
        notes: null,
        milestoneId: milestoneData.id,
        id: ""
      });
      
      // Clear any form errors related to status
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.expected_kpi_value;
        delete newErrors.latest_actuals;
        delete newErrors.status_date;
        return newErrors;
      });
      
      // Show success message
      showNotification("success", "Milestone saved successfully.");
    } catch (error) {
      console.error('Error saving status update:', error);
      showNotification("error", "Milestone failed to save.");
    } finally {
      setIsLoading(false);
    }
  };
  
const handleSubmitMilestone = async () => {
  // Validate milestone form
  if (!validateMilestoneForm()) {
    return;
  }
  setIsLoading(true);
  try {
    // Update the milestone
    await client.models.Milestone.update({
      id: milestoneData.id,
      milestone_type: milestoneData.milestone_type,
      milestone_description: milestoneData.milestone_description,
      is_tech: milestoneData.is_tech,
      is_currency: milestoneData.is_currency,
      kpi_value: milestoneData.kpi_value,
      targeted_date: milestoneData.targeted_date,
      input_type: milestoneData.input_type,
      milestone_goal: milestoneData.milestone_goal,
      latest_actuals: milestoneData.latest_actuals,
      calc_rag_type: milestoneData.calc_rag_type,
      is_rag_override: milestoneData.is_rag_override,
      updated_last_by: milestoneData.updated_last_by,
      is_baselined: milestoneData.is_baselined,
      milestone_start_date: milestoneData.milestone_start_date,
      comments: milestoneData.comments
    });
    // Show success message
    showNotification("success", "Milestone updated successfully.");
    // navigate('/scamilestonelist', { state: { sca } });
  } catch (error) {
    console.error('Error updating milestone:', error);
    showNotification("error", "Milestone failed to update.");
  } finally {
    setIsLoading(false);
  }
};
const validateStatusForm = useCallback(() => {
  const errors: FormError = {};
  
  // Validate required fields for status entry
  if (!statusData.expected_kpi_value) {
    errors.expected_kpi_value = 'Expected KPI value is required';
  }
  
  if (!statusData.latest_actuals) {
    errors.latest_actuals = 'Latest actuals is required';
  }
  
  // Validate date format if needed
  if (statusData.status_date && typeof statusData.status_date === 'string' && 
      !/^\d{2}\/\d{2}\/\d{2}$/.test(statusData.status_date)) {
    errors.status_date = "Date must be in MM/DD/YY format";
  }
  
  setFormErrors(errors);
  return Object.keys(errors).length === 0;
}, [statusData.expected_kpi_value, statusData.latest_actuals, statusData.status_date]);

const loadMilestoneStatusHistory = useCallback(async () => {
  if (!item?.id) return;
  setIsLoadingHistory(true);
  try {
    // Query MilestoneStatus records for the current milestone
    const statusResults = await client.models.MilestoneStatus.list({
      filter: { milestoneId: { eq: item.id } }
    });
    // Extract the data array from the results and convert each item
    const statusItems = statusResults.data.map(item => convertToMilestoneStatusType(item));
    // Sort by createdAt in descending order (newest first)
    const sortedStatuses = [...statusItems].sort((a, b) => {
      const dateA = new Date(a.createdAt || '');
      const dateB = new Date(b.createdAt || '');
      return dateB.getTime() - dateA.getTime();
    });
    // Now set the sorted array to state
    setMilestoneStatusHistory(sortedStatuses);
  } catch (error) {
    console.error('Error loading milestone status history:', error);
  } finally {
    setIsLoadingHistory(false);
  }
}, [item?.id]);
// Call the load function when the component mounts
useEffect(() => {
  loadMilestoneStatusHistory();
}, [loadMilestoneStatusHistory]);
// Update the table columns for the status history
const statusHistoryColumns = [
  {
    id: "status_date",
    header: "Date",
    cell: (item: MilestoneStatusType) => formatDate(item.createdAt),
    width: 100
  },
  {
    id: "lastest_kpi_planned",
    header: "Expected KPI",
    cell: (item: MilestoneStatusType) => item.lastest_kpi_planned,
    width: 120
  },
  {
    id: "latest_status_actuals",
    header: "Actuals",
    cell: (item: MilestoneStatusType) => item.latest_status_actuals,
    width: 120
  },
  {
    id: "status_rag_status",
    header: "Status",
    cell: (item: MilestoneStatusType) => (
      <StatusIndicator type={getRagStatusType(item.status_rag_status)}>
        {item.status_rag_status || "Not set"}
      </StatusIndicator>
    ),
    width: 100
  },
  {
    id: "updated_by",
    header: "Updated By",
    cell: (item: MilestoneStatusType) => item.updated_by,
    width: 150
  },
  {
    id: "status_notes",
    header: "Notes",
    cell: (item: MilestoneStatusType) => item.status_notes,
    width: 300
  }
];

  // Helper function to format dates
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  // Helper function to determine status indicator type
  const getRagStatusType = (ragStatus: string | null | undefined): "success" | "warning" | "error" | "pending" | "info" => {
    if (!ragStatus) return "pending";
    
    switch (ragStatus.toLowerCase()) {
      case "green":
        return "success";
      case "amber":
        return "warning";
      case "red":
        return "error";
      default:
        return "pending";
    }
  };
  // Helper function to check if a field is empty (null, undefined, or empty string)
  const isEmpty = (value: string | null | undefined | boolean): boolean => {
    return value === null || value === undefined || value === '';
  };
  // Set today's date in status_date field when component loads
  // and track which fields had data initially
  useEffect(() => {
    setStatusData(prev => ({
      ...prev,
      status_date: getTodayFormatted()
    }));
    
    // Track which fields had data when the form was loaded
    const fieldsWithInitialData: Record<string, boolean> = {
      milestone_type: !isEmpty(item.milestone_type),
      milestone_description: !isEmpty(item.milestone_description),
      kpi_value: !isEmpty(item.kpi_value),
      targeted_date: !isEmpty(item.targeted_date),
      input_type: !isEmpty(item.input_type),
      milestone_goal: !isEmpty(item.milestone_goal),
      latest_actuals: !isEmpty(item.latest_actuals),
      calc_rag_type: !isEmpty(item.calc_rag_type)
    };
    
    setFieldsWithData(fieldsWithInitialData);
  }, [item]);
  
  // Run validation after form data is initialized
  useEffect(() => {
    // Show validation errors for all empty fields on load
    setFormErrors(validateFormFields());
  }, [milestoneData.milestone_type, milestoneData.milestone_description, milestoneData.milestone_goal, 
    milestoneData.targeted_date, milestoneData.input_type, milestoneData.kpi_value, validateFormFields]);
  
  // Check for changes in milestone summary data
// Check for changes in milestone summary data
useEffect(() => {
  const changes = {
    milestone_type: !areValuesEqual<string>(milestoneData.milestone_type, originalMilestoneData.milestone_type),
    milestone_description: !areValuesEqual<string>(milestoneData.milestone_description, originalMilestoneData.milestone_description),
    is_tech: !areValuesEqual<boolean>(milestoneData.is_tech, originalMilestoneData.is_tech),
    is_currency: !areValuesEqual<boolean>(milestoneData.is_currency, originalMilestoneData.is_currency),
    kpi_value: !areValuesEqual<string>(milestoneData.kpi_value, originalMilestoneData.kpi_value),
    targeted_date: !areValuesEqual<string>(milestoneData.targeted_date, originalMilestoneData.targeted_date),
    input_type: !areValuesEqual<string>(milestoneData.input_type, originalMilestoneData.input_type),
    milestone_goal: !areValuesEqual<string>(milestoneData.milestone_goal, originalMilestoneData.milestone_goal),
    latest_actuals: !areValuesEqual<string>(milestoneData.latest_actuals, originalMilestoneData.latest_actuals),
    calc_rag_type: !areValuesEqual<string>(milestoneData.calc_rag_type, originalMilestoneData.calc_rag_type),
    is_rag_override: !areValuesEqual<boolean>(milestoneData.is_rag_override, originalMilestoneData.is_rag_override),
    milestone_start_date: !areValuesEqual<string>(milestoneData.milestone_start_date, originalMilestoneData.milestone_start_date),
    comments: !areValuesEqual<string>(milestoneData.comments, originalMilestoneData.comments)
  };
  
  const hasMilestoneChanges = Object.values(changes).some(changed => changed);
  
  // Only update if the value has actually changed
  if (hasChanges !== hasMilestoneChanges) {
    setHasChanges(hasMilestoneChanges);
  }
}, [
  milestoneData.milestone_type,
  milestoneData.milestone_description,
  milestoneData.is_tech,
  milestoneData.is_currency,
  milestoneData.kpi_value,
  milestoneData.targeted_date,
  milestoneData.input_type,
  milestoneData.milestone_goal,
  milestoneData.latest_actuals,
  milestoneData.calc_rag_type,
  milestoneData.is_rag_override,
  milestoneData.milestone_start_date,
  milestoneData.comments,
  originalMilestoneData,
  hasChanges
]);

  const ragTypeOptions = [
    { value: "Green", label: "Green" },
    { value: "Amber", label: "Amber" },
    { value: "Red", label: "Red" }
  ];

  useEffect(() => {
    // Show warning if RAG status is not Red but actuals are significantly below expected
    if (statusData.latest_actuals && statusData.expected_kpi_value && statusData.status_rag_status !== "Red") {
      const actuals = parseFloat(statusData.latest_actuals);
      const expected = parseFloat(statusData.expected_kpi_value);
      
      if (!isNaN(actuals) && !isNaN(expected) && actuals < expected * 0.8) {
        setShowRagNote(true);
        // Automatically check the RAG Override checkbox when conditions are met
        setStatusData(prev => ({ ...prev, is_status_rag_override: true }));
        return;
      }
    }
    
    setShowRagNote(false);
  }, [statusData.latest_actuals, statusData.expected_kpi_value, statusData.status_rag_status]);
  

  const handleReset = () => {
    setMilestoneData({
      id: item.id,
      milestone_type: item.milestone_type,
      milestone_description: item.milestone_description,
      is_tech: Boolean(item.is_tech),
      is_currency: Boolean(item.is_currency),
      kpi_value: item.kpi_value,
      targeted_date: item.targeted_date,
      input_type: item.input_type,
      milestone_goal: item.milestone_goal,
      latest_actuals: item.latest_actuals,
      calc_rag_type: item.calc_rag_type,
      is_rag_override: Boolean(item.is_rag_override),
      updated_last_by: item.updated_last_by,
      scaId: item.scaId || sca.id,
      is_baselined: Boolean(item.is_baselined),
      milestone_start_date: item.milestone_start_date,
      comments: item.comments
    });
    
    setFormErrors({});
    setHasChanges(false);
    showNotification("success", "Milestone reset to previous values.");
  };
  

  const handleCancel = () => {
    navigate('/scamilestonelist', { state: { sca } });
  };

  return (
    <Form>
      <Container>
        <SpaceBetween size="xs">
        {showAlert && (
        <Alert
          type={alertType}
          dismissible
          onDismiss={() => setShowAlert(false)}
        >
          {alertMessage}
        </Alert>
      )}
        <Header>
          {milestoneData.is_baselined ? (
            <SpaceBetween direction="horizontal" size="xs" alignItems="center">
              <span>Milestone Baselined</span>
              <StatusIndicator type="success">Baselined</StatusIndicator>
            </SpaceBetween>
          ) : (
            <SpaceBetween direction="horizontal" size="xs" alignItems="center">
              <span>Update Milestone</span>
              <StatusIndicator type="error">Not Baselined</StatusIndicator>
            </SpaceBetween>
          )}
        </Header>
  
          {/* Milestone Summary Section */}
          <Container
            header={
              <Header 
                variant="h2"
                actions={
                  <SpaceBetween direction="horizontal" size="xs">
                    {!milestoneData.is_baselined && (
                      <Button 
                        onClick={handleBaseline}
                        disabled={isLoading || hasChanges}
                      >
                        Baseline
                      </Button>
                    )}
                    <Button 
                      onClick={handleReset} 
                      disabled={!hasChanges}
                    >
                      Reset
                    </Button>
                    <Button 
                      variant="link"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="primary" 
                      onClick={handleSubmitMilestone} 
                      loading={isLoading}
                      disabled={!hasChanges}
                    >
                      Save
                    </Button>
                  </SpaceBetween>
                }
              >
                {getMilestoneSummaryHeader()}
              </Header>
            }
          >
            <SpaceBetween direction="vertical" size="l">
        {/* First Row - Description with label to the left */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '120px', flexShrink: 0 }}>
              <Box fontWeight="bold">Description</Box>
            </div>
            <div style={{ flex: '1' }}>
              <FormField
                errorText={formErrors.milestone_description}
                stretch={true}
              >
                <Input
                  value={milestoneData.milestone_description || ''}
                  onChange={({ detail }) =>
                    setMilestoneData(prev => ({ ...prev, milestone_description: detail.value || null }))
                  }
                  disabled={isFormDisabled()}
                />
              </FormField>
            </div>
          </div>

          {/* Second Row - Goal with label to the left */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '120px', flexShrink: 0 }}>
              <Box fontWeight="bold">Goal</Box>
            </div>
            <div style={{ flex: '1' }}>
              <FormField
                errorText={formErrors.milestone_goal}
                stretch={true}
              >
                <Input
                  value={milestoneData.milestone_goal || ''}
                  onChange={({ detail }) =>
                    setMilestoneData(prev => ({ ...prev, milestone_goal: detail.value || null }))
                  }
                  disabled={isFormDisabled()}
                />
              </FormField>
            </div>
          </div>

      {/* Third Row - Type, KPI Target, Dates, and Checkboxes */}
      <SpaceBetween direction="horizontal" size="l">
        <FormField
          label="Milestone Type"
          errorText={formErrors.milestone_type}
        >
      <Input
        value={milestoneData.milestone_type || ''}
        onChange={({ detail }) =>
          setMilestoneData(prev => ({ ...prev, milestone_type: detail.value || null }))
        }
        disabled={isFormDisabled()}
      />
    </FormField>

    <FormField
      label="Milestone KPI Target"
      errorText={formErrors.kpi_value}
      constraintText={milestoneData.input_type ? milestoneData.input_type.charAt(0).toUpperCase() + milestoneData.input_type.slice(1) : ""}
    >
      <div style={{ width: '150px' }}>
        <Input
          value={milestoneData.kpi_value || ''}
          onChange={({ detail }) =>
            setMilestoneData(prev => ({ ...prev, kpi_value: detail.value || null }))
          }
          disabled={isFormDisabled()}
        />
      </div>
    </FormField>

    <FormField
      label="Start Date"
      errorText={formErrors.start_date}
      constraintText="MM/DD/YY"
      description={
        milestoneData.milestone_start_date && milestoneData.targeted_date && 
        (() => {
          try {
            const startDate = new Date(milestoneData.milestone_start_date);
            const dueDate = new Date(milestoneData.targeted_date);
            if (!isNaN(startDate.getTime()) && !isNaN(dueDate.getTime())) {
              const oneMonth = 30 * 24 * 60 * 60 * 1000; // approx 30 days in ms
              if (startDate < dueDate && dueDate.getTime() - startDate.getTime() < oneMonth) {
                return "Start Date is less than a month before Due Date";
              }
            }
            return undefined;
          } catch (error) {
            return undefined;
          }
        })()
      }
    >
      <div style={{ width: '100px' }}>
        <Input
          value={milestoneData.milestone_start_date || ''}
          placeholder="MM/DD/YY"
          onChange={({ detail }) => {
            setMilestoneData(prev => ({ ...prev, milestone_start_date: detail.value || null }));
          }}          
          onBlur={() => {
            if (milestoneData.milestone_start_date) {
              const { isValid, formattedDate, errorMessage } = validateAndFormatDate(milestoneData.milestone_start_date);
              if (isValid) {
                setMilestoneData(prev => ({ ...prev, milestone_start_date: formattedDate }));
                setFormErrors(prev => ({ ...prev, start_date: undefined }));
              } else {
                setFormErrors(prev => ({ ...prev, start_date: errorMessage }));
              }
            }
          }}
          
          disabled={isFormDisabled()}
        />
      </div>
    </FormField>

    <FormField
      label="Due Date"
      errorText={formErrors.targeted_date}
      description={
        milestoneData.milestone_start_date && milestoneData.targeted_date && 
        (() => {
          try {
            const startDate = new Date(milestoneData.milestone_start_date);
            const dueDate = new Date(milestoneData.targeted_date);
            if (!isNaN(startDate.getTime()) && !isNaN(dueDate.getTime())) {
              const oneMonth = 30 * 24 * 60 * 60 * 1000; // approx 30 days in ms
              if (startDate < dueDate && dueDate.getTime() - startDate.getTime() < oneMonth) {
                return "Due Date is less than a month after Start Date";
              }
            }
            return undefined;
          } catch (error) {
            return undefined;
          }
        })()
      }
      constraintText="MM/DD/YY"
    >
      <div style={{ width: '100px' }}>
        <Input
          value={milestoneData.targeted_date || ''}
          placeholder="MM/DD/YY"
          onChange={({ detail }) => {
            setMilestoneData(prev => ({ ...prev, targeted_date: detail.value || null }));
          }}
          onBlur={() => {
            if (milestoneData.targeted_date) {
              const { isValid, formattedDate, errorMessage } = validateAndFormatDate(milestoneData.targeted_date);
              if (isValid) {
                setMilestoneData(prev => ({ ...prev, targeted_date: formattedDate }));
                setFormErrors(prev => ({ ...prev, targeted_date: undefined }));
              } else {
                setFormErrors(prev => ({ ...prev, targeted_date: errorMessage }));
              }
            }
          }}
          disabled={isFormDisabled()}
        />
      </div>
    </FormField>

    <FormField label="Tech Milestone">
      <Checkbox
        checked={milestoneData.is_tech}
        onChange={({ detail }) =>
          setMilestoneData(prev => ({ ...prev, is_tech: detail.checked }))
        }
        disabled={isFormDisabled()}
      >
        <TextContent>Technical Milestone</TextContent>
      </Checkbox>
    </FormField>

    <FormField label="Currency">
      <Checkbox
        checked={milestoneData.is_currency}
        onChange={({ detail }) =>
          setMilestoneData(prev => ({ ...prev, is_currency: detail.checked }))
        }
        disabled={isFormDisabled()}
      >
        <TextContent>Currency Milestone</TextContent>
      </Checkbox>
    </FormField>
  </SpaceBetween>
  {/* Comments Field - Always Editable */}
<div style={{ display: 'flex', alignItems: 'flex-start', marginTop: '20px' }}>
  <div style={{ width: '120px', flexShrink: 0 }}>
    <Box fontWeight="bold">Comments</Box>
  </div>
  <div style={{ flex: '1' }}>
    <FormField
      errorText={formErrors.comments}
      stretch={true}
    >
      <Textarea
        value={milestoneData.comments || ''}
        onChange={({ detail }) =>
          setMilestoneData(prev => ({ ...prev, comments: detail.value || null }))
        }
        rows={3}
        // Note: No disabled prop here, so it's always editable
      />
    </FormField>
    {milestoneData.is_baselined && (
      <Box color="text-status-info" padding={{ top: "xxs" }} fontSize="body-s">
        Comments can be updated even when milestone is baselined
      </Box>
    )}
  </div>
</div>
</SpaceBetween>

</Container>
  
          {/* Milestone Status History Table */}
          <Container header={<Header variant="h2">Status History</Header>}>
            <Table
              columnDefinitions={statusHistoryColumns}
              items={milestoneStatusHistory.slice(
                (currentPageIndex - 1) * pageSize,
                currentPageIndex * pageSize
              )}
              loading={isLoadingHistory}
              loadingText="Loading status history"
              empty={
                <Box textAlign="center" padding="s">
                  <b>No status history</b>
                  <Box padding="s">
                    This milestone has no status updates yet.
                  </Box>
                </Box>
              }
              header={<Header>Status Updates</Header>}
              sortingColumn={sortingColumn}
              sortingDescending={sortingDescending}
              onSortingChange={({ detail }) => {
                setSortingColumn(detail.sortingColumn as { id: string, sortingField: string });
                setSortingDescending(detail.isDescending || false);
                
                // Sort the data
                const sorted = [...milestoneStatusHistory].sort((a, b) => {
                  const field = detail.sortingColumn.sortingField as keyof MilestoneStatusType;
                  const aValue = String(a[field] || '');
                  const bValue = String(b[field] || '');
                  
                  return detail.isDescending 
                    ? bValue.localeCompare(aValue) 
                    : aValue.localeCompare(bValue);
                });
                
                setMilestoneStatusHistory(sorted);
              }}
              
            />
            
            {milestoneStatusHistory.length > pageSize && (
              <Box float="right" padding="s">
                <Pagination
                  currentPageIndex={currentPageIndex}
                  pagesCount={Math.ceil(milestoneStatusHistory.length / pageSize)}
                  onChange={({ detail }) => setCurrentPageIndex(detail.currentPageIndex)}
                />
              </Box>
            )}
          </Container>
          {/* Enter New Milestone Status Entry Section */}
          <Container
            header={
              <Header 
                variant="h2"
                actions={
                  <Button 
                    variant="primary" 
                    onClick={handleSaveStatusUpdate}
                    disabled={!isStatusFormValid()}
                  >
                    Save Status Update
                  </Button>
                }
              >
                Enter New Milestone Status Entry
              </Header>
            }
          >
            <SpaceBetween direction="vertical" size="l">
              <SpaceBetween direction="horizontal" size="l">
                <FormField label="Status Date">
                  <Input
                    value={statusData.status_date || ''}
                    placeholder="MM/DD/YY"
                    disabled={true}
                  />
                  <Box color="text-body-secondary" padding={{ top: "xxs" }} fontSize="body-s">
                    Today's date is automatically set
                  </Box>
                </FormField>

                <FormField label="Expected KPI Value for Status Date">
                  <Input
                    value={statusData.expected_kpi_value || ''}
                    onChange={({ detail }) =>
                      setStatusData(prev => ({ ...prev, expected_kpi_value: detail.value || null }))
                    }
                  />
                </FormField>

                <FormField label="Latest Actuals">
                  <Input
                    value={statusData.latest_actuals || ''}
                    onChange={({ detail }) =>
                      setStatusData(prev => ({ ...prev, latest_actuals: detail.value || null }))
                    }
                  />
                </FormField>

                <FormField label="RAG Status">
                  <Select
                    selectedOption={
                      ragTypeOptions.find(option => option.value === statusData.status_rag_status) 
                      || null
                    }
                    onChange={({ detail }) => {
                      const newRagStatus = detail.selectedOption?.value || null;
                      
                      // Update the status form data
                      setStatusData(prev => ({ 
                        ...prev, 
                        status_rag_status: newRagStatus 
                      }));
                      
                      // Also update the milestone table with just the RAG status
                      updateMilestoneRagStatus(newRagStatus);
                    }}
                    options={ragTypeOptions}
                  />
                </FormField>

                <FormField label="RAG Override">
                  <SpaceBetween direction="horizontal" size="xs" alignItems="center">
                    <Checkbox
                      checked={statusData.is_status_rag_override}
                      onChange={({ detail }) =>
                        setStatusData(prev => ({ ...prev, is_rag_override: detail.checked }))
                      }
                      disabled={showRagNote}
                      description={showRagNote ? "Automatically checked due to performance below threshold" : undefined}
                    >
                      <TextContent>Override RAG Status</TextContent>
                    </Checkbox>
                    {showRagNote && (
                      <Box color="text-status-warning" padding="xs">
                        Explain why RAG status is not Red in notes below
                      </Box>
                    )}
                  </SpaceBetween>
                </FormField>
              </SpaceBetween>

              <FormField
                label="Notes"
                description={
                  statusData.is_status_rag_override 
                    ? "Minimum 20 characters required" 
                    : "Minimum 10 characters required"
                }
              >
                <Textarea
                  value={statusData.notes || ''}
                  onChange={({ detail }) =>
                    setStatusData(prev => ({ ...prev, notes: detail.value || null }))
                  }
                  rows={3}
                />
              </FormField>
            </SpaceBetween>
          </Container>
        </SpaceBetween>
      </Container>
      {/* Baseline Confirmation Modal */}
      <Modal
        visible={showBaselineModal}
        onDismiss={() => setShowBaselineModal(false)}
        header="Confirm Baseline"
        closeAriaLabel="Close dialog"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setShowBaselineModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmBaseline}
                disabled={baselineConfirmationText.toLowerCase() !== 'baseline'}
              >
                Baseline
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="m">
          <Box>
            <p>Once a milestone is baselined, milestone data cannot be changed.</p>
            <p>Type 'baseline' to confirm.</p>
          </Box>
          <Input
            value={baselineConfirmationText}
            onChange={({ detail }) => setBaselineConfirmationText(detail.value)}
            placeholder="Type 'baseline' to confirm"
          />
        </SpaceBetween>
      </Modal>
    </Form>
  );
}

export default MilestoneUpdateForm;