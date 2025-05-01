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
  Textarea
} from "@cloudscape-design/components";

const client = generateClient<Schema>();

interface LocationState {
  item: Schema["Milestone"]["type"];
  sca: Schema["Sca"]["type"];
}

interface FormData {
  id: string;                            // Required
  milestone_type: string | null;
  milestone_description: string | null;
  is_tech: boolean;                      // Required with default false
  is_currency: boolean;                  // Required with default false
  kpi_value: string | null;
  targeted_date: string | null;
  input_type: string | null;
  milestone_goal: string | null;
  latest_actuals: string | null;
  calc_rag_type: string | null;
  is_rag_override: boolean;              // Required with default false
  updated_last_by: string | null;
  scaId: string;                         // Required
  // New fields (not in database)
  start_date?: string | null;
  status_date?: string | null;
  expected_kpi_value?: string | null;
  notes?: string | null;
}

interface FormError {
  milestone_type?: string;
  milestone_description?: string;
  kpi_value?: string;
  targeted_date?: string;
  input_type?: string;
  milestone_goal?: string;
  start_date?: string;
  status_date?: string;
}

interface SelectOption {
  label: string;
  value: string;
}

const isValidDate = (dateString: string): boolean => {
  // Check if the date string matches MM/DD/YY format
  const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[1])\/\d{2}$/;
  if (!regex.test(dateString)) return false;

  const [month, day, year] = dateString.split('/').map(Number);
  const fullYear = 2000 + year;
  const date = new Date(fullYear, month - 1, day);

  return date.getDate() === day &&
         date.getMonth() === month - 1 &&
         date.getFullYear() === fullYear;
};

const inputTypeOptions: SelectOption[] = [
  { label: "Numeric", value: "numeric" },
  { label: "Text", value: "text" },
  { label: "Date", value: "date" },
  { label: "Currency", value: "currency" }
];

const ragTypeOptions: SelectOption[] = [
  { label: "Red", value: "red" },
  { label: "Amber", value: "amber" },
  { label: "Green", value: "green" }
];

function MilestoneUpdateForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { item, sca } = location.state as LocationState;
  const [formErrors, setFormErrors] = useState<FormError>({});
  const [showRagNote, setShowRagNote] = useState(false);

  // Initialize form with data from the milestone
  const [formData, setFormData] = useState<FormData>({
    id: item.id,
    scaId: item.scaId ?? '',
    milestone_type: item.milestone_type ?? null,
    milestone_description: item.milestone_description ?? null,
    is_tech: item.is_tech || false,
    is_currency: item.is_currency || false,
    kpi_value: item.kpi_value ?? null,
    targeted_date: item.targeted_date ?? null,
    input_type: item.input_type ?? null,
    milestone_goal: item.milestone_goal ?? null,
    latest_actuals: item.latest_actuals ?? null,
    calc_rag_type: item.calc_rag_type ?? null,
    is_rag_override: item.is_rag_override || false,
    updated_last_by: item.updated_last_by ?? null,
    // Initialize new fields
    start_date: null,
    status_date: null,
    expected_kpi_value: null,
    notes: null
  });

  // Check if RAG override should be selected based on conditions
  useEffect(() => {
    const latestActuals = parseFloat(formData.latest_actuals || '0');
    const expectedKpi = parseFloat(formData.expected_kpi_value || '0');
    
    if (
      !isNaN(latestActuals) && 
      !isNaN(expectedKpi) && 
      latestActuals < expectedKpi && 
      formData.calc_rag_type !== 'red'
    ) {
      setFormData(prev => ({ ...prev, is_rag_override: true }));
      setShowRagNote(true);
    } else {
      setShowRagNote(false);
    }
  }, [formData.latest_actuals, formData.expected_kpi_value, formData.calc_rag_type]);

  // Form validation
  const validateForm = useCallback(() => {
    const errors: FormError = {};
    let isValid = true;

    if (!formData.milestone_type) {
      errors.milestone_type = "Milestone type is required";
      isValid = false;
    }

    if (!formData.milestone_description) {
      errors.milestone_description = "Milestone description is required";
      isValid = false;
    }

    if (!formData.milestone_goal) {
      errors.milestone_goal = "Milestone goal is required";
      isValid = false;
    }

    if (formData.targeted_date) {
      if (!isValidDate(formData.targeted_date)) {
        errors.targeted_date = "Invalid date format. Use MM/DD/YY";
        isValid = false;
      }
    } else {
      errors.targeted_date = "Target date is required";
      isValid = false;
    }

    if (formData.start_date && !isValidDate(formData.start_date)) {
      errors.start_date = "Invalid date format. Use MM/DD/YY";
      isValid = false;
    }

    if (formData.status_date && !isValidDate(formData.status_date)) {
      errors.status_date = "Invalid date format. Use MM/DD/YY";
      isValid = false;
    }

    if (!formData.input_type) {
      errors.input_type = "Input type is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  }, [formData]);

  // Handle form reset
  const handleReset = useCallback(() => {
    setFormData({
      id: item.id ?? '',
      scaId: item.scaId ?? '',
      milestone_type: item.milestone_type ?? null,
      milestone_description: item.milestone_description ?? null,
      is_tech: item.is_tech || false,
      is_currency: item.is_currency || false,
      kpi_value: item.kpi_value ?? null,
      targeted_date: item.targeted_date ?? null,
      input_type: item.input_type ?? null,
      milestone_goal: item.milestone_goal ?? null,
      latest_actuals: item.latest_actuals ?? null,
      calc_rag_type: item.calc_rag_type ?? null,
      is_rag_override: item.is_rag_override || false,
      updated_last_by: item.updated_last_by ?? null,
      // Reset new fields
      start_date: null,
      status_date: null,
      expected_kpi_value: null,
      notes: null
    });
    setFormErrors({});
    setShowRagNote(false);
  }, [item]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Only include fields that are in the database schema
      const updateData = {
        id: formData.id,
        scaId: formData.scaId,
        milestone_type: formData.milestone_type ?? '',
        milestone_description: formData.milestone_description ?? '',
        is_tech: formData.is_tech,
        is_currency: formData.is_currency,
        kpi_value: formData.kpi_value ?? '',
        targeted_date: formData.targeted_date,
        input_type: formData.input_type ?? '',
        milestone_goal: formData.milestone_goal ?? '',
        latest_actuals: formData.latest_actuals ?? '',
        calc_rag_type: formData.calc_rag_type ?? '',
        is_rag_override: formData.is_rag_override,
        updated_last_by: "current_user" // Replace with actual user info
      };

      await client.models.Milestone.update(updateData);
      navigate(-1);
    } catch (error) {
      console.error('Error updating milestone:', error);
      setIsLoading(false);
    }
  };

  // Handle form cancellation
  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <Form>
      <Container>
        <SpaceBetween direction="vertical" size="l">
          <Header
            variant="h1"
            description={sca ? `Update milestone information for ${sca.partner} - ${sca.contract_name}` : ''}
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={handleReset}>Reset</Button>
                <Button variant="link" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSubmit} loading={isLoading}>
                  Submit
                </Button>
              </SpaceBetween>
            }
          >
            Update Milestone
          </Header>

          {/* Milestone Summary Section */}
          <Container
            header={
              <Header variant="h2">Milestone Summary</Header>
            }
          >
            <SpaceBetween direction="vertical" size="l">
              {/* First Row */}
              <SpaceBetween direction="horizontal" size="l">
                <FormField
                  label="Description"
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
                  label="Start Date"
                  errorText={formErrors.start_date}
                >
                  <Input
                    value={formData.start_date || ''}
                    placeholder="MM/DD/YY"
                    onChange={({ detail }) =>
                      setFormData(prev => ({ ...prev, start_date: detail.value || null }))
                    }
                  />
                </FormField>

                <FormField
                  label="Target Date"
                  errorText={formErrors.targeted_date}
                >
                  <Input
                    value={formData.targeted_date || ''}
                    placeholder="MM/DD/YY"
                    onChange={({ detail }) => {
                      const newValue = detail.value;
                      setFormData(prev => ({ ...prev, targeted_date: newValue || null }));
                    }}
                  />
                </FormField>
              </SpaceBetween>

              {/* Second Row */}
              <FormField
                label="Goal"
                errorText={formErrors.milestone_goal}
              >
                <Input
                  value={formData.milestone_goal || ''}
                  onChange={({ detail }) =>
                    setFormData(prev => ({ ...prev, milestone_goal: detail.value || null }))
                  }
                />
              </FormField>

              {/* Third Row */}
              <SpaceBetween direction="horizontal" size="l">
                <FormField
                  label="Input Type"
                  errorText={formErrors.input_type}
                >
                  <Select
                    selectedOption={
                      inputTypeOptions.find(option => option.value === formData.input_type) 
                      || null
                    }
                    onChange={({ detail }) =>
                      setFormData(prev => ({ 
                        ...prev, 
                        input_type: detail.selectedOption?.value || '' 
                      }))
                    }
                    options={inputTypeOptions}
                  />
                </FormField>

                <FormField
                  label="KPI Value"
                  errorText={formErrors.kpi_value}
                >
                  <Input
                    value={formData.kpi_value || ''}
                    onChange={({ detail }) =>
                      setFormData(prev => ({ ...prev, kpi_value: detail.value || null }))
                    }
                  />
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
            </SpaceBetween>
          </Container>

          {/* Milestone Performance Section - renamed to "Enter New Milestone Status Entry" */}
          <Container
            header={
              <Header variant="h2">Enter New Milestone Status Entry</Header>
            }
          >
            <SpaceBetween direction="vertical" size="l">
              {/* First Row */}
              <SpaceBetween direction="horizontal" size="l">
                <FormField
                  label="Status Date"
                  errorText={formErrors.status_date}
                >
                  <Input
                    value={formData.status_date || ''}
                    placeholder="MM/DD/YY"
                    onChange={({ detail }) => {
                      const newValue = detail.value;
                      setFormData(prev => ({ ...prev, status_date: newValue || null }));
                    }}
                  />
                </FormField>

                <FormField
                  label="Expected KPI Value for Status Date"
                >
                  <Input
                    value={formData.expected_kpi_value || ''}
                    onChange={({ detail }) =>
                      setFormData(prev => ({ ...prev, expected_kpi_value: detail.value || null }))
                    }
                  />
                </FormField>

                <FormField
                  label="Latest Actuals"
                >
                  <Input
                    value={formData.latest_actuals || ''}
                    onChange={({ detail }) =>
                      setFormData(prev => ({ ...prev, latest_actuals: detail.value || null }))
                    }
                  />
                </FormField>

                <FormField
                  label="RAG Status"
                >
                  <Select
                    selectedOption={
                      ragTypeOptions.find(option => option.value === formData.calc_rag_type) 
                      || null
                    }
                    onChange={({ detail }) =>  
                      setFormData(prev => ({ 
                        ...prev, 
                        calc_rag_type: detail.selectedOption?.value || '' 
                      }))
                    }
                    options={ragTypeOptions}
                  />
                </FormField>

                <FormField label="RAG Override">
                  <Checkbox
                    checked={formData.is_rag_override}
                    onChange={({ detail }) =>
                      setFormData(prev => ({ ...prev, is_rag_override: detail.checked }))
                    }
                    disabled={true}
                  >
                    <TextContent>Override RAG Status</TextContent>
                  </Checkbox>
                </FormField>
              </SpaceBetween>

              {/* Show note if RAG override is triggered */}
              {showRagNote && (
                <Box color="text-status-warning">
                  Explain why RAG status is not Red in notes below
                </Box>
              )}

              {/* Second Row - Notes field */}
              <FormField
                label="Notes"
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