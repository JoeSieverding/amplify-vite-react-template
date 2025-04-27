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

// Reusable form field component
const FormInputField = ({ label, value, onChange, multiline = false, rows = 1 }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%', gap: '10px' }}>
    <div style={{ width: '100px', marginRight: '10px', textAlign: 'right', flexShrink: 0 }}>
      {label}:
    </div>
    <div style={{ flex: '1 1 auto' }}>
      <FormField stretch={true}>
        <Input
          value={value}
          onChange={({ detail }) => onChange(detail.value)}
          multiline={multiline}
          rows={rows}
        />
      </FormField>
    </div>
  </div>
);

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
      { name: 'start_date', label: 'Start date' },
      { name: 'end_date', label: 'End date' }
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
    { name: 'contract_comments', label: 'Comments', multiline: true, rows: 3 }
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
                    disabled={!isFormChanged}
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
                />
              ))}
            </SpaceBetween>
          </Container>
        </Container>
      </Form>
    </form>
  );
  
}