import { useCallback, useState } from "react";
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
  DatePicker,
  Checkbox,
  TextContent,
  Select
} from "@cloudscape-design/components";

const client = generateClient<Schema>();

// Add these interfaces at the top
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
}

interface FormError {
  milestone_type?: string;
  milestone_description?: string;
  kpi_value?: string;
  targeted_date?: string;
  input_type?: string;
  milestone_goal?: string;
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
    updated_last_by: item.updated_last_by ?? null
  });

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
      updated_last_by: item.updated_last_by ?? null
    });
    setFormErrors({});
  }, [item]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const updateData = {
        id: formData.id,
        scaId: formData.scaId,
        milestone_type: formData.milestone_type ?? '',
        milestone_description: formData.milestone_description ?? '',
        is_tech: formData.is_tech,
        is_currency: formData.is_currency,
        kpi_value: formData.kpi_value ?? '',
        targeted_date: formData.targeted_date,  // Use the date string directly
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
    <Form
      header={
        <Header
          variant="h1"
          description={sca ? `Update milestone information for ${sca.partner} - ${sca.contract_name}` : ''}
        >
          Update Milestone
        </Header>
      }
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
      <Container>
        <SpaceBetween direction="vertical" size="l">
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
            label="Description"
            errorText={formErrors.milestone_description}
          >
            <Input
              value={formData.milestone_description || ''}
              onChange={({ detail }) =>
                setFormData(prev => ({ ...prev, milestone_description: detail.value || null }))
              }
            />
          </FormField>

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
            label="Target Date"
            errorText={formErrors.targeted_date}
          >
            <DatePicker
              value={formData.targeted_date || ''}
              onChange={({ detail }) => {
                if (!detail.value) {
                  setFormData(prev => ({ ...prev, targeted_date: null }));
                  return;
                }
                
                // Only update if it's a valid date format
                if (isValidDate(detail.value)) {
                  setFormData(prev => ({ 
                    ...prev, 
                    targeted_date: detail.value 
                  }));
                }
              }}
              placeholder="MM/DD/YY"
              openCalendarAriaLabel={selectedDate =>
                "Choose target date" +
                (selectedDate ? `, selected date is ${selectedDate}` : "")
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

          <SpaceBetween direction="horizontal" size="xl">
            <FormField label="Technical Milestone">
              <Checkbox
                checked={formData.is_tech}
                onChange={({ detail }) =>
                  setFormData(prev => ({ ...prev, is_tech: detail.checked }))
                }
              >
                <TextContent>Is this a technical milestone?</TextContent>
              </Checkbox>
            </FormField>

            <FormField label="Currency">
              <Checkbox
                checked={formData.is_currency}
                onChange={({ detail }) =>
                  setFormData(prev => ({ ...prev, is_currency: detail.checked }))
                }
              >
                <TextContent>Is this a currency milestone?</TextContent>
              </Checkbox>
            </FormField>

            <FormField label="RAG Override">
              <Checkbox
                checked={formData.is_rag_override}
                onChange={({ detail }) =>
                  setFormData(prev => ({ ...prev, is_rag_override: detail.checked }))
                }
              >
                <TextContent>Override RAG status?</TextContent>
              </Checkbox>
            </FormField>
          </SpaceBetween>
        </SpaceBetween>
      </Container>
    </Form>
  );
}

export default MilestoneUpdateForm;
