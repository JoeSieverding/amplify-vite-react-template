import { useCallback, useState, useEffect } from "react";
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
  StatusIndicator
} from "@cloudscape-design/components";

const client = generateClient<Schema>();

interface LocationState {
  item: Schema["Milestone"]["type"];
  sca: Schema["Sca"]["type"];
}

interface FormData {
  id: string;                            // Required
  milestone_type: string | null | undefined;
  milestone_description: string | null | undefined;
  is_tech: boolean;                      // Required with default false
  is_currency: boolean;                  // Required with default false
  kpi_value: string | null | undefined;
  targeted_date: string | null | undefined;
  input_type: string | null | undefined;
  milestone_goal: string | null | undefined;
  latest_actuals: string | null | undefined;
  calc_rag_type: string | null | undefined;
  is_rag_override: boolean;              // Required with default false
  updated_last_by: string | null | undefined;
  scaId: string;                         // Required
  // New fields (not in database)
  start_date?: string | null | undefined;
  status_date?: string | null | undefined;
  expected_kpi_value?: string | null | undefined;
  notes?: string | null | undefined;
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
}

// Interface for milestone status history items
interface MilestoneStatusType {
  id: string;
  status_date: string;
  expected_kpi_value: string | null;
  latest_actuals: string | null;
  calc_rag_type: string | null;
  notes: string | null;
  updated_last_by: string | null;
  created_at: string;
}
  
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
  const { item, sca } = location.state as LocationState;

  // Store the original milestone data for comparison
  const originalMilestoneData = {
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
    start_date: null
  };

  const [formData, setFormData] = useState<FormData>({
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
    start_date: null,
    status_date: null,
    expected_kpi_value: null,
    notes: null
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

  const handleSaveStatusUpdate = () => {
    // Validate required fields for status entry
    if (!formData.expected_kpi_value || !formData.latest_actuals) {
      return;
    }
    
    // Create a new status entry
    const newStatusEntry: MilestoneStatusType = {
      id: Date.now().toString(), // Temporary ID
      status_date: formData.status_date || getTodayFormatted(),
      expected_kpi_value: formData.expected_kpi_value,
      latest_actuals: formData.latest_actuals,
      calc_rag_type: formData.calc_rag_type || null,
      notes: formData.notes || null,
      updated_last_by: "current-user@example.com", // This would come from auth context
      created_at: new Date().toISOString()
    };
    
    // Add the new entry to the history
    setMilestoneStatusHistory(prev => [newStatusEntry, ...prev]);
    
    // Reset the status entry form fields
    setFormData(prev => ({
      ...prev,
      status_date: getTodayFormatted(), // Reset to today's date
      expected_kpi_value: null,
      latest_actuals: null,
      calc_rag_type: null,
      is_rag_override: false,
      notes: null
    }));
    
    // Show a success message or notification if needed
    console.log("Status update saved:", newStatusEntry);
  };

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

  // Define validateFormFields function with useCallback to avoid unnecessary re-renders
  const validateFormFields = useCallback(() => {
    const errors: FormError = {};
    
    // Always show validation errors for empty fields regardless of whether they had data initially
    if (isEmpty(formData.milestone_type)) errors.milestone_type = "Milestone type is required";
    if (isEmpty(formData.milestone_description)) errors.milestone_description = "Description is required";
    if (isEmpty(formData.milestone_goal)) errors.milestone_goal = "Goal is required";
    if (isEmpty(formData.targeted_date)) errors.targeted_date = "Target date is required";
    if (isEmpty(formData.input_type)) errors.input_type = "Input type is required";
    if (isEmpty(formData.kpi_value)) errors.kpi_value = "KPI value is required";
    
    return errors;
  }, [
    formData.milestone_type,
    formData.milestone_description,
    formData.milestone_goal,
    formData.targeted_date,
    formData.input_type,
    formData.kpi_value
  ]);

  // Set today's date in status_date field when component loads
  // and track which fields had data initially
  useEffect(() => {
    setFormData(prev => ({
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
  }, [formData.milestone_type, formData.milestone_description, formData.milestone_goal, 
      formData.targeted_date, formData.input_type, formData.kpi_value, validateFormFields]);
  
  // Check for changes in milestone summary data
  useEffect(() => {
    const hasMilestoneChanges = 
      formData.milestone_type !== originalMilestoneData.milestone_type ||
      formData.milestone_description !== originalMilestoneData.milestone_description ||
      formData.is_tech !== originalMilestoneData.is_tech ||
      formData.is_currency !== originalMilestoneData.is_currency ||
      formData.kpi_value !== originalMilestoneData.kpi_value ||
      formData.targeted_date !== originalMilestoneData.targeted_date ||
      formData.input_type !== originalMilestoneData.input_type ||
      formData.milestone_goal !== originalMilestoneData.milestone_goal ||
      formData.latest_actuals !== originalMilestoneData.latest_actuals ||
      formData.calc_rag_type !== originalMilestoneData.calc_rag_type ||
      formData.is_rag_override !== originalMilestoneData.is_rag_override ||
      formData.start_date !== originalMilestoneData.start_date;
    
    setHasChanges(hasMilestoneChanges);
  }, [
    formData.milestone_type,
    formData.milestone_description,
    formData.is_tech,
    formData.is_currency,
    formData.kpi_value,
    formData.targeted_date,
    formData.input_type,
    formData.milestone_goal,
    formData.latest_actuals,
    formData.calc_rag_type,
    formData.is_rag_override,
    formData.start_date,
    originalMilestoneData.milestone_type,
    originalMilestoneData.milestone_description,
    originalMilestoneData.is_tech,
    originalMilestoneData.is_currency,
    originalMilestoneData.kpi_value,
    originalMilestoneData.targeted_date,
    originalMilestoneData.input_type,
    originalMilestoneData.milestone_goal,
    originalMilestoneData.latest_actuals,
    originalMilestoneData.calc_rag_type,
    originalMilestoneData.is_rag_override,
    originalMilestoneData.start_date
  ]);

  // Mock data for milestone status history
  useEffect(() => {
    // This would be replaced with an actual API call in the future
    const mockStatusHistory: MilestoneStatusType[] = [
      {
        id: "1",
        status_date: "2024-04-01",
        expected_kpi_value: "50%",
        latest_actuals: "45%",
        calc_rag_type: "Amber",
        notes: "Slightly behind schedule but recoverable",
        updated_last_by: "john.doe@example.com",
        created_at: "2024-04-01T10:00:00Z"
      },
      {
        id: "2",
        status_date: "2024-03-01",
        expected_kpi_value: "25%",
        latest_actuals: "30%",
        calc_rag_type: "Green",
        notes: "Ahead of schedule",
        updated_last_by: "jane.smith@example.com",
        created_at: "2024-03-01T10:00:00Z"
      }
    ];
    
    setMilestoneStatusHistory(mockStatusHistory);
    setIsLoadingHistory(false);
  }, []);

  //const inputTypeOptions = [
  //  { value: "percentage", label: "Percentage" },
  //  { value: "currency", label: "Currency" },
  //  { value: "number", label: "Number" },
  //  { value: "boolean", label: "Boolean" }
  //];

  const ragTypeOptions = [
    { value: "Green", label: "Green" },
    { value: "Amber", label: "Amber" },
    { value: "Red", label: "Red" }
  ];

  useEffect(() => {
    // Show warning if RAG status is not Red but actuals are significantly below expected
    if (formData.latest_actuals && formData.expected_kpi_value && formData.calc_rag_type !== "Red") {
      const actuals = parseFloat(formData.latest_actuals);
      const expected = parseFloat(formData.expected_kpi_value);
      
      if (!isNaN(actuals) && !isNaN(expected) && actuals < expected * 0.8) {
        setShowRagNote(true);
        // Automatically check the RAG Override checkbox when conditions are met
        setFormData(prev => ({ ...prev, is_rag_override: true }));
        return;
      }
    }
    
    setShowRagNote(false);
  }, [formData.latest_actuals, formData.expected_kpi_value, formData.calc_rag_type]);

  const validateForm = useCallback(() => {
    // Get all validation errors for display
    const errors = validateFormFields();
    
    // Validate date formats
    if (formData.start_date) {
      const { isValid, errorMessage } = validateAndFormatDate(formData.start_date);
      if (!isValid) {
        errors.start_date = errorMessage;
      }
    }
    
    if (formData.targeted_date) {
      const { isValid, errorMessage } = validateAndFormatDate(formData.targeted_date);
      if (!isValid) {
        errors.targeted_date = errorMessage;
      }
    }
    
    if (formData.status_date && typeof formData.status_date === 'string' && 
        !/^\d{2}\/\d{2}\/\d{2}$/.test(formData.status_date)) {
      errors.status_date = "Date must be in MM/DD/YY format";
    }
    
    // Check date order if both dates are valid
    if (formData.start_date && formData.targeted_date) {
      const startDateResult = validateAndFormatDate(formData.start_date);
      const targetDateResult = validateAndFormatDate(formData.targeted_date);
      
      if (startDateResult.isValid && targetDateResult.isValid) {
        // Parse dates for comparison
        const [startMonth, startDay, startYear] = formData.start_date.split('/').map(num => parseInt(num, 10));
        const [targetMonth, targetDay, targetYear] = formData.targeted_date.split('/').map(num => parseInt(num, 10));
        
        const startDate = new Date(2000 + startYear, startMonth - 1, startDay);
        const targetDate = new Date(2000 + targetYear, targetMonth - 1, targetDay);
        
        if (startDate > targetDate) {
          errors.start_date = "Start Date must be before Due Date";
        }
      }
    }
    
    setFormErrors(errors);
    
    // For submission validation, only block submission if fields that had data initially are now empty
    // or if there are any validation errors
    const blockingErrors: FormError = {};
    
    Object.keys(fieldsWithData).forEach(field => {
      const key = field as keyof typeof fieldsWithData;
      if (fieldsWithData[key] && 
          Object.prototype.hasOwnProperty.call(formData, key) && 
          isEmpty(formData[key as keyof FormData])) {
        blockingErrors[key as keyof FormError] = `${key.replace(/_/g, ' ')} is required`;
      }
    });
    
    // Add any validation errors to blocking errors
    Object.keys(errors).forEach(key => {
      if (errors[key as keyof FormError]) {
        blockingErrors[key as keyof FormError] = errors[key as keyof FormError];
      }
    });
    
    return Object.keys(blockingErrors).length === 0;
  }, [
    formData, 
    fieldsWithData,
    validateFormFields
  ]);
  

  const handleSubmit = async () => {
    // The validateForm function now handles both displaying errors and checking for blocking errors
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 1. Update the milestone summary
      await client.models.Milestone.update({
        id: formData.id,
        milestone_type: formData.milestone_type || null,
        milestone_description: formData.milestone_description || null,
        is_tech: formData.is_tech,
        is_currency: formData.is_currency,
        kpi_value: formData.kpi_value || null,
        targeted_date: formData.targeted_date || null,
        input_type: formData.input_type || null,
        milestone_goal: formData.milestone_goal || null,
        latest_actuals: formData.latest_actuals || null,
        calc_rag_type: formData.calc_rag_type || null,
        is_rag_override: formData.is_rag_override,
        updated_last_by: "current-user@example.com" // This would come from auth context
      });
      
      // 2. Create a new milestone status entry (would be implemented when the model exists)
      if (formData.status_date) {
        // This would be an API call in the future
        console.log("Creating new status entry:", {
          milestone_id: formData.id,
          status_date: formData.status_date,
          expected_kpi_value: formData.expected_kpi_value,
          latest_actuals: formData.latest_actuals,
          calc_rag_type: formData.calc_rag_type,
          is_rag_override: formData.is_rag_override,
          notes: formData.notes,
          updated_last_by: "current-user@example.com"
        });
        
        // 3. Update the UI to show the new entry
        const newStatusEntry: MilestoneStatusType = {
          id: Date.now().toString(), // Temporary ID
          status_date: formData.status_date || new Date().toLocaleDateString(),
          expected_kpi_value: formData.expected_kpi_value || null,
          latest_actuals: formData.latest_actuals || null,
          calc_rag_type: formData.calc_rag_type || null,
          notes: formData.notes || null,
          updated_last_by: "current-user@example.com",
          created_at: new Date().toISOString()
        };
        setMilestoneStatusHistory(prev => [newStatusEntry, ...prev]);
        
        // 4. Reset the status entry form fields but keep the milestone summary
        setFormData(prev => ({
          ...prev,
          status_date: null,
          expected_kpi_value: null,
          latest_actuals: null,
          calc_rag_type: null,
          is_rag_override: false,
          notes: null
        }));
      }
      
      navigate('/scamilestonelist', { state: { sca } });
    } catch (error) {
      console.error('Error updating milestone:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(prev => ({
      ...prev,
      milestone_type: item.milestone_type,
      milestone_description: item.milestone_description,
      is_tech: item.is_tech || false,
      is_currency: item.is_currency || false,
      kpi_value: item.kpi_value,
      targeted_date: item.targeted_date,
      input_type: item.input_type,
      milestone_goal: item.milestone_goal,
      latest_actuals: item.latest_actuals,
      calc_rag_type: item.calc_rag_type,
      is_rag_override: item.is_rag_override || false,
      updated_last_by: item.updated_last_by,
      scaId: item.scaId || sca.id,
      start_date: null
      // Preserve status entry fields
      // status_date: prev.status_date,
      // expected_kpi_value: prev.expected_kpi_value,
      // notes: prev.notes
    }));
    setFormErrors({});
    // Reset will clear changes
    setHasChanges(false);
  };

  const handleCancel = () => {
    navigate('/scamilestonelist', { state: { sca } });
  };

  return (
    <Form>
      <Container>
        <SpaceBetween size="xs">
          <Header>
            Update Milestone
          </Header>
  
          {/* Milestone Summary Section */}
          <Container
            header={
              <Header 
                variant="h2"
                actions={
                  <SpaceBetween direction="horizontal" size="xs">
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
                      onClick={handleSubmit} 
                      loading={isLoading}
                      disabled={!hasChanges}
                    >
                      Submit
                    </Button>
                  </SpaceBetween>
                }
              >
                Milestone Summary
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
                  value={formData.milestone_description || ''}
                  onChange={({ detail }) =>
                    setFormData(prev => ({ ...prev, milestone_description: detail.value || null }))
                  }
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
                  value={formData.milestone_goal || ''}
                  onChange={({ detail }) =>
                    setFormData(prev => ({ ...prev, milestone_goal: detail.value || null }))
                  }
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
        value={formData.milestone_type || ''}
        onChange={({ detail }) =>
          setFormData(prev => ({ ...prev, milestone_type: detail.value || null }))
        }
      />
    </FormField>

    <FormField
      label="Milestone KPI Target"
      errorText={formErrors.kpi_value}
    >
      <div style={{ width: '150px' }}>
        <Input
          value={formData.kpi_value || ''}
          onChange={({ detail }) =>
            setFormData(prev => ({ ...prev, kpi_value: detail.value || null }))
          }
        />
      </div>
    </FormField>

    <FormField
      label="Start Date"
      errorText={formErrors.start_date}
      constraintText="MM/DD/YY"
      description={
        formData.start_date && formData.targeted_date && 
        (() => {
          try {
            const startDate = new Date(formData.start_date);
            const dueDate = new Date(formData.targeted_date);
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
          value={formData.start_date || ''}
          placeholder="MM/DD/YY"
          onChange={({ detail }) => {
            setFormData(prev => ({ ...prev, start_date: detail.value || null }));
          }}
          onBlur={() => {
            if (formData.start_date) {
              const { isValid, formattedDate, errorMessage } = validateAndFormatDate(formData.start_date);
              if (isValid) {
                setFormData(prev => ({ ...prev, start_date: formattedDate }));
                setFormErrors(prev => ({ ...prev, start_date: undefined }));
              } else {
                setFormErrors(prev => ({ ...prev, start_date: errorMessage }));
              }
            }
          }}
        />
      </div>
    </FormField>

    <FormField
      label="Due Date"
      errorText={formErrors.targeted_date}
      description={
        formData.start_date && formData.targeted_date && 
        (() => {
          try {
            const startDate = new Date(formData.start_date);
            const dueDate = new Date(formData.targeted_date);
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
          value={formData.targeted_date || ''}
          placeholder="MM/DD/YY"
          onChange={({ detail }) => {
            setFormData(prev => ({ ...prev, targeted_date: detail.value || null }));
          }}
          onBlur={() => {
            if (formData.targeted_date) {
              const { isValid, formattedDate, errorMessage } = validateAndFormatDate(formData.targeted_date);
              if (isValid) {
                setFormData(prev => ({ ...prev, targeted_date: formattedDate }));
                setFormErrors(prev => ({ ...prev, targeted_date: undefined }));
              } else {
                setFormErrors(prev => ({ ...prev, targeted_date: errorMessage }));
              }
            }
          }}
        />
      </div>
    </FormField>

    <FormField label="Tech Milestone">
      <Checkbox
        checked={formData.is_tech}
        onChange={({ detail }) =>
          setFormData(prev => ({ ...prev, is_tech: detail.checked }))
        }
      >
        <TextContent>Technical Milestone</TextContent>
      </Checkbox>
    </FormField>

    <FormField label="Currency">
      <Checkbox
        checked={formData.is_currency}
        onChange={({ detail }) =>
          setFormData(prev => ({ ...prev, is_currency: detail.checked }))
        }
      >
        <TextContent>Currency Milestone</TextContent>
      </Checkbox>
    </FormField>
  </SpaceBetween>
  {/* Fourth Row - Input Type */}
</SpaceBetween>

          </Container>
  
          {/* Milestone Status History Table */}
          <Table
            columnDefinitions={[
              {
                id: "status_date",
                header: "Status Date",
                cell: (item: MilestoneStatusType) => formatDate(item.status_date),
                sortingField: "status_date"
              },
              {
                id: "expected_kpi_value",
                header: "Expected KPI Value",
                cell: (item: MilestoneStatusType) => item.expected_kpi_value
              },
              {
                id: "latest_actuals",
                header: "Actual Value",
                cell: (item: MilestoneStatusType) => item.latest_actuals
              },
              {
                id: "calc_rag_type",
                header: "RAG Status",
                cell: (item: MilestoneStatusType) => (
                  <StatusIndicator type={getRagStatusType(item.calc_rag_type)}>
                    {item.calc_rag_type}
                  </StatusIndicator>
                )
              },
              {
                id: "notes",
                header: "Notes",
                cell: (item: MilestoneStatusType) => item.notes
              },
              {
                id: "updated_last_by",
                header: "Updated By",
                cell: (item: MilestoneStatusType) => item.updated_last_by
              }
            ]}
            items={milestoneStatusHistory}
            loading={isLoadingHistory}
            loadingText="Loading milestone status history"
            empty={
              <Box textAlign="center" color="inherit">
                <b>No status updates</b>
                <Box padding={{ bottom: "s" }} variant="p" color="inherit">
                  No milestone status updates have been recorded yet.
                </Box>
              </Box>
            }
            header={
              <Header
                variant="h2"
                counter={`(${milestoneStatusHistory.length})`}
              >
                Milestone Status History
              </Header>
            }
            pagination={
              <Pagination
                currentPageIndex={currentPageIndex}
                pagesCount={Math.ceil(milestoneStatusHistory.length / pageSize)}
                onChange={({ detail }) => setCurrentPageIndex(detail.currentPageIndex)}
              />
            }
            sortingColumn={sortingColumn}
            sortingDescending={sortingDescending}
            onSortingChange={({ detail }) => {
              setSortingColumn(detail.sortingColumn as { id: string, sortingField: string });
              setSortingDescending(detail.isDescending ?? false);
            }}
          />
  
          {/* Enter New Milestone Status Entry Section */}
          {/* Enter New Milestone Status Entry Section */}
          <Container
            header={
              <Header 
                variant="h2"
                actions={
                  <Button 
                    variant="primary" 
                    onClick={handleSaveStatusUpdate}
                    disabled={!formData.expected_kpi_value || !formData.latest_actuals}
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
                    value={formData.status_date || ''}
                    placeholder="MM/DD/YY"
                    disabled={true}
                  />
                  <Box color="text-body-secondary" padding={{ top: "xxs" }} fontSize="body-s">
                    Today's date is automatically set
                  </Box>
                </FormField>

                <FormField label="Expected KPI Value for Status Date">
                  <Input
                    value={formData.expected_kpi_value || ''}
                    onChange={({ detail }) =>
                      setFormData(prev => ({ ...prev, expected_kpi_value: detail.value || null }))
                    }
                  />
                </FormField>

                <FormField label="Latest Actuals">
                  <Input
                    value={formData.latest_actuals || ''}
                    onChange={({ detail }) =>
                      setFormData(prev => ({ ...prev, latest_actuals: detail.value || null }))
                    }
                  />
                </FormField>

                <FormField label="RAG Status">
                  <Select
                    selectedOption={
                      ragTypeOptions.find(option => option.value === formData.calc_rag_type) 
                      || null
                    }
                    onChange={({ detail }) =>  
                      setFormData(prev => ({ 
                        ...prev, 
                        calc_rag_type: detail.selectedOption?.value || null 
                      }))
                    }
                    options={ragTypeOptions}
                  />
                </FormField>

                <FormField label="RAG Override">
                  <SpaceBetween direction="horizontal" size="xs" alignItems="center">
                    <Checkbox
                      checked={formData.is_rag_override}
                      onChange={({ detail }) =>
                        setFormData(prev => ({ ...prev, is_rag_override: detail.checked }))
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
                  formData.is_rag_override 
                    ? "Minimum 20 characters required" 
                    : "Minimum 10 characters required"
                }
              >
                <Textarea
                  value={formData.notes || ''}
                  onChange={({ detail }) =>
                    setFormData(prev => ({ ...prev, notes: detail.value || null }))
                  }
                  rows={3}
                />
              </FormField>
            </SpaceBetween>
          </Container>
        </SpaceBetween>
      </Container>
    </Form>
  );
  
  
}

export default MilestoneUpdateForm;