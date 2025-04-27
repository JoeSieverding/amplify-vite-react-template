/* eslint-disable */
import { useNavigate } from "react-router-dom";
"use client";
import * as React from "react";
import { serializeData } from '../src/utils/dataSerializer.ts';
import {
  Button, Form, SpaceBetween, Container, Header, FormField, Input, Grid
} from "@cloudscape-design/components";
import { fetchByPath, validateField } from "./utils";
import { generateClient } from "aws-amplify/api";
import { getSca } from "./graphql/queries";
import { updateSca } from "./graphql/mutations";

const client = generateClient();

export default function ScaUpdateForm({ sca }) {
  const navigate = useNavigate();
  const [localSca, setLocalSca] = React.useState(sca); // Define this first
  const [milestones, setMilestones] = React.useState([]);
  const [isFormChanged, setIsFormChanged] = React.useState(false);
  const [errors, setErrors] = React.useState({});

  // State declarations for form fields
  const [partner, setPartner] = React.useState(sca?.partner || "");
  const [start_date, setStart_date] = React.useState(sca?.start_date || "");
  const [end_date, setEnd_date] = React.useState(sca?.end_date || "");
  const [contract_name, setContract_name] = React.useState(sca?.contract_name || "");
  const [contract_description, setContract_description] = React.useState(sca?.contract_description || "");
  const [contract_type, setContract_type] = React.useState(sca?.contract_type || "");
  const [contract_status, setContract_status] = React.useState(sca?.contract_status || "");
  const [contract_comments, setContract_comments] = React.useState(sca?.contract_comments || "");
  const [contract_aws_contributions, setContract_aws_contributions] = React.useState(sca?.contract_aws_contributions || "");
  const [contract_partner_contributions, setContract_partner_contributions] = React.useState(sca?.contract_partner_contributions || "");
  const [contract_time_based_targets, setContract_time_based_targets] = React.useState(sca?.contract_time_based_targets || "");
  const [contract_primary_industry, setContract_primary_industry] = React.useState(sca?.contract_primary_industry || "");
  const [contract_overall_status, setContract_overall_status] = React.useState(sca?.contract_overall_status || "");
  const [contract_theme, setContract_theme] = React.useState(sca?.contract_theme || "");

  const resetStateValues = () => {
    if (localSca) {
      setPartner(localSca.partner || "");
      setStart_date(localSca.start_date || "");
      setEnd_date(localSca.end_date || "");
      setContract_name(localSca.contract_name || "");
      setContract_description(localSca.contract_description || "");
      setContract_type(localSca.contract_type || "");
      setContract_status(localSca.contract_status || "");
      setContract_comments(localSca.contract_comments || "");
      setContract_aws_contributions(localSca.contract_aws_contributions || "");
      setContract_partner_contributions(localSca.contract_partner_contributions || "");
      setContract_time_based_targets(localSca.contract_time_based_targets || "");
      setContract_primary_industry(localSca.contract_primary_industry || "");
      setContract_overall_status(localSca.contract_overall_status || "");
      setContract_theme(localSca.contract_theme || "");
      setIsFormChanged(false);
      setErrors({});
    }
  };

  async function handleSubmit(event) {
    event.preventDefault();
    
    const modelFields = {
      partner,
      contract_name,
      contract_type,
      contract_status,
      start_date,
      end_date,
      contract_primary_industry,
      contract_theme,
      contract_description,
      contract_aws_contributions,
      contract_partner_contributions,
      contract_time_based_targets,
      contract_comments,
      contract_overall_status
    };

    try {
      const result = await client.graphql({
        query: updateSca,
        variables: {
          input: {
            id: localSca.id,
            ...modelFields
          }
        }
      });

      // Update local state with the values we just saved
      const updatedSca = {
        ...localSca,
        ...modelFields
      };
      setLocalSca(updatedSca);
      setIsFormChanged(false);
    } catch (err) {
      console.error('Error updating SCA:', err);
    }
  }

  // Update useEffect to use sca
  React.useEffect(() => {
    if (sca) {
      setLocalSca(sca);
      setPartner(sca.partner || "");
      setStart_date(sca.start_date || "");
      setEnd_date(sca.end_date || "");
      setContract_name(sca.contract_name || "");
      setContract_description(sca.contract_description || "");
      setContract_type(sca.contract_type || "");
      setContract_status(sca.contract_status || "");
      setContract_comments(sca.contract_comments || "");
      setContract_aws_contributions(sca.contract_aws_contributions || "");
      setContract_partner_contributions(sca.contract_partner_contributions || "");
      setContract_time_based_targets(sca.contract_time_based_targets || "");
      setContract_primary_industry(sca.contract_primary_industry || "");
      setContract_overall_status(sca.contract_overall_status || "");
      setContract_theme(sca.contract_theme || "");
      setIsFormChanged(false);
    }
  }, [sca]);

  // If no SCA data, return null
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
              console.log('scaRecord is null');
              return;
            }
            //console.log('Navigating with scaRecord:', scaRecord);
            //console.log('Current milestones:', milestones);
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
                onClick={(event) => {
                    event.preventDefault();
                    resetStateValues();
                }}
                disabled={!isFormChanged}  // This disables the Reset button until changes are made
            >
                Reset
            </Button>
            <Button
                variation="secondary"
                onClick={(event) => {
                    event.preventDefault();
                    navigate(-1);
                }}
            >
                Cancel
            </Button>
            <Button
                type="submit"
                variation="primary"
                disabled={!isFormChanged}  // This disables the Save button until changes are made
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

<Container
  header={
    <Header
      variant="h4"
      counter={null}
      info={null}
    >
      SCA Summary
    </Header>
  }
>
  <SpaceBetween direction="vertical" size="l">
    {/* First Row: Partner and Contract Name */}
    <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '100px', marginRight: '10px', textAlign: 'right' }}>
          Partner:
        </div>
        <FormField
          controlId="partner-field"
          stretch={true}
        >
          <Input
            value={partner}
            onChange={({ detail }) => {
              setPartner(detail.value); 
              setIsFormChanged(true);
            }}
            onBlur={() => runValidationTasks("partner", partner)}
            disabled={false}
            readOnly={false}
            errorMessage={errors.partner?.errorMessage}
            hasError={errors.partner?.hasError}
          />
        </FormField>
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '100px', marginRight: '10px', textAlign: 'right' }}>
          Contract name:
        </div>
        <FormField
          controlId="contract-name-field"
          stretch={true}
        >
          <Input
            value={contract_name}
            onChange={({ detail }) => {
              setContract_name(detail.value);
              setIsFormChanged(true);
            }}
            onBlur={() => runValidationTasks("contract_name", contract_name)}
            disabled={false}
            readOnly={false}
            errorMessage={errors.contract_name?.errorMessage}
            hasError={errors.contract_name?.hasError}
          />
        </FormField>
      </div>
    </Grid>



    {/* Second Row: Type and Start Date */}
    <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '100px', marginRight: '10px', textAlign: 'right' }}>
          Contract type:
        </div>
        <FormField
          controlId="contract-type-field"
          stretch={true}
        >
          <Input
            value={contract_type}
            onChange={({ detail }) => {
              setIsFormChanged(true);
              setContract_type(detail.value);
            }}
            onBlur={() => runValidationTasks("contract_type", contract_type)}
            disabled={false}
            readOnly={false}
            errorMessage={errors.contract_type?.errorMessage}
            hasError={errors.contract_type?.hasError}
          />
        </FormField>
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '100px', marginRight: '10px', textAlign: 'right' }}>
          Start date:
        </div>
        <FormField
          controlId="start-date-field"
          stretch={true}
        >
          <Input
            value={start_date}
            onChange={({ detail }) => {
              setIsFormChanged(true);
              setStart_date(detail.value);
            }}
            onBlur={() => runValidationTasks("start_date", start_date)}
            disabled={false}
            readOnly={false}
            errorMessage={errors.start_date?.errorMessage}
            hasError={errors.start_date?.hasError}
          />
        </FormField>
      </div>
    </Grid>

    {/* Third Row: Status and End Date */}
    <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '100px', marginRight: '10px', textAlign: 'right' }}>
          Contract status:
        </div>
        <FormField
          controlId="contract-status-field"
          stretch={true}
        >
          <Input
            value={contract_status}
            onChange={({ detail }) => {
              setContract_status(detail.value);
              setIsFormChanged(true);
            }}
            onBlur={() => runValidationTasks("contract_status", contract_status)}
            disabled={false}
            readOnly={false}
            errorMessage={errors.contract_status?.errorMessage}
            hasError={errors.contract_status?.hasError}
          />
        </FormField>
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '100px', marginRight: '10px', textAlign: 'right' }}>
          End date:
        </div>
        <FormField
          controlId="end-date-field"
          stretch={true}
        >
          <Input
            value={end_date}
            onChange={({ detail }) => {
              setEnd_date(detail.value);
              setIsFormChanged(true);
            }}
            onBlur={() => runValidationTasks("end_date", end_date)}
            disabled={false}
            readOnly={false}
            errorMessage={errors.end_date?.errorMessage}
            hasError={errors.end_date?.hasError}
          />
        </FormField>
      </div>
    </Grid>
  </SpaceBetween>
</Container>

<Container
  header={
    <Header
      variant="h4"
      counter={null}
      info={null}
    >
      SCA Industry & Theme
    </Header>
  }
>
  <SpaceBetween direction="vertical" size="l">
    {/* First Row: Industry and Theme */}
    <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '100px', marginRight: '10px', textAlign: 'right' }}>
          Industry:
        </div>
        <FormField
          controlId="contract-primary-industry-field"
          stretch={true}
        >
          <Input
            value={contract_primary_industry}
            onChange={({ detail }) => {
              setContract_primary_industry(detail.value);
              setIsFormChanged(true);
            }}
            onBlur={() => runValidationTasks("contract_primary_industry", contract_primary_industry)}
            disabled={false}
            readOnly={false}
            errorMessage={errors.contract_primary_industry?.errorMessage}
            hasError={errors.contract_primary_industry?.hasError}
          />
        </FormField>
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '100px', marginRight: '10px', textAlign: 'right' }}>
          Theme:
        </div>
        <FormField
          controlId="contract-theme-field"
          stretch={true}
        >
          <Input
            value={contract_theme}
            onChange={({ detail }) => {
              let value = detail.value;
              setContract_theme(value);
              setIsFormChanged(true);
              if (errors.contract_theme?.hasError) {
                runValidationTasks("contract_theme", value);
              }
              setContract_theme(value);
            }}
            onBlur={() => runValidationTasks("contract_theme", contract_theme)}
            disabled={false}
            readOnly={false}
            errorMessage={errors.contract_theme?.errorMessage}
            hasError={errors.contract_theme?.hasError}
          />
        </FormField>
      </div>
    </Grid>

    {/* Second Row: Description (full width) */}
    <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%', gap: '10px' }}>
      <div style={{ width: '100px', marginRight: '10px', textAlign: 'right', flexShrink: 0 }}>
        Description:
      </div>
      <div style={{ flex: '1 1 auto' }}> {/* Added wrapper div */}
        <FormField
          controlId="contract-description-field"
          stretch={true}
        >
          <Input
            value={contract_description}
            onChange={({ detail }) => {
              setContract_description(detail.value);
              setIsFormChanged(true);
            }}
            onBlur={() => runValidationTasks("contract_description", contract_description)}
            disabled={false}
            readOnly={false}
            errorMessage={errors.contract_description?.errorMessage}
            hasError={errors.contract_description?.hasError}
            multiline
            rows={5}
            inputMode="text"
            spellcheck={true}
          />
        </FormField>
      </div>
    </div>
  </SpaceBetween>
</Container>

<Container
  header={
    <Header
      variant="h4"
      counter={null}
      info={null}
    >
      SCA Contributions & Targets
    </Header>
  }
>
  <SpaceBetween direction="vertical" size="l">
    {/* AWS Contributions */}
    <div style={{ 
      display: 'flex', 
      alignItems: 'flex-start', 
      width: '100%',
      gap: '10px'
    }}>
      <div style={{ 
        width: '100px', 
        marginRight: '10px', 
        textAlign: 'right',
        flexShrink: 0 
      }}>
        AWS contributions:
      </div>
      <div style={{ flex: '1 1 auto' }}>
        <FormField
          controlId="contract-aws-contributions-field"
          stretch={true}
        >
          <Input
            value={contract_aws_contributions}
            onChange={({ detail }) => {
              setContract_aws_contributions(detail.value);
              setIsFormChanged(true);
            }}
            onBlur={() => runValidationTasks("contract_aws_contributions", contract_aws_contributions)}
            multiline
            rows={3}
          />
        </FormField>
      </div>
    </div>

    {/* Partner Contributions */}
    <div style={{ 
      display: 'flex', 
      alignItems: 'flex-start', 
      width: '100%',
      gap: '10px'
    }}>
      <div style={{ 
        width: '100px', 
        marginRight: '10px', 
        textAlign: 'right',
        flexShrink: 0 
      }}>
        Partner contributions:
      </div>
      <div style={{ flex: '1 1 auto' }}>
        <FormField
          controlId="contract-partner-contributions-field"
          stretch={true}
        >
          <Input
            value={contract_partner_contributions}
            onChange={({ detail }) => {
              setContract_partner_contributions(detail.value);
              setIsFormChanged(true);
            }}
            onBlur={() => runValidationTasks("contract_partner_contributions", contract_partner_contributions)}
            multiline
            rows={3}
          />
        </FormField>
      </div>
    </div>

    {/* Time Based Targets */}
    <div style={{ 
      display: 'flex', 
      alignItems: 'flex-start', 
      width: '100%',
      gap: '10px'
    }}>
      <div style={{ 
        width: '100px', 
        marginRight: '10px', 
        textAlign: 'right',
        flexShrink: 0 
      }}>
        Time based targets:
      </div>
      <div style={{ flex: '1 1 auto' }}>
        <FormField
          controlId="contract-time-based-targets-field"
          stretch={true}
        >
          <Input
            value={contract_time_based_targets}
            onChange={({ detail }) => {
              setContract_time_based_targets(detail.value);
            }}
            onBlur={() => runValidationTasks("contract_time_based_targets", contract_time_based_targets)}
            multiline
            rows={3}
          />
        </FormField>
      </div>
    </div>

    {/* Comments */}
    <div style={{ 
      display: 'flex', 
      alignItems: 'flex-start', 
      width: '100%',
      gap: '10px'
    }}>
      <div style={{ 
        width: '100px', 
        marginRight: '10px', 
        textAlign: 'right',
        flexShrink: 0 
      }}>
        Comments:
      </div>
      <div style={{ flex: '1 1 auto' }}>
        <FormField
          controlId="contract-comments-field"
          stretch={true}
        >
          <Input
            value={contract_comments}
            onChange={({ detail }) => {
              setContract_comments(detail.value);
            }}
            onBlur={() => runValidationTasks("contract_comments", contract_comments)}
            multiline
            rows={3}
          />
        </FormField>
      </div>
    </div>
  </SpaceBetween>
</Container>


      </Container>
 
    </Form>
    </form>
  );
}
