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
  const [milestones, setMilestones] = React.useState([]);
  const [scaRecord, setScaRecord] = React.useState(sca);
  const [isFormChanged, setIsFormChanged] = React.useState(false);
 
  const initialValues = {
    partner: "",
    start_date: "",
    end_date: "",
    contract_name: "",
    contract_description: "",
    contract_type: "",
    contract_status: "",
    contract_comments: "",
    contract_aws_contributions: "",
    contract_partner_contributions: "",
    contract_time_based_targets: "",
    contract_primary_industry: "",
    contract_overall_status: "",
    contract_theme: "",
  };

  // State declarations for form fields
  const [partner, setPartner] = React.useState(initialValues.partner);
  const [start_date, setStart_date] = React.useState(initialValues.start_date);
  const [end_date, setEnd_date] = React.useState(initialValues.end_date);
  const [contract_name, setContract_name] = React.useState(initialValues.contract_name);
  const [contract_description, setContract_description] = React.useState(initialValues.contract_description);
  const [contract_type, setContract_type] = React.useState(initialValues.contract_type);
  const [contract_status, setContract_status] = React.useState(initialValues.contract_status);
  const [contract_comments, setContract_comments] = React.useState(initialValues.contract_comments);
  const [contract_aws_contributions, setContract_aws_contributions] = React.useState(initialValues.contract_aws_contributions);
  const [contract_partner_contributions, setContract_partner_contributions] = React.useState(initialValues.contract_partner_contributions);
  const [contract_time_based_targets, setContract_time_based_targets] = React.useState(initialValues.contract_time_based_targets);
  const [contract_primary_industry, setContract_primary_industry] = React.useState(initialValues.contract_primary_industry);
  const [contract_overall_status, setContract_overall_status] = React.useState( initialValues.contract_overall_status);
  const [contract_theme, setContract_theme] = React.useState( initialValues.contract_theme);

// First useEffect for checking SCA data
//React.useEffect(() => {
 // if (!sca) {
  //  console.log('Required SCA data is missing, redirecting to list view');
  //  navigate('/scalist', { replace: true });
  //  return; // Early return if no SCA data
 // }
//}, [sca, navigate]);

// Second useEffect for loading milestones
React.useEffect(() => {
  const loadMilestones = async () => {
    if (!sca?.id) return;

    try {
      const milestoneSubscription = client.models.Milestone.observeQuery({
        filter: { scaId: { eq: sca.id } }
      }).subscribe({
        next: ({ items }) => {
          setMilestones(items);
        },
        error: (error) => {
          console.error('Error fetching milestones:', error);
        }
      });

      return () => {
        milestoneSubscription.unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up milestone subscription:', error);
    }
  };

  loadMilestones();
}, [sca?.id]);

// If no SCA data, return null
if (!sca) {
  return null;
}
  const handleScaClick = (item) => {
    event.preventDefault(); // Prevent any default form submission
    const scaData = {
      sca: item,  // Pass the entire SCA item
      milestones: item.milestones // Pass the milestones if they exist
    };
    navigate('/scamilestonelist', { 
      state: scaData,
      replace: true // This prevents the back button from returning immediately
    });
};
 

  
  const [errors, setErrors] = React.useState({});

  // Effect to reset state values when scaRecord changes
  React.useEffect(() => {
    const resetStateValues = () => {
      const cleanValues = scaRecord
        ? { ...initialValues, ...scaRecord }
        : initialValues;
      setPartner(cleanValues.partner || "");
      setStart_date(cleanValues.start_date || "");
      setEnd_date(cleanValues.end_date || "");
      setContract_name(cleanValues.contract_name || "");
      setContract_description(cleanValues.contract_description || "");
      setContract_type(cleanValues.contract_type || "");
      setContract_status(cleanValues.contract_status || "");
      setContract_comments(cleanValues.contract_comments || "");
      setContract_aws_contributions(cleanValues.contract_aws_contributions || "");
      setContract_partner_contributions(cleanValues.contract_partner_contributions || "");
      setContract_time_based_targets(cleanValues.contract_time_based_targets || "");
      setContract_primary_industry(cleanValues.contract_primary_industry || "");
      setContract_overall_status(cleanValues.contract_overall_status || "");
      setContract_theme(cleanValues.contract_theme || "");
      setIsFormChanged(false);
    };
    resetStateValues();
  }, [scaRecord]);

  // If no SCA data, return null
  if (!sca) {
    return null;
  }
/*
  React.useEffect(() => {
    const queryData = async () => {
      const record = idProp
        ? (
            await client.graphql({
              query: getSca.replaceAll("__typename", ""),
              variables: { id: idProp },
            })
          )?.data?.getSca
        : scaModelProp;
      setScaRecord(record);
    };
    queryData();
  }, [idProp, scaModelProp]);
  */
  //React.useEffect(resetStateValues, [scaRecord]);
  const validations = {
    partner: [],
    start_date: [],
    end_date: [],
    contract_name: [],
    contract_description: [],
    contract_type: [],
    contract_status: [],
    contract_comments: [],
    contract_aws_contributions: [],
    contract_partner_contributions: [],
    contract_time_based_targets: [],
    contract_primary_industry: [],
    contract_overall_status: [],
    contract_theme: [],
  };
  const runValidationTasks = async (
    fieldName,
    currentValue,
    getDisplayValue
  ) => {
    const value =
      currentValue && getDisplayValue
        ? getDisplayValue(currentValue)
        : currentValue;
    let validationResponse = validateField(value, validations[fieldName]);
    const customValidator = fetchByPath(onValidate, fieldName);
    if (customValidator) {
      validationResponse = await customValidator(value, validationResponse);
    }
    setErrors((errors) => ({ ...errors, [fieldName]: validationResponse }));
    return validationResponse;
  };
  return (
  <form onSubmit={async (event) => {
    event.preventDefault();
    let modelFields = {
      partner: partner || "",
      start_date: start_date || "",
      end_date: end_date || "",
      contract_name: contract_name || "",
      contract_description: contract_description || "",
      contract_type: contract_type || "",
      contract_status: contract_status || "",
      contract_comments: contract_comments || "",
      contract_aws_contributions: contract_aws_contributions || "",
      contract_partner_contributions: contract_partner_contributions || "",
      contract_time_based_targets: contract_time_based_targets || "",
      contract_primary_industry: contract_primary_industry || "",
      contract_overall_status: contract_overall_status || "",
      contract_theme: contract_theme || "",
    };
    const validationResponses = await Promise.all(
      Object.keys(validations).reduce((promises, fieldName) => {
        if (Array.isArray(modelFields[fieldName])) {
          promises.push(
            ...modelFields[fieldName].map((item) =>
              runValidationTasks(fieldName, item)
            )
          );
          return promises;
        }
        promises.push(
          runValidationTasks(fieldName, modelFields[fieldName])
        );
        return promises;
      }, [])
    );
    if (validationResponses.some((r) => r.hasError)) {
      return;
    }
    if (onSubmit) {
      modelFields = onSubmit(modelFields);
    }
    try {
      Object.entries(modelFields).forEach(([key, value]) => {
        if (typeof value === "string" && value.trim() === "") {
          modelFields[key] = "";
        }
      });
      await client.graphql({
        query: updateSca.replaceAll("__typename", ""),
        variables: {
          input: {
            id: scaRecord.id,
            ...modelFields,
          },
        },
      });
      setScaRecord({
        ...scaRecord,
        ...modelFields
      });
      if (onSuccess) {
        onSuccess(modelFields);
      }
      setIsFormChanged(false);
    } catch (err) {
      if (onError) {
        const messages = err.errors.map((e) => e.message).join("\n");
        onError(modelFields, messages);
      }
    }
    }}
  >
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
            if (!scaRecord) {
              console.log('scaRecord is null');
              return;
            }
            //console.log('Navigating with scaRecord:', scaRecord);
            //console.log('Current milestones:', milestones);
            navigate('/scamilestonelist', { 
              state: serializeData({ 
                sca: scaRecord,
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
      {scaRecord?.partner && scaRecord?.contract_name 
        ? `${scaRecord.partner} - ${scaRecord.contract_name}`
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
              let value = detail.value;
              setContract_primary_industry(value);
              setIsFormChanged(true);
              if (onChange) {
                const modelFields = {
                  partner,
                  contract_name,
                  contract_type,
                  contract_status,
                  start_date,
                  end_date,
                  contract_primary_industry: value,
                  contract_theme,
                  contract_description,
                  contract_aws_contributions,
                  contract_partner_contributions,
                  contract_time_based_targets,
                  contract_comments,
                };
                const result = onChange(modelFields);
                value = result?.contract_primary_industry ?? value;
              }
              if (errors.contract_primary_industry?.hasError) {
                runValidationTasks("contract_primary_industry", value);
              }
              setContract_primary_industry(value);
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
              if (onChange) {
                const modelFields = {
                  partner,
                  contract_name,
                  contract_type,
                  contract_status,
                  start_date,
                  end_date,
                  contract_primary_industry,
                  contract_theme: value,
                  contract_description,
                  contract_aws_contributions,
                  contract_partner_contributions,
                  contract_time_based_targets,
                  contract_comments,
                };
                const result = onChange(modelFields);
                value = result?.contract_theme ?? value;
              }
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
