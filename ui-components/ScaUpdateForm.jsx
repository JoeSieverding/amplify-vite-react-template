/* eslint-disable */
import { useNavigate } from "react-router-dom";
"use client";
import * as React from "react";
import { serializeData } from '../src/utils/dataSerializer.ts';
import {
  Button, Form, SpaceBetween, Container, Header, FormField, Input, Grid
} from "@cloudscape-design/components";
import { generateClient } from "aws-amplify/api";
import { updateSca } from "./graphql/mutations";

const client = generateClient();
const styles = {
  emptyField: {
    backgroundColor: '#fff8e1',  // light yellow
    borderColor: '#ffd54f'       // darker yellow for border
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  
  try {
    // First try to parse the date if it's already in MM/DD/YY format
    if (validateDateFormat(dateString)) {
      return { value: dateString, error: false };
    }

    // Try to parse various date formats
    let date;
    
    // Handle common formats like YYYY-MM-DD, MM-DD-YYYY, etc.
    if (dateString.includes('-') || dateString.includes('/')) {
      date = new Date(dateString);
    } 
    // Handle ISO format
    else if (dateString.includes('T')) {
      date = new Date(dateString);
    }
    // Try parsing as-is
    else {
      date = new Date(dateString);
    }

    // Check if we got a valid date
    if (isNaN(date.getTime())) {
      return { value: dateString, error: true };
    }
    
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    
    return { value: `${month}/${day}/${year}`, error: false };
  } catch {
    return { value: dateString, error: true };
  }
};

const validateDateFormat = (dateString) => {
  if (!dateString) return true;
  
  // Check for MM/DD/YY format
  const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  // Validate the date is real
  const [month, day, year] = dateString.split('/').map(num => parseInt(num, 10));
  const date = new Date(2000 + year, month - 1, day);
  return date.getMonth() === month - 1 && date.getDate() === day;
};

const validateAllDates = (formData) => {
  const dateFields = ['start_date', 'end_date'];
  const invalidDates = dateFields
    .filter(field => formData[field]) // Only check non-empty dates
    .filter(field => !validateDateFormat(formData[field]));
  
  return invalidDates.length === 0;
};

const validateDateOrder = (startDate, endDate) => {
  if (!startDate || !endDate) return true; // Skip validation if either date is empty
  
  // Convert MM/DD/YY to Date objects
  const [startMonth, startDay, startYear] = startDate.split('/').map(num => parseInt(num, 10));
  const [endMonth, endDay, endYear] = endDate.split('/').map(num => parseInt(num, 10));
  
  const startDateObj = new Date(2000 + startYear, startMonth - 1, startDay);
  const endDateObj = new Date(2000 + endYear, endMonth - 1, endDay);
  
  return endDateObj >= startDateObj;
};

const FormInputField = ({ 
  label, 
  value, 
  onChange, 
  multiline = false, 
  rows = 1, 
  required = true, 
  isDate = false, 
  name,
  formState 
}) => {
  const [isUserModified, setIsUserModified] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const [localValue, setLocalValue] = React.useState(value);

  // Update localValue when prop value changes
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Handle date formatting for initial load
  React.useEffect(() => {
    if (isDate && value && !isUserModified) {
      const formattedDate = formatDate(value);
      if (!formattedDate.error) {
        onChange(formattedDate.value);
      }
    }
  }, []);

  const handleDateChange = (newValue) => {
    if (!isDate) {
      onChange(newValue);
      return;
    }

    setLocalValue(newValue);
    if (!isFocused) {
      setIsUserModified(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    setIsUserModified(true);
    
    if (isDate && localValue) {
      const formattedDate = formatDate(localValue);
      if (!formattedDate.error) {
        onChange(formattedDate.value);
      } else {
        onChange(localValue);
      }
    }
  };

  // Determine field status and messages
  const getFieldStatus = () => {
    const isEmpty = !localValue;
    
    let status = undefined;
    let constraintText = "";

    if (isEmpty) {
      if (required) {
        status = "error";
        constraintText = "This field is required";
      } else {
        status = "warning";
        constraintText = "This field is missing";
      }
    } else if (isDate && !isFocused && !validateDateFormat(localValue)) {
      if (isUserModified) {
        status = "error";
        constraintText = "Please enter date in MM/DD/YY format";
      } else {
        status = "warning";
        constraintText = "Change to MM/DD/YY format";
      }
    } else if (name === 'end_date' && !isFocused && validateDateFormat(localValue)) {
      // Only check date order if:
      // 1. Both dates are valid
      // 2. Current field (end_date) has been modified by user
      const startDate = formState.start_date;
      if (startDate && 
          validateDateFormat(startDate) && 
          validateDateFormat(localValue) && 
          isUserModified && 
          !validateDateOrder(startDate, localValue)) {
        status = "error";
        constraintText = "End date must be after the start date";
      }
    }

    return { status, constraintText };
  };

  const { status, constraintText } = getFieldStatus();

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%', gap: '10px' }}>
      <div style={{ width: '100px', marginRight: '10px', textAlign: 'right', flexShrink: 0 }}>
        {label}{required && <span style={{ color: '#d32f2f' }}>*</span>}:
      </div>
      <div style={{ flex: '1 1 auto' }}>
        <FormField 
          stretch={true}
          constraintText={!isFocused ? constraintText : ""}
        >
          <Input
            value={localValue || ""}
            onChange={({ detail }) => handleDateChange(detail.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            multiline={multiline}
            rows={rows}
            invalid={!isFocused && status === "error"}
            status={!isFocused ? status : undefined}
            placeholder={isDate ? "MM/DD/YY" : undefined}
          />
        </FormField>
      </div>
    </div>
  );
};

// Form fields configuration
const FORM_FIELDS = {
  summary: {
    topRow: [
      { name: 'partner', label: 'Partner' },
      { name: 'contract_name', label: 'Contract name' }
    ],
    bottomRow: [
      { name: 'contract_type', label: 'Contract type' },
      { name: 'contract_status', label: 'Contract status' },
      { name: 'start_date', label: 'Start date', isDate: true },
      { name: 'end_date', label: 'End date', isDate: true }
    ]
  },
  industry: [
    { name: 'contract_primary_industry', label: 'Industry' },
    { name: 'contract_theme', label: 'Theme' }
  ],
  details: [
    { name: 'contract_description', label: 'Description', multiline: true, rows: 5 },
    { name: 'contract_aws_contributions', label: 'AWS contributions', multiline: true, rows: 3 },
    { name: 'contract_partner_contributions', label: 'Partner contributions', multiline: true, rows: 3 },
    { name: 'contract_time_based_targets', label: 'Time based targets', multiline: true, rows: 3 },
    { name: 'contract_comments', label: 'Comments', multiline: true, rows: 3, required: false  }
  ]
};

export default function ScaUpdateForm({ sca }) {
  const navigate = useNavigate();
  const [localSca, setLocalSca] = React.useState(sca);
  const [milestones, setMilestones] = React.useState([]);
  const [isFormChanged, setIsFormChanged] = React.useState(false);

  // Combined form state
  const [formState, setFormState] = React.useState({
    partner: sca?.partner || "",
    start_date: sca?.start_date || "",
    end_date: sca?.end_date || "",
    contract_name: sca?.contract_name || "",
    contract_description: sca?.contract_description || "",
    contract_type: sca?.contract_type || "",
    contract_status: sca?.contract_status || "",
    contract_comments: sca?.contract_comments || "",
    contract_aws_contributions: sca?.contract_aws_contributions || "",
    contract_partner_contributions: sca?.contract_partner_contributions || "",
    contract_time_based_targets: sca?.contract_time_based_targets || "",
    contract_primary_industry: sca?.contract_primary_industry || "",
    contract_overall_status: sca?.contract_overall_status || "",
    contract_theme: sca?.contract_theme || ""
  });

  const updateField = (field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }));
    setIsFormChanged(true);
  };

  const resetStateValues = () => {
    if (localSca) {
      setFormState({
        partner: localSca.partner || "",
        start_date: localSca.start_date || "",
        end_date: localSca.end_date || "",
        contract_name: localSca.contract_name || "",
        contract_description: localSca.contract_description || "",
        contract_type: localSca.contract_type || "",
        contract_status: localSca.contract_status || "",
        contract_comments: localSca.contract_comments || "",
        contract_aws_contributions: localSca.contract_aws_contributions || "",
        contract_partner_contributions: localSca.contract_partner_contributions || "",
        contract_time_based_targets: localSca.contract_time_based_targets || "",
        contract_primary_industry: localSca.contract_primary_industry || "",
        contract_overall_status: localSca.contract_overall_status || "",
        contract_theme: localSca.contract_theme || ""
      });
      setIsFormChanged(false);
    }
  };

  async function handleSubmit(event) {
    event.preventDefault();
  
    // Check for invalid dates before saving
    if (!validateAllDates(formState)) {
      return;
    }
  
    // Only check date order if both dates are valid
    if (validateDateFormat(formState.start_date) && 
        validateDateFormat(formState.end_date) && 
        !validateDateOrder(formState.start_date, formState.end_date)) {
      return;
    }
  
    try {
      await client.graphql({
        query: updateSca,
        variables: {
          input: {
            id: localSca.id,
            ...formState
          }
        }
      });
  
      const updatedSca = {
        ...localSca,
        ...formState
      };
      setLocalSca(updatedSca);
      setIsFormChanged(false);
    } catch (err) {
      console.error('Error updating SCA:', err);
    }
  }
  

  React.useEffect(() => {
    if (sca) {
      setLocalSca(sca);
      setFormState({
        partner: sca.partner || "",
        start_date: sca.start_date || "",
        end_date: sca.end_date || "",
        contract_name: sca.contract_name || "",
        contract_description: sca.contract_description || "",
        contract_type: sca.contract_type || "",
        contract_status: sca.contract_status || "",
        contract_comments: sca.contract_comments || "",
        contract_aws_contributions: sca.contract_aws_contributions || "",
        contract_partner_contributions: sca.contract_partner_contributions || "",
        contract_time_based_targets: sca.contract_time_based_targets || "",
        contract_primary_industry: sca.contract_primary_industry || "",
        contract_overall_status: sca.contract_overall_status || "",
        contract_theme: sca.contract_theme || ""
      });
      setIsFormChanged(false);
    }
  }, [sca]);

  if (!sca) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit}>
      <Form>
        <Container
          header={
            <Header 
              variant="h2"
              info={
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!localSca) {
                      console.log('localSca is null');
                      return;
                    }
                    navigate('/scamilestonelist', { 
                      state: serializeData({ 
                        sca: localSca,
                        milestones: milestones
                      })
                    });
                  }}
                  variant="normal"
                >
                  View Milestones
                </Button>
              }
              actions={
                <SpaceBetween direction="horizontal" size="XS">
                  <Button
                    variation="secondary"
                    onClick={resetStateValues}
                    disabled={!isFormChanged}
                  >
                    Reset
                  </Button>
                  <Button
                    variation="secondary"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variation="primary"
                    disabled={
                      !isFormChanged || 
                      !validateAllDates(formState) || 
                      (validateAllDates(formState) && !validateDateOrder(formState.start_date, formState.end_date))
                    }
                  >
                    Save
                  </Button>
                </SpaceBetween>
              }
            >
              {localSca?.partner && localSca?.contract_name 
                ? `${localSca.partner} - ${localSca.contract_name}`
                : 'SCA Detail'}
            </Header>
          }
        >
          {/* SCA Summary Section */}
          <Container
            header={
              <Header variant="h4">SCA Summary</Header>
            }
          >
            <SpaceBetween direction="vertical" size="l">
              {/* Top row with two wide inputs */}
              <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
              {FORM_FIELDS.summary.topRow.map((field) => (
                <FormInputField
                  key={field.name}
                  label={field.label}
                  value={formState[field.name]}
                  onChange={(value) => updateField(field.name, value)}
                  multiline={field.multiline}
                  rows={field.rows}
                  required={field.required !== false}
                  isDate={field.isDate}
                  name={field.name}
                  formState={formState}
                />
              ))}
              </Grid>
  
              {/* Bottom row with four smaller inputs */}
              <Grid gridDefinition={[{ colspan: 3 }, { colspan: 3 }, { colspan: 3 }, { colspan: 3 }]}>
                {FORM_FIELDS.summary.bottomRow.map((field) => (
                  <FormInputField
                    key={field.name}
                    label={field.label}
                    value={formState[field.name]}
                    onChange={(value) => updateField(field.name, value)}
                    isDate={field.isDate}
                    name={field.name}
                    formState={formState}
                  />
                ))}
              </Grid>
            </SpaceBetween>
          </Container>
  
          {/* Industry Section */}
          <Container
            header={
              <Header variant="h4">Industry & Theme</Header>
            }
          >
            <SpaceBetween direction="vertical" size="l">
              <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
                {FORM_FIELDS.industry.map((field) => (
                  <FormInputField
                    key={field.name}
                    label={field.label}
                    value={formState[field.name]}
                    onChange={(value) => updateField(field.name, value)}
                    name={field.name}
                    formState={formState}
                  />
                ))}
              </Grid>
            </SpaceBetween>
          </Container>
  
          {/* Details Section */}
          <Container
            header={
              <Header variant="h4">Details</Header>
            }
          >
            <SpaceBetween direction="vertical" size="l">
              {FORM_FIELDS.details.map((field) => (
                <FormInputField
                  key={field.name}
                  label={field.label}
                  value={formState[field.name]}
                  onChange={(value) => updateField(field.name, value)}
                  multiline={field.multiline}
                  rows={field.rows}
                  required={field.required !== false}
                  name={field.name}
                  formState={formState}
                />
              ))}
            </SpaceBetween>
          </Container>
        </Container>
      </Form>
    </form>
  );
  
}